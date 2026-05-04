# マンナカ — 待ち合わせ駅検索

複数人の最寄駅から、所要時間・公平性スコアをもとに最適な待ち合わせ駅を探すアプリ。

完全クライアントサイドで動作する静的サイトです（API・サーバー不要）。

## 機能

- メンバー2〜10人の最寄駅を入力し、待ち合わせ候補駅をランキング表示
- 候補駅の手動指定 or 全駅から自動探索
- ソート: バランス / 時間 / 運賃 / 公平性
- 結果カードスタイル: コンパクト / 詳細 / ランキング
- [HeartRails Express API](https://express.heartrails.com/api.html) による関東近郊の駅データ

## セットアップ

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000) で起動します。

> **Note:** `public/data/` に JSON データがない場合は東京近郊30駅のフォールバックデータで動作します。

## 駅データの取得・更新

HeartRails Express API（認証不要・無料）から関東7都県の鉄道駅データを取得し、SQLite を経由して `public/data/*.json` に書き出します。

```bash
pnpm fetch-stations   # SQLite (data/gtfs.db) を生成
pnpm export-data      # public/data/{stations,edges,meta}.json を書き出し
```

対象: 東京都・神奈川県・埼玉県・千葉県・茨城県・栃木県・群馬県の鉄道路線（バス・BRT・ケーブルカー等を除く）

### 定期更新

GitHub Actions が毎週月曜 2:00 UTC に上記2コマンドを実行し、`public/data/` の差分を自動コミットします（外部APIキー不要）。

## ビルド・デプロイ

```bash
pnpm build      # next build → out/ に静的サイトを生成
```

`out/` を任意の静的ホスティング（GitHub Pages、Cloudflare Pages、S3、Vercel など）にデプロイ可能。

### GitHub Pages へデプロイ

```bash
pnpm deploy:gh-pages
```

- `build:gh-pages` は `NEXT_PUBLIC_BASE_PATH=/meet-points` 付きでビルド
- `deploy:gh-pages` は `gh-pages` パッケージで `out/` を `gh-pages` ブランチに push（`--nojekyll` で `.nojekyll` 自動付与）
- 初回のみ GitHub リポジトリの Settings → Pages で **Source: Deploy from a branch / gh-pages / (root)** を選択
- 公開URL: `https://<user>.github.io/meet-points/`

別リポジトリ名で動かす場合は `NEXT_PUBLIC_BASE_PATH` を上書き:
```bash
NEXT_PUBLIC_BASE_PATH=/other-name pnpm deploy:gh-pages
```

## 開発

```bash
pnpm dev          # 開発サーバー
pnpm storybook    # Storybook（コンポーネント確認）
pnpm tsc --noEmit # 型チェック
```

## プロジェクト構成

```
app/
  page.tsx
  layout.tsx
components/meetpoint/  # UIコンポーネント（View層）
lib/
  search.ts            # クライアント側検索オーケストレーション
  data-loader.ts       # JSON フェッチ + グラフ構築
  smart-search.ts      # Dijkstra ベースの候補駅探索
  stations.ts          # 型定義・フォールバックデータ・経路探索
  heartrails.ts        # HeartRails Express APIクライアント（スクリプト用）
  gtfs-importer.ts     # SQLite upsert（スクリプト用）
  db.ts                # SQLite 接続（スクリプト用）
public/data/
  stations.json        # 駅一覧（クライアント fetch）
  edges.json           # 路線エッジ（クライアント fetch）
  meta.json            # 生成日時・件数
scripts/
  fetch-stations.ts    # 駅データ取得 → SQLite
  export-data.ts       # SQLite → JSON 書き出し
stories/               # Storybook ストーリー
```

## 技術スタック

- [Next.js 16](https://nextjs.org/) (App Router, Static Export)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)（スクリプトのみ）
- [Storybook 10](https://storybook.js.org/)
- [HeartRails Express API](https://express.heartrails.com/api.html)
