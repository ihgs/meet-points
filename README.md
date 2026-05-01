# MeetPoint — 待ち合わせ駅検索

複数人の最寄駅から、所要時間・公平性スコアをもとに最適な待ち合わせ駅を探すアプリ。

## 機能

- メンバー2〜10人の最寄駅を入力し、待ち合わせ候補駅をランキング表示
- 候補駅の手動指定 or 全駅から自動探索
- ソート: バランス / 時間 / 公平性
- 結果カードスタイル: コンパクト / 詳細 / ランキング
- [HeartRails Express API](https://express.heartrails.com/api.html) による関東近郊の駅データ

## セットアップ

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev
```

[http://localhost:3000](http://localhost:3000) で起動します。

> **Note:** 駅データを取得しない場合は東京近郊30駅のフォールバックデータで動作します。

## 環境変数

| 変数 | 説明 |
|------|------|
| `CRON_SECRET` | `/api/cron` エンドポイントの認証トークン |

## 駅データの取得

HeartRails Express API（認証不要・無料）から関東7都県の鉄道駅データを取得します。

```bash
npx tsx scripts/fetch-stations.ts
```

データは `data/gtfs.db`（SQLite）に保存されます。アプリ起動時に自動で読み込まれ、ヘッダーに「N駅対応」と表示されます。

対象: 東京都・神奈川県・埼玉県・千葉県・茨城県・栃木県・群馬県の鉄道路線（バス・BRT・ケーブルカー等を除く）

### 定期更新

**GitHub Actions**（毎週月曜 2:00 UTC）:  
リポジトリの Actions が自動実行されます（外部APIキー不要）。

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
  api/cron/route.ts   # 駅データ更新トリガー API
  page.tsx
components/meetpoint/ # UIコンポーネント（View層）
lib/
  db.ts               # SQLite接続
  heartrails.ts       # HeartRails Express APIクライアント
  gtfs-importer.ts    # DBへのupsert
  stations.ts         # 型定義・フォールバックデータ・経路探索
scripts/
  fetch-stations.ts   # 駅データ取得CLIスクリプト
stories/              # Storybookストーリー
```

## 技術スタック

- [Next.js 16](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [Storybook 10](https://storybook.js.org/)
- [HeartRails Express API](https://express.heartrails.com/api.html)
