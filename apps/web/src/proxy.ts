import { NextResponse, type NextRequest } from "next/server";

/**
 * abhisheklalwani.in/graphmind/* is GraphMind itself, running on Abhishek's Mac and reached
 * through a Tailscale Funnel (GRAPHMIND_ORIGIN). Page loads first ping the Mac's health
 * endpoint; if it doesn't answer quickly, the visitor gets the "offline" page instead of an
 * error. Assets and API calls go straight through, so the check costs one round trip per page.
 *
 * Every forwarded request carries a shared secret (GRAPHMIND_PROXY_SECRET). The Mac rejects
 * anything without it, so the public ts.net address is useless on its own: the only way in is
 * through this site. The visitor's real IP travels in a header the Mac can trust for the same
 * reason (it is only honoured alongside the secret), so per-visitor rate limits keep working.
 */
const ORIGIN = process.env.GRAPHMIND_ORIGIN?.replace(/\/+$/, "");
const SECRET = process.env.GRAPHMIND_PROXY_SECRET;
const HEALTH_TIMEOUT_MS = 1500;

export async function proxy(req: NextRequest) {
  const isPageLoad =
    req.method === "GET" && (req.headers.get("sec-fetch-mode") === "navigate" || (req.headers.get("accept") ?? "").includes("text/html"));

  const offline = () =>
    NextResponse.rewrite(new URL("/graphmind-offline", req.url), { headers: { "cache-control": "no-store" } });

  // Both are required: without the secret the Mac would (rightly) refuse every request.
  if (!ORIGIN || !SECRET) {
    return isPageLoad ? offline() : NextResponse.json({ error: "GraphMind is offline" }, { status: 503 });
  }

  if (isPageLoad && !(await isOnline())) return offline();

  const headers = new Headers(req.headers);
  headers.set("x-graphmind-proxy", SECRET);
  headers.set("x-graphmind-client-ip", clientIp(req));
  const target = new URL(req.nextUrl.pathname + req.nextUrl.search, ORIGIN);
  return NextResponse.rewrite(target, { request: { headers } });
}

/** Vercel sets x-forwarded-for; its first entry is the visitor. */
function clientIp(req: NextRequest) {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

async function isOnline() {
  try {
    const res = await fetch(`${ORIGIN}/graphmind/health`, {
      cache: "no-store",
      headers: { "x-graphmind-proxy": SECRET! },
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const config = {
  matcher: ["/graphmind", "/graphmind/:path*"],
};
