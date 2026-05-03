import type { Member, Station } from '@/lib/stations';
import { StationInput } from './StationInput';

type MemberListProps = {
  members: Member[];
  stations: Station[];
  onUpdate: (index: number, stationId: string | null) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
};

export function MemberList({ members, stations, onUpdate, onRemove, onAdd }: MemberListProps) {
  return (
    <div className="mb-[22px]">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="m-0 text-[13px] font-semibold tracking-[0.02em]">メンバーの最寄駅</h3>
        <span className="font-num text-[11px] text-fg-3">{members.length}人</span>
      </div>
      <div className="flex flex-col gap-2 mb-2">
        {members.map((m, i) => (
          <div key={m.id} className="grid grid-cols-[56px_1fr] gap-2.5 items-start">
            <div className="h-9 flex items-center justify-center bg-soft border border-line rounded-sm text-[11px] font-medium text-fg-2 whitespace-nowrap">
              {i + 1}人目
            </div>
            <StationInput
              value={m.stationId}
              stations={stations}
              onChange={(id) => onUpdate(i, id)}
              placeholder="駅名を入力（例: 新宿）"
              removable={members.length > 2}
              onRemove={() => onRemove(i)}
            />
          </div>
        ))}
      </div>
      <button
        className="inline-flex items-center gap-1.5 px-2.5 h-[30px] bg-transparent border border-dashed border-line-2 rounded-sm text-fg-2 text-xs cursor-pointer transition-all hover:bg-soft hover:text-fg hover:border-fg-3 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onAdd}
        disabled={members.length >= 10}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        メンバーを追加
        <span className="text-fg-3 ml-0.5">（最大10人）</span>
      </button>
    </div>
  );
}
