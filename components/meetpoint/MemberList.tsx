import type { Member } from '@/lib/stations';
import { StationInput } from './StationInput';

type MemberListProps = {
  members: Member[];
  onUpdate: (index: number, stationId: string | null) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
};

export function MemberList({ members, onUpdate, onRemove, onAdd }: MemberListProps) {
  return (
    <div className="block">
      <div className="block-head">
        <h3>メンバーの最寄駅</h3>
        <span className="block-count">{members.length}人</span>
      </div>
      <div className="member-rows">
        {members.map((m, i) => (
          <div key={m.id} className="member-row">
            <div className="member-tag">{i + 1}人目</div>
            <StationInput
              value={m.stationId}
              onChange={(id) => onUpdate(i, id)}
              placeholder="駅名を入力（例: 新宿）"
              removable={members.length > 2}
              onRemove={() => onRemove(i)}
            />
          </div>
        ))}
      </div>
      <button className="ghost-btn" onClick={onAdd} disabled={members.length >= 10}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        メンバーを追加
        <span className="muted">（最大10人）</span>
      </button>
    </div>
  );
}
