// Cyber engineering roadmap (static content). Progress is stored per item key
// in the Supabase table `cyber_skills`.

export type SkillStatus = "todo" | "learning" | "done";

export interface RoadmapItem {
  key: string;
  name: string;
  hint: string;
}

export interface RoadmapArea {
  id: string;
  name: string;
  items: RoadmapItem[];
}

export const ROADMAP: RoadmapArea[] = [
  { id: "net", name: "Networking", items: [
    { key: "net.osi", name: "OSI / TCP-IP models", hint: "Layers, encapsulation, ports & protocols" },
    { key: "net.subnet", name: "Subnetting & routing", hint: "CIDR, VLANs, NAT, routing basics" },
    { key: "net.dns", name: "DNS, HTTP(S), TLS", hint: "How the web works, certificates, handshakes" },
    { key: "net.wireshark", name: "Packet analysis (Wireshark/tcpdump)", hint: "Read pcaps, spot anomalies" },
  ]},
  { id: "linux", name: "Linux", items: [
    { key: "linux.cli", name: "Command line fluency", hint: "Filesystem, permissions, processes, grep/awk/sed" },
    { key: "linux.admin", name: "System administration", hint: "Users, services (systemd), logs, SSH hardening" },
    { key: "linux.priv", name: "Linux privilege escalation", hint: "SUID, cron, PATH, capabilities" },
  ]},
  { id: "script", name: "Python & Bash", items: [
    { key: "script.bash", name: "Bash scripting", hint: "Automate recon and log parsing" },
    { key: "script.python", name: "Python for security", hint: "requests, sockets, parsing, boto3/azure SDK" },
    { key: "script.tools", name: "Build your own tools", hint: "Port scanner, log analyzer, IAM auditor" },
  ]},
  { id: "cloud", name: "Cloud security (AWS / Azure)", items: [
    { key: "cloud.iam", name: "IAM & identity", hint: "Least privilege, roles, Entra ID, conditional access" },
    { key: "cloud.aws", name: "AWS security services", hint: "GuardDuty, Security Hub, CloudTrail, Config" },
    { key: "cloud.azure", name: "Azure security services", hint: "Defender for Cloud, Sentinel, Key Vault, Policy" },
    { key: "cloud.posture", name: "Cloud posture & IaC scanning", hint: "CSPM, Terraform, Checkov/tfsec" },
  ]},
  { id: "siem", name: "SIEM & detection", items: [
    { key: "siem.logs", name: "Log sources & normalization", hint: "Windows events, Sysmon, cloud audit logs" },
    { key: "siem.queries", name: "Query languages (KQL / SPL)", hint: "Hunt and build detections" },
    { key: "siem.attack", name: "MITRE ATT&CK mapping", hint: "Map detections to techniques" },
    { key: "siem.ir", name: "Incident response", hint: "Triage, containment, playbooks, write-ups" },
  ]},
  { id: "pentest", name: "Pentesting", items: [
    { key: "pentest.recon", name: "Recon & enumeration", hint: "nmap, gobuster, OSINT" },
    { key: "pentest.web", name: "Web app attacks (OWASP Top 10)", hint: "Burp Suite, SQLi, XSS, SSRF, auth flaws" },
    { key: "pentest.win", name: "Windows & Active Directory", hint: "Kerberoasting, BloodHound, priv-esc" },
    { key: "pentest.report", name: "Reporting", hint: "Clear findings, risk ratings, remediation" },
  ]},
  { id: "certs", name: "Certification path", items: [
    { key: "cert.secplus", name: "CompTIA Security+", hint: "Foundation; start here" },
    { key: "cert.cysa", name: "CompTIA CySA+", hint: "Blue team / SOC analytics" },
    { key: "cert.az500", name: "Microsoft AZ-500", hint: "Azure security engineer" },
    { key: "cert.oscp", name: "OffSec OSCP", hint: "Hands-on offensive; long-term goal" },
  ]},
];

export const ALL_ITEMS = ROADMAP.flatMap((a) => a.items.map((i) => ({ ...i, area: a.name })));

export const PLATFORMS = ["TryHackMe", "HackTheBox", "Course", "Reading", "Cert study", "Project", "Other"] as const;

export interface CyberLog {
  id: string;
  platform: string;
  title: string;
  minutes: number;
  skill_key: string | null;
  notes: string | null;
  date: string;
}

export interface CyberState {
  skills: Record<string, SkillStatus>;
  logs: CyberLog[];
  workStart: string;
  workEnd: string;
  weeklyTargetHours: number;
  planningConstraints: string;
}

/** Monday-start week key range: returns ISO date (YYYY-MM-DD) of this week's Monday. */
export function weekStart(d = new Date()): string {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return x.toLocaleDateString("en-CA");
}

/** Consecutive days (ending today or yesterday) with at least one study log. */
export function studyStreak(logs: CyberLog[]): number {
  const days = new Set(logs.filter((l) => l.minutes > 0).map((l) => l.date));
  const d = new Date();
  if (!days.has(d.toLocaleDateString("en-CA"))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(d.toLocaleDateString("en-CA"))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function minutesThisWeek(logs: CyberLog[]): number {
  const start = weekStart();
  return logs.filter((l) => l.date >= start && l.date <= new Date().toLocaleDateString("en-CA")).reduce((n, l) => n + l.minutes, 0);
}
