import type { Route } from '@/lib/stations';

function condenseRoute(path: string[], lines: string[]): { station: string; line?: string }[] {
  if (path.length === 0) return [];
  if (path.length === 1) return [{ station: path[0] }];

  const stops: { station: string; line?: string }[] = [];
  let i = 0;
  while (i < path.length - 1) {
    const line = lines[i];
    let j = i + 1;
    while (j < path.length - 1 && lines[j] === line) j++;
    stops.push({ station: path[i], line });
    i = j;
  }
  stops.push({ station: path[path.length - 1] });
  return stops;
}

export function RoutePath({ route }: { route: Route }) {
  if (route.path.length === 0) return <span className="text-fg-3 text-[11px]">同駅</span>;

  const stops = condenseRoute(route.path, route.lines);

  return (
    <span className="flex flex-wrap items-center gap-[3px] flex-1 min-w-0">
      {stops.map((stop, i) => (
        <span key={i} className="flex items-center gap-[3px]">
          <span className="font-bold text-fg text-xs whitespace-nowrap">{stop.station}</span>
          {stop.line && (
            <span className="flex items-center gap-[2px]">
              <span className="text-accent-fg text-[10px] whitespace-nowrap">({stop.line})</span>
              <span className="text-fg-3 text-[11px]">›</span>
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
