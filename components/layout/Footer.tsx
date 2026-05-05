import Link from "next/link";

type FooterProps = {
  year?: number;
};

const policyLinkClass =
  "text-fg-2 hover:text-accent-fg underline-offset-2 hover:underline transition-colors";

export function Footer({ year = new Date().getFullYear() }: FooterProps) {
  return (
    <footer className="border-t border-line bg-page text-fg-3 text-[11px]">
      <div className="px-7 py-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 max-[640px]:flex-col max-[640px]:items-start">
        <span>
          データ: <a
            href="https://express.heartrails.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={policyLinkClass}
          >
            HeartRails Express
          </a>
        </span>
        <nav
          aria-label="サイトポリシー"
          className="flex items-center gap-x-3 max-[640px]:mt-0.5"
        >
          <Link href="/terms" className={policyLinkClass}>
            利用規約
          </Link>
          <span aria-hidden="true" className="text-fg-3">
            ・
          </span>
          <Link href="/privacy" className={policyLinkClass}>
            プライバシーポリシー
          </Link>
        </nav>
        <span className="ml-auto max-[640px]:ml-0 max-[640px]:mt-0.5">© {year} マンナカ</span>
      </div>
    </footer>
  );
}
