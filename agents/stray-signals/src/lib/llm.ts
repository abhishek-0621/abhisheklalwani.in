import { Ollama, type Message } from "ollama";
import { z } from "zod";
import { config } from "../config";

const client = new Ollama({ host: config.ollamaHost });

export type Turn = Message;

/**
 * One structured call to the local model. The JSON schema is enforced by Ollama's
 * constrained decoding; zod re-validates so a malformed reply can never leak through.
 * Returns the parsed value plus the transcript, so callers can ask a follow-up.
 */
export async function generate<S extends z.ZodType>(
  schema: S,
  system: string,
  turns: Turn[],
): Promise<{ value: z.infer<S>; transcript: Turn[] }> {
  const messages: Turn[] = [{ role: "system", content: system }, ...turns];
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await client.chat({
      model: config.model,
      messages,
      format: z.toJSONSchema(schema),
      stream: false,
      think: false,
      keep_alive: "15m",
      options: { temperature: 0, num_ctx: 8192 },
    });
    const parsed = schema.safeParse(safeJson(res.message.content));
    if (parsed.success) return { value: parsed.data, transcript: [...turns, res.message] };
  }
  throw new Error("Model returned invalid JSON twice");
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}

/** Fails fast with a clear message when Ollama is down or the model is missing. */
export async function assertModelReady() {
  let models: string[];
  try {
    models = (await client.list()).models.map((m) => m.name);
  } catch {
    throw new Error(`Ollama is not reachable at ${config.ollamaHost}. Start it with \`ollama serve\` (or open the Ollama app).`);
  }
  if (!models.includes(config.model)) {
    throw new Error(`Model ${config.model} is not installed. Run \`ollama pull ${config.model}\` or set STRAY_SIGNALS_MODEL. Installed: ${models.join(", ")}`);
  }
}
