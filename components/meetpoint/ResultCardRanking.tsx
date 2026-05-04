import type { SearchResult } from '@/lib/stations';
import { MapDirectionLink } from './MapDirectionLink';
import { StationSearchLink } from './StationSearchLink';

type ResultCardRankingProps = {
  result: SearchResult;
  rank: number;
  maxTime: number;
  isFirst?: boolean;
  style?: React.CSSProperties;
};

export function ResultCardRanking({ result, rank, maxTime, isFirst, style }: ResultCardRankingProps) {
  return (
    <div
      className={`bg-card border rounded-lg grid grid-cols-[56px_1fr] p-4 gap-4 transition-colors hover:border-line-2 animate-card-in ${isFirst ? 'border-accent shadow-[0_0_0_3px_var(--color-accent-soft)]' : 'border-line'}`}
      style={style}
    >
      <div className="flex flex-col items-center gap-1 border-r border-line pr-4">
        <div className={`font-num text-[32px] font-bold leading-none tracking-tight ${isFirst ? 'text-accent-fg' : 'text-fg-3'}`}>
          {rank}
        </div>
        {isFirst && (
          <div className="text-[9px] font-bold tracking-[0.1em] bg-accent text-white px-1.5 py-0.5 rounded-[3px]">
            BEST
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex justify-between items-baseline gap-3 mb-2 flex-wrap">
          <h4 className="m-0 text-lg font-semibold tracking-tight inline-flex items-center gap-1.5">
            <span>{result.candName}<span className="text-fg-3 font-normal text-[13px] ml-px">駅</span></span>
            <StationSearchLink station={result.candName} />
          </h4>
          <div className="flex gap-1 flex-wrap">
            {result.tags.slice(0, 3).map(t => (
              <span key={t} className="text-[10px] text-fg-2 bg-soft border border-line px-1.5 py-px rounded-full">{t}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-[18px] mb-2.5 pb-2.5 border-b border-line">
          {[
            { v: result.total, u: '分', l: '合計' },
            { v: `¥${result.totalFare.toLocaleString()}`, u: '', l: '運賃' },
            { v: result.maxTransfers, u: '回', l: '乗換' },
            { v: result.fairness, u: '', l: '公平性' },
          ].map(({ v, u, l }) => (
            <div key={l} className="flex flex-col">
              <span className="font-num text-[15px] font-semibold">
                {v}{u && <small className="text-[11px] text-fg-3 ml-px">{u}</small>}
              </span>
              <span className="text-[10px] text-fg-3 uppercase tracking-[0.04em]">{l}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-[3px]">
          {result.routes.map((r, i) => {
            const w = (r.route.minutes / maxTime) * 100;
            return (
              <div key={i} className="grid grid-cols-[1fr_24px_auto] gap-2 items-center" title={`${i + 1}人目: ${r.route.minutes}分`}>
                <div
                  className="h-4 bg-accent-soft rounded-[3px] flex items-center justify-end px-1.5 font-num text-[10px] font-semibold text-accent-fg min-w-6 transition-[width]"
                  style={{ width: `${w}%` }}
                >
                  <span>{r.route.minutes}</span>
                </div>
                <span className="font-num text-[10px] text-fg-3">{i + 1}</span>
                <MapDirectionLink origin={r.route.path[0] ?? ''} destination={result.candName} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
