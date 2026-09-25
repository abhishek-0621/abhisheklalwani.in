import { config } from "../config";

export class HttpError extends Error {
  constructor(
    public status: number,
    public url: string,
  ) {
    super(`HTTP ${status} for ${url}`);
  }
}

/** GET with timeout and retry on 429/5xx/network errors. Never throws on 404 — returns null. */
export async function get(url: string, { timeoutMs = 15_000, retries = 2, accept = "*/*" } = {}): Promise<Response | null> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": config.userAgent, accept },
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.status === 404 || res.status === 410) return null;
      if (res.ok) return res;
      if ((res.status === 429 || res.status >= 500) && attempt < retries) {
        const wait = Number(res.headers.get("retry-after")) * 1000 || 800 * 2 ** attempt;
        await sleep(Math.min(wait, 10_000));
        continue;
      }
      throw new HttpError(res.status, url);
    } catch (err) {
      if (err instanceof HttpError) throw err;
      if (attempt < retries) {
        await sleep(800 * 2 ** attempt);
        continue;
      }
      throw err;
    }
  }
}

export async function getText(url: string, accept?: string) {
  const res = await get(url, { accept });
  return res ? res.text() : null;
}

export async function getJson<T>(url: string): Promise<T | null> {
  const res = await get(url, { accept: "application/json" });
  if (!res) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
