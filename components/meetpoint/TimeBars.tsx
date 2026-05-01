import type { MemberRoute } from '@/lib/stations';

type TimeBarsProps = {
  routes: MemberRoute[];
  max: number;
};

export function TimeBars({ routes, max }: TimeBarsProps) {
  return (
    <div className="flex flex-col gap-1">
      {routes.map((r, i) => {
        const w = (r.route.minutes / max) * 100;
        return (
          <div key={i} className="grid grid-cols-[24px_1fr_56px] gap-2.5 items-center">
            <span className="font-num text-[11px] text-fg-3 text-center">{i + 1}</span>
            <div className="h-[18px] bg-bg-soft rounded overflow-hidden">
              <div className="h-full bg-accent rounded transition-[width]" style={{ width: `${w}%` }} />
            </div>
            <span className="font-num text-xs text-right text-fg-2">
              {r.route.minutes}<small className="text-fg-3 ml-px">分</small>
            </span>
          </div>
        );
      })}
    </div>
  );
}
