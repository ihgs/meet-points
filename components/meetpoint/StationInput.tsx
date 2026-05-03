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
    <div className="relative" ref={wrapRef}>
      <div className="flex items-center h-9 border border-line rounded-sm bg-card transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--color-accent-soft)]">
        <svg className="text-fg-3 ml-2.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="10" r="3" />
          <path d="M12 2a8 8 0 0 0-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 0 0-8-8z" />
        </svg>
        <input
          autoFocus={autoFocus}
          value={query}
          placeholder={placeholder}
          className="flex-1 min-w-0 border-0 outline-none bg-transparent px-2.5 h-full text-sm text-fg placeholder:text-[oklch(0.72_0.008_260)]"
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
          <button
            className="size-7 mr-1 bg-transparent border-0 text-fg-3 cursor-pointer rounded grid place-items-center hover:bg-soft hover:text-fg"
            onClick={onRemove}
            title="削除"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {open && matches.length > 0 && (
        <ul className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 m-0 p-1 list-none bg-card border border-line rounded shadow-[0_1px_0_rgba(20,20,30,.04),0_8px_24px_rgba(20,20,30,.06)] max-h-[280px] overflow-y-auto">
          {matches.map((s, i) => (
            <li
              key={s.id}
              className={`px-2.5 py-2 rounded-sm cursor-pointer grid grid-cols-[auto_auto_1fr] gap-2 items-baseline ${i === highlight ? 'bg-soft' : ''}`}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(s.id, s.name); }}
            >
              <span className="font-medium">{s.name}</span>
              <span className="text-[11px] text-fg-3">{s.yomi}</span>
              <span className="text-[11px] text-fg-3 text-right overflow-hidden text-ellipsis whitespace-nowrap">{s.lines.slice(0, 2).join(' / ')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
