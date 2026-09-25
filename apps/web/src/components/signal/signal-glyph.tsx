/** The stray signal: a dotted beacon with an ember core and rings pulsing outward. */
export function SignalGlyph({ size = 56, className }: { size?: number; className?: string }) {
  const dots = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    return [32 + Math.cos(a) * 22, 32 + Math.sin(a) * 22] as const;
  });
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden fill="none">
      <circle cx="32" cy="32" r="8" stroke="var(--color-accent)" strokeOpacity="0.6" className="signal-ring" />
      <circle cx="32" cy="32" r="8" stroke="var(--color-accent)" strokeOpacity="0.6" className="signal-ring signal-ring-2" />
      <g className="signal-orbit">
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.4 : 0.9} fill="var(--color-fg)" fillOpacity={i % 3 === 0 ? 0.9 : 0.45} />
        ))}
      </g>
      <circle cx="32" cy="32" r="3.2" fill="var(--color-accent)" />
    </svg>
  );
}
