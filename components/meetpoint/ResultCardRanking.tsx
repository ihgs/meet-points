import type { SearchResult } from '@/lib/stations';

type ResultCardRankingProps = {
  result: SearchResult;
  rank: number;
  maxTime: number;
  isFirst?: boolean;
};

export function ResultCardRanking({ result, rank, maxTime, isFirst }: ResultCardRankingProps) {
  return (
    <div className={`r-card r-ranking ${isFirst ? 'is-first' : ''}`}>
      <div className="rr-rank-col">
        <div className="rr-num-big">{rank}</div>
        {isFirst && <div className="rr-best">BEST</div>}
      </div>
      <div className="rr-main">
        <div className="rr-name-row">
          <h4>{result.candName}<span className="r-station-suffix">駅</span></h4>
          <div className="rr-tags-row">
            {result.tags.slice(0, 3).map(t => <span key={t} className="r-tag tag-sm">{t}</span>)}
          </div>
        </div>
        <div className="rr-metrics-row">
          <div className="rrm">
            <span className="rrm-v">{result.total}<small>分</small></span>
            <span className="rrm-l">合計</span>
          </div>
          <div className="rrm">
            <span className="rrm-v">¥{result.totalFare.toLocaleString()}</span>
            <span className="rrm-l">運賃</span>
          </div>
          <div className="rrm">
            <span className="rrm-v">{result.maxTransfers}<small>回</small></span>
            <span className="rrm-l">乗換</span>
          </div>
          <div className="rrm">
            <span className="rrm-v">{result.fairness}</span>
            <span className="rrm-l">公平性</span>
          </div>
        </div>
        <div className="rr-bars">
          {result.routes.map((r, i) => {
            const w = (r.route.minutes / maxTime) * 100;
            return (
              <div key={i} className="rr-bar-wrap" title={`${i + 1}人目: ${r.route.minutes}分`}>
                <div className="rr-bar-fill" style={{ width: `${w}%` }}>
                  <span>{r.route.minutes}</span>
                </div>
                <span className="rr-bar-mem">{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
