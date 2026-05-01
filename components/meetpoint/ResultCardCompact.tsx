'use client';

import { useState } from 'react';
import type { SearchResult, Member } from '@/lib/stations';
import { getStationById } from '@/lib/stations';
import { TimeBars } from './TimeBars';

type ResultCardCompactProps = {
  result: SearchResult;
  rank: number;
  members: Member[];
  maxTime: number;
  isFirst?: boolean;
};

export function ResultCardCompact({ result, rank, members, maxTime, isFirst }: ResultCardCompactProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`r-card r-compact ${expanded ? 'expanded' : ''} ${isFirst ? 'is-first' : ''}`}>
      <div className="r-compact-row" onClick={() => setExpanded(e => !e)}>
        <div className="r-rank">{rank}</div>
        <div className="r-name">
          <div className="r-name-main">{result.candName}<span className="r-station-suffix">駅</span></div>
          <div className="r-name-sub">合計 {result.total}分 ・ 平均 {Math.round(result.avg)}分</div>
        </div>
        <div className="r-metrics">
          <div className="r-metric">
            <div className="r-metric-v">¥{result.totalFare}</div>
            <div className="r-metric-l">合計運賃</div>
          </div>
          <div className="r-metric">
            <div className="r-metric-v">{result.fairness}</div>
            <div className="r-metric-l">公平性</div>
          </div>
          <div className="r-metric">
            <div className="r-metric-v">{result.maxTransfers}</div>
            <div className="r-metric-l">乗換</div>
          </div>
        </div>
        <svg className={`r-chev ${expanded ? 'flip' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      {expanded && (
        <div className="r-detail">
          <TimeBars routes={result.routes} max={maxTime} />
          <div className="r-routes">
            {result.routes.map((r, i) => {
              const member = members[i];
              const from = member?.stationId ? getStationById(member.stationId)?.name : '?';
              return (
                <div key={i} className="r-route-line">
                  <span className="rr-num">{i + 1}人目</span>
                  <span className="rr-from">{from}</span>
                  <span className="rr-arrow">→</span>
                  <span className="rr-to">{result.candName}</span>
                  <span className="rr-meta">{r.route.minutes}分 ・ ¥{r.route.fare} ・ 乗換{r.route.transfers}回</span>
                </div>
              );
            })}
          </div>
          {result.tags.length > 0 && (
            <div className="r-tags">
              {result.tags.map(t => <span key={t} className="r-tag">{t}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
