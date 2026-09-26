import { NextResponse, type NextRequest } from "next/server";

/**
 * abhisheklalwani.in/graphmind/* is GraphMind itself, running on Abhishek's Mac and reached
 * through a Tailscale Funnel (GRAPHMIND_ORIGIN). Page loads first ping the Mac's health
 * endpoint; if it doesn't answer quickly, the visitor gets the "offline" page instead of an
 * error. Assets and API calls go straight through, so the check costs one round trip per page.
 */
const ORIGIN = process.env.GRAPHMIND_ORIGIN?.replace(/\/+$/, "");
const HEALTH_TIMEOUT_MS = 1500;

export async function proxy(req: NextRequest) {
  const isPageLoad =
    req.method === "GET" && (req.headers.get("sec-fetch-mode") === "navigate" || (req.headers.get("accept") ?? "").includes("text/html"));

  const offline = () =>
    NextResponse.rewrite(new URL("/graphmind-offline", req.url), { headers: { "cache-control": "no-store" } });

  if (!ORIGIN) {
    return isPageLoad ? offline() : NextResponse.json({ error: "GraphMind is offline" }, { status: 503 });
  }

  if (isPageLoad && !(await isOnline())) return offline();

  const target = new URL(req.nextUrl.pathname + req.nextUrl.search, ORIGIN);
  return NextResponse.rewrite(target);
}

async function isOnline() {
  try {
    const res = await fetch(`${ORIGIN}/graphmind/health`, {
      cache: "no-store",
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
