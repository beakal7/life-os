import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable strict mode for better React practices
  reactStrictMode: true,

  // Future: add Supabase image domains here
  // images: { remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }] },

  // Environment variable validation — all NEXT_PUBLIC_* vars are safe to expose;
  // server-only vars (SUPABASE_SERVICE_ROLE_KEY, etc.) must never have the prefix.
  env: {},
};

export default nextConfig;
