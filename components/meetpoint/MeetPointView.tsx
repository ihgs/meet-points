'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Member, Candidate, SearchResult, Station } from '@/lib/stations';
import { getStationsAction, searchAction } from '@/app/actions';
import { MemberList } from './MemberList';
import { CandidateList } from './CandidateList';
import { ResultCardCompact } from './ResultCardCompact';
import { ResultCardDetail } from './ResultCardDetail';
import { ResultCardRanking } from './ResultCardRanking';

type SortKey = 'balanced' | 'time' | 'fare' | 'fairness';
type CardStyle = 'compact' | 'detail' | 'ranking';

type MeetPointViewProps = {
  initialMembers?: Member[];
  initialCandidates?: Candidate[];
};

const tabBtn = (active: boolean) =>
  `bg-transparent border-0 px-2.5 py-[5px] text-xs rounded-[5px] cursor-pointer ${active ? 'bg-fg text-white' : 'text-fg-2'}`;

export function MeetPointView({ initialMembers, initialCandidates }: MeetPointViewProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [members, setMembers] = useState<Member[]>(initialMembers ?? [
    { id: 'm1', stationId: 'shinjuku' },
    { id: 'm2', stationId: 'yokohama' },
    { id: 'm3', stationId: 'kichijoji' },
  ]);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates ?? []);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortKey>('balanced');
  const [cardStyle, setCardStyle] = useState<CardStyle>('compact');

  useEffect(() => {
    getStationsAction().then(setStations);
  }, []);

  const validMembers = members.filter(m => m.stationId);
  const canSearch = validMembers.length >= 2;

  const runSearch = async () => {
    if (!canSearch) return;
    setLoading(true);
    try {
      const memIds = validMembers.map(m => m.stationId!);
      const candIds = candidates.filter(c => c.stationId).map(c => c.stationId!);
      let r = await searchAction(memIds, candIds);
      if (candIds.length === 0) {
        r = r.filter(x => !memIds.includes(x.candId)).slice(0, 8);
      }
      setResults(r);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runSearch(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = useMemo(() => {
    if (!results) return null;
    const copy = [...results];
    if (sort === 'time') copy.sort((a, b) => a.total - b.total);
    else if (sort === 'fare') copy.sort((a, b) => a.totalFare - b.totalFare);
    else if (sort === 'fairness') copy.sort((a, b) => b.fairness - a.fairness);
    else copy.sort((a, b) => (a.total + (100 - a.fairness) * 0.5) - (b.total + (100 - b.fairness) * 0.5));
    return copy;
  }, [results, sort]);

  const maxTime = sorted ? Math.max(1, ...sorted.flatMap(r => r.routes.map(rt => rt.route.minutes))) : 1;

  const updateMember = (i: number, stationId: string | null) =>
    setMembers(m => m.map((x, j) => j === i ? { ...x, stationId } : x));
  const removeMember = (i: number) =>
    setMembers(m => m.length <= 2 ? m : m.filter((_, j) => j !== i));
  const addMember = () =>
    setMembers(m => m.length >= 10 ? m : [...m, { id: crypto.randomUUID(), stationId: null }]);

  const updateCandidate = (i: number, stationId: string | null) =>
    setCandidates(c => c.map((x, j) => j === i ? { ...x, stationId } : x));
  const removeCandidate = (i: number) =>
    setCandidates(c => c.filter((_, j) => j !== i));
  const addCandidate = () =>
    setCandidates(c => [...c, { id: crypto.randomUUID(), stationId: null }]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-7 py-4 border-b border-line bg-page sticky top-0 z-10">
        <div className="flex items-center gap-2.5 font-semibold text-base tracking-tight">
          <div className="size-[26px] bg-fg rounded-[7px] grid place-items-center text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="12" r="2.2" />
              <path d="M8.2 12h7.6" />
            </svg>
          </div>
          MeetPoint
          <span className="text-fg-3 font-normal text-xs ml-1">— 待ち合わせ駅検索</span>
        </div>
        <div className="flex items-center gap-3.5 text-fg-3 text-xs">
          <span>{stations.length > 0 ? `${stations.length}駅対応` : '東京近郊 30駅対応'}</span>
          <kbd className="font-num text-[11px] px-1.5 py-0.5 border border-line rounded-sm bg-soft">v0.1</kbd>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-[380px_1fr] max-[900px]:grid-cols-1 min-h-0">
        <aside className="border-r border-line max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:border-b-line px-6 pt-[22px] pb-[100px] bg-page overflow-y-auto">
          <MemberList
            members={members}
            stations={stations}
            onUpdate={updateMember}
            onRemove={removeMember}
            onAdd={addMember}
          />
          <CandidateList
            candidates={candidates}
            stations={stations}
            onUpdate={updateCandidate}
            onRemove={removeCandidate}
            onAdd={addCandidate}
          />

          <div className="sticky bottom-0 -mx-6 -mb-[100px] mt-[14px] px-6 pb-6 pt-[14px]" style={{ background: 'linear-gradient(to top, var(--color-page) 60%, transparent)' }}>
            <button
              className="w-full h-[42px] border-0 rounded-sm bg-fg text-white text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!canSearch || loading}
              onClick={runSearch}
            >
              {loading ? (
                <>検索中…</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
                  </svg>
                  検索する
                </>
              )}
            </button>
            {!canSearch && (
              <p className="text-xs text-fg-3 text-center mt-2 m-0">2人以上の最寄駅を入力してください</p>
            )}
          </div>
        </aside>

        <main className="px-7 pt-[22px] pb-[100px] overflow-y-auto bg-soft">
          <div className="flex items-baseline justify-between mb-[14px] flex-wrap gap-2.5">
            <div>
              <h2 className="m-0 text-lg font-semibold tracking-tight">
                {loading ? '検索中…' : sorted ? `${sorted.length}件の候補駅` : '候補駅'}
              </h2>
              {sorted && sorted[0] && !loading && (
                <div className="text-fg-3 text-xs">
                  おすすめは <strong className="font-num font-semibold text-fg">{sorted[0].candName}駅</strong>
                  ・ 合計 <strong className="font-num font-semibold text-fg">{sorted[0].total}分</strong>
                  ・ 公平性 <strong className="font-num font-semibold text-fg">{sorted[0].fairness}</strong>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {sorted && sorted.length > 0 && !loading && (
                <div className="flex items-center gap-1 p-[3px] bg-card border border-line rounded-sm">
                  {(['balanced', 'time', 'fare', 'fairness'] as const).map((key, _, arr) => {
                    const labels = { balanced: 'バランス', time: '時間', fare: '運賃', fairness: '公平性' };
                    return (
                      <button key={key} className={tabBtn(sort === key)} onClick={() => setSort(key)}>
                        {labels[key]}
                      </button>
                    );
                  })}
                </div>
              )}
              {sorted && sorted.length > 0 && !loading && (
                <div className="flex items-center gap-1 p-[3px] bg-card border border-line rounded-sm">
                  {(['compact', 'detail', 'ranking'] as const).map(key => {
                    const labels = { compact: 'コンパクト', detail: '詳細', ranking: 'ランキング' };
                    return (
                      <button key={key} className={tabBtn(cardStyle === key)} onClick={() => setCardStyle(key)}>
                        {labels[key]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="bg-card border border-line rounded-lg px-8 py-12 text-center">
              <div className="size-7 border-2 border-line border-t-accent rounded-full mx-auto mb-3.5 animate-spin" />
              <div className="text-fg-3 text-[13px]">各駅への所要時間を計算中…</div>
            </div>
          ) : !sorted || sorted.length === 0 ? (
            <div className="bg-card border border-dashed border-line rounded-lg px-8 py-14 text-center text-fg-3">
              <div className="size-14 rounded-full bg-soft mx-auto mb-4 grid place-items-center text-fg-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
                </svg>
              </div>
              <h3 className="m-0 mb-1.5 text-fg text-[15px] font-semibold">候補がありません</h3>
              <p className="m-0 text-[13px] leading-relaxed">左のパネルから最寄駅を入力して、検索してみてください。</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <p className="m-0 text-[11px] text-fg-3 leading-relaxed">
                ※ 時間と金額は正確な値ではなく、乗換ごとに+5分のペナルティを加えた経路探索による所要時間と、所要時間の区間から推定した運賃を元に算出した値です。
              </p>
              {sorted.map((r, i) => {
                const animStyle = { animationDelay: `${Math.min(i, 5) * 40}ms` };
                if (cardStyle === 'detail') {
                  return <ResultCardDetail key={r.candId} result={r} rank={i + 1} maxTime={maxTime} style={animStyle} />;
                }
                if (cardStyle === 'ranking') {
                  return <ResultCardRanking key={r.candId} result={r} rank={i + 1} maxTime={maxTime} isFirst={i === 0} style={animStyle} />;
                }
                return <ResultCardCompact key={r.candId} result={r} rank={i + 1} maxTime={maxTime} isFirst={i === 0} style={animStyle} />;
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
