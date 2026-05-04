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
    <div className="mb-[22px]">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="m-0 text-[13px] font-semibold tracking-[0.02em]">候補駅（手動指定）</h3>
        <span className="font-num text-[11px] text-fg-3">{candidates.length > 0 ? `${candidates.length}駅` : '自動'}</span>
      </div>
      <p className="m-0 mb-2.5 text-xs text-fg-3 leading-relaxed">未指定の場合はアプリが全駅から自動で最適駅を提案します。</p>
      {candidates.length > 0 && (
        <div className="flex flex-col gap-2 mb-2">
          {candidates.map((c, i) => (
            <div key={c.id} className="grid grid-cols-[56px_minmax(0,1fr)] gap-2.5 items-start">
              <div className="h-9 flex items-center justify-center bg-transparent border border-line rounded-sm text-[11px] font-medium text-fg-3 whitespace-nowrap">
                候補{i + 1}
              </div>
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
      <button
        className="inline-flex items-center gap-1.5 px-2.5 h-[30px] bg-transparent border border-dashed border-line-2 rounded-sm text-fg-2 text-xs cursor-pointer transition-all hover:bg-soft hover:text-fg hover:border-fg-3"
        onClick={onAdd}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        候補駅を追加
      </button>
    </div>
  );
}
