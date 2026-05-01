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
  if (route.path.length === 0) return <span className="rr-same">同駅</span>;

  const stops = condenseRoute(route.path, route.lines);

  return (
    <span className="route-path">
      {stops.map((stop, i) => (
        <span key={i} className="route-segment">
          <span className="route-station">{stop.station}</span>
          {stop.line && (
            <span className="route-via">
              <span className="route-line-name">({stop.line})</span>
              <span className="route-arr">›</span>
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
