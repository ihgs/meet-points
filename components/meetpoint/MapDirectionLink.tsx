type MapDirectionLinkProps = {
  origin: string;
  destination: string;
  className?: string;
};

function buildMapUrl(origin: string, destination: string): string {
  const o = encodeURIComponent(`${origin}駅`);
  const d = encodeURIComponent(`${destination}駅`);
  return `https://www.google.com/maps/dir/?api=1&travelmode=transit&origin=${o}&destination=${d}`;
}

export function MapDirectionLink({ origin, destination, className }: MapDirectionLinkProps) {
  if (!origin || !destination || origin === destination) return null;
  return (
    <a
      href={buildMapUrl(origin, destination)}
      target="_blank"
      rel="noopener noreferrer"
      title={`${origin} → ${destination} の経路を Google マップで開く`}
      onClick={(e) => e.stopPropagation()}
      className={
        className ??
        'inline-flex items-center gap-[3px] text-[10px] text-fg-3 hover:text-accent-fg whitespace-nowrap underline-offset-2 hover:underline'
      }
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <span>経路</span>
    </a>
  );
}
