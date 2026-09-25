import { TOPIC_LABELS } from "@al/stray-signals/schema";
import { NextResponse, type NextRequest } from "next/server";
import { pickSignal, signalVersion } from "@/lib/signals";

export const dynamic = "force-dynamic";

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|headless/i;

/**
 * GET /api/signal?s=<visitor seed>&n=<how many they have caught>
 * Stateless: the visitor's browser keeps its seed and counter; this just resolves them.
 */
export function GET(req: NextRequest) {
  if (BOTS.test(req.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });

  const params = req.nextUrl.searchParams;
  const rawSeed = params.get("s") ?? "";
  const seed = /^[a-z0-9]{6,24}$/i.test(rawSeed) ? rawSeed : Math.random().toString(36).slice(2, 12);
  const rawN = Number(params.get("n"));
  const n = Number.isInteger(rawN) && rawN >= 0 && rawN < 1_000_000 ? rawN : 0;

  const picked = pickSignal(seed, n);
  if (!picked) return new NextResponse(null, { status: 204 });

  return NextResponse.json(
    { ...picked.signal, topicLabel: TOPIC_LABELS[picked.signal.topic], version: signalVersion() },
    { headers: { "cache-control": "private, no-store" } },
  );
}
