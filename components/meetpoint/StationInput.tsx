'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { Station } from '@/lib/stations';
import { FALLBACK_STATIONS } from '@/lib/stations';

type StationInputProps = {
  value: string | null;
  onChange: (id: string | null) => void;
  stations?: Station[];
  placeholder?: string;
  autoFocus?: boolean;
  removable?: boolean;
  onRemove?: () => void;
};

export function StationInput({ value, onChange, stations, placeholder, autoFocus, removable, onRemove }: StationInputProps) {
  const stationList = stations && stations.length > 0 ? stations : FALLBACK_STATIONS;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const s = stationList.find(st => st.id === value);
      setQuery(s ? s.name : '');
    } else {
      setQuery('');
    }
  }, [value, stationList]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return stationList.filter(
      s => s.name.toLowerCase().includes(q) || s.yomi.toLowerCase().includes(q) || s.id.includes(q)
    ).slice(0, 7);
  }, [query, stationList]);

  const pick = (id: string, name: string) => {
    onChange(id);
    setQuery(name);
    setOpen(false);
  };

  return (
    <div className="station-input" ref={wrapRef}>
      <div className="station-input-row">
        <svg className="station-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="10" r="3" />
          <path d="M12 2a8 8 0 0 0-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 0 0-8-8z" />
        </svg>
        <input
          autoFocus={autoFocus}
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
            if (!e.target.value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, matches.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
            else if (e.key === 'Enter' && !e.nativeEvent.isComposing && matches[highlight]) { e.preventDefault(); pick(matches[highlight].id, matches[highlight].name); }
            else if (e.key === 'Escape') setOpen(false);
          }}
        />
        {removable && (
          <button className="station-input-x" onClick={onRemove} title="削除">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {open && matches.length > 0 && (
        <ul className="station-suggest">
          {matches.map((s, i) => (
            <li
              key={s.id}
              className={i === highlight ? 'on' : ''}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(s.id, s.name); }}
            >
              <span className="ss-name">{s.name}</span>
              <span className="ss-yomi">{s.yomi}</span>
              <span className="ss-lines">{s.lines.slice(0, 2).join(' / ')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
