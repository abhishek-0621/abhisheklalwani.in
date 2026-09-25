import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Deterministic dotted field, echoing the site's particle scene.
const dots = Array.from({ length: 140 }, (_, i) => {
  const a = i * 2.39996;
  const r = 12 * Math.sqrt(i);
  return { x: 900 + Math.cos(a) * r * 1.6, y: 315 + Math.sin(a) * r, s: i % 9 === 0 ? 7 : 4, hot: i % 23 === 0 };
});

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0a0a0a", color: "#ededed", padding: 80, position: "relative" }}>
        {dots.map((d, i) => (
          <div
            key={i}
            style={{ position: "absolute", left: d.x, top: d.y, width: d.s, height: d.s, borderRadius: 999, background: d.hot ? "#ff6a3d" : "rgba(237,237,237,0.55)" }}
          />
        ))}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#8a8a8a", textTransform: "uppercase" }}>{`${site.role} — Pune, IN`}</div>
          <div style={{ fontSize: 120, lineHeight: 1, marginTop: 24, letterSpacing: -4 }}>Abhishek</div>
          <div style={{ fontSize: 120, lineHeight: 1, letterSpacing: -4, display: "flex" }}>
            Lalwani<span style={{ color: "#ff6a3d" }}>.</span>
          </div>
          <div style={{ fontSize: 28, color: "#8a8a8a", marginTop: 32 }}>Knowledge graphs · Agentic workflows · Production RAG</div>
        </div>
      </div>
    ),
    size,
  );
}
