import { Redis } from "@upstash/redis";
import type { Signal, SignalFile } from "@al/stray-signals/schema";
import data from "@/content/signals.json";

const file = data as SignalFile;

/**
 * Rotation: a shared counter walks a seeded shuffle of the weekly list.
 * Visitor n gets permutation(version, cycle)[n mod len], so nobody repeats a link until
 * the whole list has been handed out; then a fresh shuffle starts (cycle + 1).
 * Nothing but one integer per week is stored.
 */
function permutation(len: number, seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  let s = h >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const idx = Array.from({ length: len }, (_, i) => i);
  for (let i = len - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

/** Next position in the rotation. Without Redis (local dev) it falls back to random. */
async function nextTicket(): Promise<number> {
  if (!redis) return Math.floor(Math.random() * 1e9);
  const key = `stray-signals:${file.version}:cursor`;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, 60 * 60 * 24 * 21);
  return n - 1;
}

export const signalVersion = () => file.version;
export const signalCount = () => file.items.length;
export const findSignal = (id: string) => file.items.find((s) => s.id === id) ?? null;

export async function assignSignal(): Promise<{ signal: Signal; ordinal: number } | null> {
  const len = file.items.length;
  if (!len) return null;
  const ticket = await nextTicket();
  const cycle = Math.floor(ticket / len);
  const pos = ticket % len;
  const index = permutation(len, `${file.version}:${cycle}`)[pos];
  return { signal: file.items[index], ordinal: pos + 1 };
}
