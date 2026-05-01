import type { Candidate, Station } from '@/lib/stations';
import { StationInput } from './StationInput';

type CandidateListProps = {
  candidates: Candidate[];
  stations: Station[];
  onUpdate: (index: number, stationId: string | null) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
};

export function CandidateList({ candidates, stations, onUpdate, onRemove, onAdd }: CandidateListProps) {
  return (
    <div className="block">
      <div className="block-head">
        <h3>候補駅（手動指定）</h3>
        <span className="block-count">{candidates.length > 0 ? `${candidates.length}駅` : '自動'}</span>
      </div>
      <p className="block-hint">未指定の場合はアプリが全駅から自動で最適駅を提案します。</p>
      {candidates.length > 0 && (
        <div className="member-rows">
          {candidates.map((c, i) => (
            <div key={c.id} className="member-row">
              <div className="member-tag muted-tag">候補{i + 1}</div>
              <StationInput
                value={c.stationId}
                stations={stations}
                onChange={(id) => onUpdate(i, id)}
                placeholder="候補にしたい駅名"
                removable
                onRemove={() => onRemove(i)}
              />
            </div>
          ))}
        </div>
      )}
      <button className="ghost-btn" onClick={onAdd}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        候補駅を追加
      </button>
    </div>
  );
}
