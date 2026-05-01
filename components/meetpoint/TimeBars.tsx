import type { MemberRoute } from '@/lib/stations';

type TimeBarsProps = {
  routes: MemberRoute[];
  max: number;
};

export function TimeBars({ routes, max }: TimeBarsProps) {
  return (
    <div className="time-bars">
      {routes.map((r, i) => {
        const w = (r.route.minutes / max) * 100;
        return (
          <div key={i} className="tb-row">
            <span className="tb-label">{i + 1}</span>
            <div className="tb-track">
              <div className="tb-fill" style={{ width: `${w}%` }} />
            </div>
            <span className="tb-val">{r.route.minutes}<small>分</small></span>
          </div>
        );
      })}
    </div>
  );
}
