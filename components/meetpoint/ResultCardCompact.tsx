'use client';

import { useState } from 'react';
import type { SearchResult } from '@/lib/stations';
import { TimeBars } from './TimeBars';
import { RoutePath } from './RoutePath';

type ResultCardCompactProps = {
  result: SearchResult;
  rank: number;
  maxTime: number;
  isFirst?: boolean;
  style?: React.CSSProperties;
};

export function ResultCardCompact({ result, rank, maxTime, isFirst, style }: ResultCardCompactProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="bg-card border border-line rounded-lg transition-colors hover:border-line-2 animate-card-in"
      style={style}
    >
      <div
        className="grid grid-cols-[36px_1fr_auto_16px] items-center gap-[14px] px-4 py-[14px] cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={`size-7 rounded-full grid place-items-center font-num font-semibold text-[13px] ${isFirst ? 'text-accent-fg bg-accent-soft' : 'text-fg-2 bg-soft'}`}>
          {rank}
        </div>
        <div>
          <div className="text-base font-semibold tracking-tight">
            {result.candName}<span className="text-fg-3 font-normal text-[13px] ml-px">駅</span>
          </div>
          <div className="text-xs text-fg-3 mt-px">合計 {result.total}分 ・ 平均 {Math.round(result.avg)}分</div>
        </div>
        <div className="flex gap-[18px]">
          <div className="text-right">
            <div className="font-num text-sm font-semibold">¥{result.totalFare}</div>
            <div className="text-[10px] text-fg-3 mt-px uppercase tracking-[0.04em]">合計運賃</div>
          </div>
          <div className="text-right">
            <div className="font-num text-sm font-semibold">{result.fairness}</div>
            <div className="text-[10px] text-fg-3 mt-px uppercase tracking-[0.04em]">公平性</div>
          </div>
          <div className="text-right">
            <div className="font-num text-sm font-semibold">{result.maxTransfers}</div>
            <div className="text-[10px] text-fg-3 mt-px uppercase tracking-[0.04em]">乗換</div>
          </div>
        </div>
        <svg
          className={`text-fg-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      {expanded && (
        <div className="border-t border-line px-4 pt-[14px] pb-4 flex flex-col gap-[14px]">
          <TimeBars routes={result.routes} max={maxTime} />
          <div className="flex flex-col gap-1">
            {result.routes.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-fg-2 py-1 flex-wrap">
                <span className="font-num text-[10px] bg-soft px-1.5 py-0.5 rounded-[3px] text-fg-3">{i + 1}人目</span>
                <RoutePath route={r.route} />
                <span className="text-fg-3 font-num text-[11px] ml-auto whitespace-nowrap">{r.route.minutes}分・¥{r.route.fare}・乗換{r.route.transfers}回</span>
              </div>
            ))}
          </div>
          {result.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {result.tags.map(t => (
                <span key={t} className="text-[11px] text-fg-2 bg-soft border border-line px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
