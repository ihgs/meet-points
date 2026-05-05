'use client';

import { useEffect, useRef } from 'react';

export type CoverageDialogViewProps = {
  open: boolean;
  region: string;
  stationCount: number;
  lines: string[];
  onClose: () => void;
};

export function CoverageDialogView({
  open,
  region,
  stationCount,
  lines,
  onClose,
}: CoverageDialogViewProps) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="bg-card text-fg rounded-lg border border-line p-0 max-w-[520px] w-[92vw] max-h-[80vh] backdrop:bg-black/30"
    >
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-line">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h2 className="m-0 text-sm font-semibold tracking-tight">対応エリア</h2>
          <p className="m-0 text-[11px] text-fg-3">
            <span>{region}</span>
            <span className="mx-1.5 text-fg-3">/</span>
            <span className="font-num">{stationCount.toLocaleString()}</span>
            <span>駅</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="size-7 grid place-items-center border border-line rounded-sm bg-page text-fg-2 hover:text-fg hover:bg-soft transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-4 overflow-y-auto max-h-[calc(80vh-64px)]">
        <p className="m-0 mb-3 text-xs text-fg-3 leading-relaxed">
          現在、本サービスは{region}の駅・路線情報のみに対応しています。下記は対応路線の一覧です。
        </p>
        {lines.length === 0 ? (
          <p className="m-0 text-xs text-fg-3">対応路線情報がありません。</p>
        ) : (
          <ul className="m-0 p-0 list-none grid grid-cols-2 max-[480px]:grid-cols-1 gap-x-4 gap-y-1.5">
            {lines.map((line) => (
              <li key={line} className="text-[13px] text-fg-2 leading-snug truncate">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}
