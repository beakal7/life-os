// Cloudflare Pages Function: POST /api/ai
//
// Verifies the caller's Supabase access token, then proxies the request to the
// Google Gemini API using the server-side secret GEMINI_API_KEY. The Gemini key
// never reaches the browser.
//
// Env (Cloudflare Pages → Settings → Variables and Secrets):
//   GEMINI_API_KEY                 (secret, required for AI features)
//   GEMINI_MODEL                   (optional, default gemini-2.5-flash)
//   NEXT_PUBLIC_SUPABASE_URL       (already set for the build)
//   NEXT_PUBLIC_SUPABASE_ANON_KEY  (publishable key, already set)

interface Env {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
}

interface Ctx {
  request: Request;
  env: Env;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 30;
const MAX_CHARS = 24000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

async function verifyUser(request: Request, env: Env): Promise<{ id: string; email?: string } | null> {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  const url = env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const res = await fetch(`${url}/auth/v1/user`, { headers: { authorization: auth, apikey: key }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;
  const user = (await res.json()) as { id?: string; email?: string };
  return user.id ? { id: user.id, email: user.email } : null;
}

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return json({ error: "not_configured", message: "Authentication is not configured for the AI service." }, 503);
  }
  let user;
  try { user = await verifyUser(request, env); }
  catch { return json({ error: "auth_unavailable", message: "Sign-in verification is temporarily unavailable. Try again." }, 503); }
  if (!user) return json({ error: "unauthorized", message: "Sign in again." }, 401);

  if (!env.GEMINI_API_KEY) {
    return json({ error: "not_configured", message: "AI is not configured yet." }, 503);
  }

  let body: { system?: string; messages?: ChatMessage[]; json?: boolean };
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request", message: "Invalid JSON body." }, 400);
  }

  if (!body || typeof body !== "object" || !Array.isArray(body.messages)
    || (body.system !== undefined && typeof body.system !== "string")
    || (body.json !== undefined && typeof body.json !== "boolean")
    || body.messages.some((m) => !m || typeof m !== "object"
      || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string")) {
    return json({ error: "bad_request", message: "Expected messages with a role and text content." }, 400);
  }
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_MESSAGES);
  if (!messages.length) return json({ error: "bad_request", message: "No messages." }, 400);
  const total = messages.reduce((n, m) => n + m.content.length, 0) + (body.system?.length ?? 0);
  if (total > MAX_CHARS * 4) return json({ error: "too_large", message: "Request is too large." }, 413);

  const model = env.GEMINI_MODEL || "gemini-2.5-flash";
  const payload = {
    systemInstruction: body.system ? { parts: [{ text: body.system.slice(0, MAX_CHARS) }] } : undefined,
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content.slice(0, MAX_CHARS) }],
    })),
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 2048,
      ...(body.json ? { responseMimeType: "application/json" } : {}),
    },
  };

  let res: Response;
  try {
  res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45000),
    }
  );
  } catch {
    return json({ error: "upstream", message: "The AI service timed out or could not be reached. Try again." }, 504);
  }

  if (!res.ok) {
    const status = res.status === 429 ? 429 : 502;
    const message =
      res.status === 429
        ? "Gemini free-tier rate limit reached. Try again in a minute."
        : `Gemini error (${res.status}).`;
    return json({ error: "upstream", message }, status);
  }

  let data: {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  try { data = await res.json(); }
  catch { return json({ error: "upstream", message: "The AI service returned an invalid response." }, 502); }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text.trim()) return json({ error: "empty_response", message: "The AI returned no text. Try rephrasing your request." }, 502);
  return json({ text, model });
};

export const onRequestGet = async (): Promise<Response> =>
  json({ error: "method_not_allowed", message: "Use POST." }, 405);
