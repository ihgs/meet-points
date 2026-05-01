import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MeetPoint — 待ち合わせ駅検索",
  description: "複数名の最寄駅から最適な待ち合わせ駅を探す",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${interTight.variable} ${jetbrainsMono.variable} ${notoSansJP.variable}`}
      style={{
        ["--font-jp" as string]: `var(--font-noto-sans-jp), var(--font-inter-tight), system-ui, sans-serif`,
        ["--font-num" as string]: `var(--font-jetbrains-mono), ui-monospace, monospace`,
      }}
    >
      <body className="bg-base text-fg font-jp text-sm leading-normal antialiased [text-rendering:optimizeLegibility]">{children}</body>
    </html>
  );
}
