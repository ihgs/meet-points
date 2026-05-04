import type { SearchResult } from '@/lib/stations';
import { TimeBars } from './TimeBars';
import { FairnessRing } from './FairnessRing';
import { RoutePath } from './RoutePath';
import { MapDirectionLink } from './MapDirectionLink';

type ResultCardDetailProps = {
  result: SearchResult;
  rank: number;
  maxTime: number;
  style?: React.CSSProperties;
};

export function ResultCardDetail({ result, rank, maxTime, style }: ResultCardDetailProps) {
  return (
    <div
      className="bg-card border border-line rounded-lg p-[18px] transition-colors hover:border-line-2 animate-card-in"
      style={style}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-[11px] text-fg-3 tracking-[0.06em] uppercase mb-0.5">第{rank}位</div>
          <h4 className="m-0 text-[22px] font-semibold tracking-tight">
            {result.candName}<span className="text-fg-3 font-normal text-[13px] ml-px">駅</span>
          </h4>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <FairnessRing score={result.fairness} />
          <div className="text-[10px] text-fg-3 uppercase tracking-[0.06em]">公平性</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-px bg-line border border-line rounded-sm overflow-hidden mb-4">
        {[
          { v: result.total, u: '分', l: '合計所要時間' },
          { v: Math.round(result.avg), u: '分', l: '平均' },
          { v: `¥${result.totalFare}`, u: '', l: '合計運賃' },
          { v: result.maxTransfers, u: '回', l: '最大乗換' },
        ].map(({ v, u, l }) => (
          <div key={l} className="bg-card p-3 text-center">
            <div className="font-num text-lg font-semibold tracking-tight">
              {v}{u && <small className="text-[11px] text-fg-3 ml-px">{u}</small>}
            </div>
            <div className="text-[10px] text-fg-3 uppercase tracking-[0.04em] mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      <div className="mb-[14px]">
        <div className="text-[11px] text-fg-3 uppercase tracking-[0.06em] mb-1.5">メンバー別所要時間</div>
        <TimeBars routes={result.routes} max={maxTime} />
      </div>

      <div className="mb-[14px]">
        <div className="text-[11px] text-fg-3 uppercase tracking-[0.06em] mb-1.5">経路</div>
        <div className="flex flex-col gap-1">
          {result.routes.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-fg-2 py-1 flex-wrap">
              <span className="font-num text-[10px] bg-soft px-1.5 py-0.5 rounded-[3px] text-fg-3">{i + 1}人目</span>
              <RoutePath route={r.route} />
              <span className="text-fg-3 font-num text-[11px] ml-auto whitespace-nowrap">{r.route.minutes}分・¥{r.route.fare}・乗換{r.route.transfers}回</span>
              <MapDirectionLink origin={r.route.path[0] ?? ''} destination={result.candName} />
            </div>
          ))}
        </div>
      </div>

      {result.tags.length > 0 && (
        <div>
          <div className="text-[11px] text-fg-3 uppercase tracking-[0.06em] mb-1.5">駅周辺</div>
          <div className="flex flex-wrap gap-1">
            {result.tags.map(t => (
              <span key={t} className="text-[11px] text-fg-2 bg-soft border border-line px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
