type FairnessRingProps = {
  score: number;
};

export function FairnessRing({ score }: FairnessRingProps) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color = score >= 80 ? 'var(--color-ok)' : score >= 60 ? 'var(--color-warn)' : 'var(--color-bad)';
  return (
    <div className="relative size-12">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--color-line)" strokeWidth="3" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          transform="rotate(-90 24 24)" />
      </svg>
      <div className="absolute inset-0 grid place-items-center font-num font-semibold text-sm">{score}</div>
    </div>
  );
}
