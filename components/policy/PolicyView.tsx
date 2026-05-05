import type { ReactNode } from "react";

export type PolicySection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

export type PolicyViewProps = {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: PolicySection[];
  footnote?: ReactNode;
};

export function PolicyView({
  title,
  lastUpdated,
  intro,
  sections,
  footnote,
}: PolicyViewProps) {
  return (
    <main className="flex-1 w-full">
      <article className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14 space-y-8">
        <header className="space-y-2 border-b border-line pb-6">
          <h1 className="text-2xl font-semibold text-fg tracking-tight">
            {title}
          </h1>
          <p className="text-[11px] text-fg-3 font-num">
            最終更新日: {lastUpdated}
          </p>
        </header>

        {intro && (
          <p className="text-sm text-fg-2 leading-relaxed">{intro}</p>
        )}

        <ol className="space-y-8 list-none p-0">
          {sections.map((section, i) => (
            <li key={i} className="space-y-3">
              <h2 className="text-base font-semibold text-fg flex items-baseline gap-2">
                <span className="text-fg-3 font-num text-xs">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {section.heading}
              </h2>
              {section.paragraphs?.map((p, j) => (
                <p
                  key={j}
                  className="text-sm text-fg-2 leading-relaxed whitespace-pre-line"
                >
                  {p}
                </p>
              ))}
              {section.list && (
                <ul className="list-disc pl-5 space-y-1 text-sm text-fg-2 leading-relaxed">
                  {section.list.map((li, k) => (
                    <li key={k}>{li}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>

        {footnote && (
          <div className="border-t border-line pt-6 text-xs text-fg-3 leading-relaxed">
            {footnote}
          </div>
        )}
      </article>
    </main>
  );
}
