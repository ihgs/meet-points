import type { SearchResult, Member } from '@/lib/stations';
import { TimeBars } from './TimeBars';
import { FairnessRing } from './FairnessRing';
import { RoutePath } from './RoutePath';

type ResultCardDetailProps = {
  result: SearchResult;
  rank: number;
  members: Member[];
  maxTime: number;
};

export function ResultCardDetail({ result, rank, maxTime }: ResultCardDetailProps) {
  return (
    <div className="r-card r-detail-card">
      <div className="rd-head">
        <div className="rd-head-l">
          <div className="rd-rank">第{rank}位</div>
          <h4>{result.candName}<span className="r-station-suffix">駅</span></h4>
        </div>
        <div className="rd-fairness">
          <FairnessRing score={result.fairness} />
          <div className="rd-fair-l">公平性</div>
        </div>
      </div>

      <div className="rd-grid">
        <div className="rd-cell">
          <div className="rd-cell-v">{result.total}<small>分</small></div>
          <div className="rd-cell-l">合計所要時間</div>
        </div>
        <div className="rd-cell">
          <div className="rd-cell-v">{Math.round(result.avg)}<small>分</small></div>
          <div className="rd-cell-l">平均</div>
        </div>
        <div className="rd-cell">
          <div className="rd-cell-v">¥{result.totalFare}</div>
          <div className="rd-cell-l">合計運賃</div>
        </div>
        <div className="rd-cell">
          <div className="rd-cell-v">{result.maxTransfers}<small>回</small></div>
          <div className="rd-cell-l">最大乗換</div>
        </div>
      </div>

      <div className="rd-section">
        <div className="rd-section-l">メンバー別所要時間</div>
        <TimeBars routes={result.routes} max={maxTime} />
      </div>

      <div className="rd-section">
        <div className="rd-section-l">経路</div>
        <div className="r-routes">
          {result.routes.map((r, i) => (
            <div key={i} className="r-route-line">
              <span className="rr-num">{i + 1}人目</span>
              <RoutePath route={r.route} />
              <span className="rr-meta">{r.route.minutes}分・¥{r.route.fare}・乗換{r.route.transfers}回</span>
            </div>
          ))}
        </div>
      </div>

      {result.tags.length > 0 && (
        <div className="rd-section">
          <div className="rd-section-l">駅周辺</div>
          <div className="r-tags">
            {result.tags.map(t => <span key={t} className="r-tag">{t}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
