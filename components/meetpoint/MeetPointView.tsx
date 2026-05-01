'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Member, Candidate, SearchResult } from '@/lib/stations';
import { searchMeetingPoints } from '@/lib/stations';
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

export function MeetPointView({ initialMembers, initialCandidates }: MeetPointViewProps) {
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

  const validMembers = members.filter(m => m.stationId);
  const canSearch = validMembers.length >= 2;

  const runSearch = () => {
    if (!canSearch) return;
    setLoading(true);
    setTimeout(() => {
      const memIds = validMembers.map(m => m.stationId!);
      const candIds = candidates.filter(c => c.stationId).map(c => c.stationId!);
      let r = searchMeetingPoints(memIds, candIds);
      if (candIds.length === 0) {
        r = r.filter(x => !memIds.includes(x.candId)).slice(0, 8);
      }
      setResults(r);
      setLoading(false);
    }, 450);
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
    <div className="app">
      <header className="app-head">
        <div className="brand">
          <div className="brand-logo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="12" r="2.2" />
              <path d="M8.2 12h7.6" />
            </svg>
          </div>
          MeetPoint
          <span className="brand-sub">— 待ち合わせ駅検索</span>
        </div>
        <div className="head-right">
          <span>東京近郊 30駅対応</span>
          <kbd>v0.1</kbd>
        </div>
      </header>

      <div className="app-body">
        <aside className="pane-left">
          <MemberList
            members={members}
            onUpdate={updateMember}
            onRemove={removeMember}
            onAdd={addMember}
          />
          <CandidateList
            candidates={candidates}
            onUpdate={updateCandidate}
            onRemove={removeCandidate}
            onAdd={addCandidate}
          />

          <div className="search-bar">
            <button className="primary-btn" disabled={!canSearch || loading} onClick={runSearch}>
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
            {!canSearch && <p className="block-hint" style={{ textAlign: 'center', marginTop: 8 }}>2人以上の最寄駅を入力してください</p>}
          </div>
        </aside>

        <main className="pane-right">
          <div className="results-head">
            <div>
              <h2>{loading ? '検索中…' : sorted ? `${sorted.length}件の候補駅` : '候補駅'}</h2>
              {sorted && sorted[0] && !loading && (
                <div className="results-summary">
                  おすすめは <strong>{sorted[0].candName}駅</strong>
                  ・ 合計 <strong>{sorted[0].total}分</strong>
                  ・ 公平性 <strong>{sorted[0].fairness}</strong>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {sorted && sorted.length > 0 && !loading && (
                <div className="sort-bar">
                  <button className={sort === 'balanced' ? 'on' : ''} onClick={() => setSort('balanced')}>バランス</button>
                  <button className={sort === 'time' ? 'on' : ''} onClick={() => setSort('time')}>時間</button>
                  <button className={sort === 'fare' ? 'on' : ''} onClick={() => setSort('fare')}>運賃</button>
                  <button className={sort === 'fairness' ? 'on' : ''} onClick={() => setSort('fairness')}>公平性</button>
                </div>
              )}
              {sorted && sorted.length > 0 && !loading && (
                <div className="sort-bar">
                  <button className={cardStyle === 'compact' ? 'on' : ''} onClick={() => setCardStyle('compact')}>コンパクト</button>
                  <button className={cardStyle === 'detail' ? 'on' : ''} onClick={() => setCardStyle('detail')}>詳細</button>
                  <button className={cardStyle === 'ranking' ? 'on' : ''} onClick={() => setCardStyle('ranking')}>ランキング</button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner" />
              <div style={{ color: 'var(--fg-3)', fontSize: 13 }}>各駅への所要時間を計算中…</div>
            </div>
          ) : !sorted || sorted.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
                </svg>
              </div>
              <h3>候補がありません</h3>
              <p>左のパネルから最寄駅を入力して、検索してみてください。</p>
            </div>
          ) : (
            <div className="results">
              {sorted.map((r, i) => {
                if (cardStyle === 'detail') {
                  return <ResultCardDetail key={r.candId} result={r} rank={i + 1} members={validMembers} maxTime={maxTime} />;
                }
                if (cardStyle === 'ranking') {
                  return <ResultCardRanking key={r.candId} result={r} rank={i + 1} maxTime={maxTime} isFirst={i === 0} />;
                }
                return <ResultCardCompact key={r.candId} result={r} rank={i + 1} members={validMembers} maxTime={maxTime} isFirst={i === 0} />;
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
