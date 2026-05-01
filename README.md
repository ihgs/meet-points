# MeetPoint — 待ち合わせ駅検索

複数人の最寄駅から、所要時間・運賃・公平性スコアをもとに最適な待ち合わせ駅を探すアプリ。

## 機能

- メンバー2〜10人の最寄駅を入力し、待ち合わせ候補駅をランキング表示
- 候補駅の手動指定 or 全駅から自動探索
- ソート: バランス / 時間 / 運賃 / 公平性
- 結果カードスタイル: コンパクト / 詳細 / ランキング
- GTFS-JP（公共交通オープンデータ）による駅データの定期更新

## セットアップ

```bash
pnpm install
cp .env.local.example .env.local
```

`.env.local` を編集して環境変数を設定してください（後述）。

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) で起動します。

> **Note:** GTFS データを取得しない場合は東京近郊30駅のフォールバックデータで動作します。

## 環境変数

| 変数 | 説明 |
|------|------|
| `ODPT_API_KEY` | 公共交通オープンデータセンターのAPIキー（無料）|
| `CRON_SECRET` | `/api/cron` エンドポイントの認証トークン |

`ODPT_API_KEY` は [developer.odpt.org](https://developer.odpt.org/) で無料登録して取得できます。

## GTFS データの取得

対応事業者: 東京メトロ・都営・東急・小田急・京王・西武・東武

```bash
# 全事業者を一括取得
npx tsx scripts/fetch-gtfs.ts --all

# 特定事業者のみ
npx tsx scripts/fetch-gtfs.ts --source TokyoMetro
npx tsx scripts/fetch-gtfs.ts --source Toei
```

データは `data/gtfs.db`（SQLite）に保存されます。アプリ起動時に自動で読み込まれ、ヘッダーに「N駅対応」と表示されます。

### 定期更新

**GitHub Actions**（毎週月曜 2:00 UTC）:  
リポジトリの `Settings > Secrets` に `ODPT_API_KEY` を登録するだけで自動実行されます。

**Vercel Cron / 手動トリガー**:  
```bash
curl -X POST https://your-app.vercel.app/api/cron \
  -H "Authorization: Bearer $CRON_SECRET"
```

## 開発

```bash
pnpm dev          # 開発サーバー
pnpm storybook    # Storybook（コンポーネント確認）
pnpm build        # プロダクションビルド
pnpm tsc --noEmit # 型チェック
```

## プロジェクト構成

```
app/
  actions.ts          # Server Actions（駅一覧取得・経路探索）
  api/cron/route.ts   # GTFS更新トリガー API
  page.tsx
components/meetpoint/ # UIコンポーネント（View層）
lib/
  db.ts               # SQLite接続
  gtfs-parser.ts      # GTFS ZIPダウンロード・パース
  gtfs-importer.ts    # DBへのupsert
  stations.ts         # 型定義・フォールバックデータ・経路探索
scripts/
  fetch-gtfs.ts       # GTFSデータ取得CLIスクリプト
stories/              # Storybookストーリー
gtfs.config.ts        # データソース設定
```

## 技術スタック

- [Next.js 16](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [Storybook 10](https://storybook.js.org/)
- [GTFS-JP](https://www.odpt.org/) / [公共交通オープンデータセンター](https://developer.odpt.org/)
