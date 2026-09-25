import { TOPIC_LABELS } from "@al/stray-signals/schema";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { assignSignal, findSignal, signalCount, signalVersion } from "@/lib/signals";

export const dynamic = "force-dynamic";

const COOKIE = "al_signal";
const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|headless/i;

/**
 * Hands the visitor their stray signal. A visitor keeps the same essay for the week
 * (cookie); a new visitor takes the next unused slot in the rotation.
 */
export async function GET(req: NextRequest) {
  if (BOTS.test(req.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });

  const version = signalVersion();
  const jar = await cookies();
  const [cookieVersion, cookieId, cookieOrdinal] = (jar.get(COOKIE)?.value ?? "").split(".");

  let assigned = cookieVersion === version && cookieId ? findSignal(cookieId) : null;
  let ordinal = Number(cookieOrdinal) || 0;

  if (!assigned) {
    const next = await assignSignal().catch(() => null);
    if (!next) return new NextResponse(null, { status: 204 });
    assigned = next.signal;
    ordinal = next.ordinal;
  }

  const res = NextResponse.json(
    {
      ...assigned,
      topicLabel: TOPIC_LABELS[assigned.topic],
      ordinal,
      total: signalCount(),
      version,
    },
    { headers: { "cache-control": "private, no-store" } },
  );
  res.cookies.set(COOKIE, `${version}.${assigned.id}.${ordinal}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 8,
    path: "/",
  });
  return res;
}
