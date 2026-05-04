type StationSearchLinkProps = {
  station: string;
  className?: string;
  size?: 'sm' | 'md';
};

function buildSearchUrl(station: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${station}駅`)}`;
}

export function StationSearchLink({ station, className, size = 'sm' }: StationSearchLinkProps) {
  if (!station) return null;
  const dim = size === 'md' ? 13 : 11;
  return (
    <a
      href={buildSearchUrl(station)}
      target="_blank"
      rel="noopener noreferrer"
      title={`${station}駅 を Google マップで検索`}
      onClick={(e) => e.stopPropagation()}
      className={
        className ??
        'inline-flex items-center justify-center align-middle text-fg-3 hover:text-accent-fg transition-colors'
      }
      aria-label={`${station}駅 を Google マップで検索`}
    >
      <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
    </a>
  );
}
