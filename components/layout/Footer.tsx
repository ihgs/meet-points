type FooterProps = {
  year?: number;
};

export function Footer({ year = new Date().getFullYear() }: FooterProps) {
  return (
    <footer className="border-t border-line bg-page text-fg-3 text-[11px]">
      <div className="px-7 py-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 max-[640px]:flex-col max-[640px]:items-start">
        <span>
          データ: <a
            href="https://express.heartrails.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg-2 hover:text-accent-fg underline-offset-2 hover:underline transition-colors"
          >
            HeartRails Express
          </a>
        </span>
        <span className="ml-auto max-[640px]:ml-0 max-[640px]:mt-0.5">© {year} マンナカ</span>
      </div>
    </footer>
  );
}
