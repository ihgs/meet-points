---
name: issue-implement
description: GitHub issue 番号を指定した実装依頼に対して、issue 取得 → ブランチ作成 → (UIがあれば) Storybook で骨組みレビュー → ユーザー承認後にロジック実装、の順で進めるワークフロー。「issue 10 を実装して」「#11 をやって」「このissue進めて」「10番を実装」「issue対応して」など、issue番号 (#N / issue N) や issue という単語を含む実装依頼が来たら必ずこのスキルを使う。
---

# issue 実装ワークフロー

GitHub issue から実装まで、UI 変更がある場合は **Storybook で骨組み（モックデータ）を先にビジュアルレビュー → 承認後にロジック接続** の順で進める。視覚で合意してからデータ接続に進むことで、手戻りを減らすのが狙い。

## 全体フロー

```
[1] issue 取得 → [2] ブランチ作成 → [3] UI判定
                                       ├─ UIあり → [4a] View+story 作成 → [4b] Storybook レビュー → [承認待ち] → [5] ロジック実装
                                       └─ UIなし →                                                                [5] ロジック実装
                                       → [6] 完了報告
```

**全ステップを通じて守ること:**
- ユーザーが明示的に承認するまで step 5（ロジック実装）には進まない
- コミット・プッシュ・PR 作成は自動でやらない（ユーザーが指示したときだけ）
- 既存の `.claude/skills/ui-design/SKILL.md` の View/Logic 分離原則に従う

---

## Step 1: issue 取得

```bash
gh issue view <N> --json number,title,body,labels,state,url
```

取得した本文・タイトル・ラベルから以下を把握する:
- 何を作るのか（受け入れ条件があればそれを満たすゴール）
- バグ修正か新機能か（ラベル / タイトル / 本文の語感）
- UI 変更を伴うか（Step 3 の判定材料）

issue が `closed` だった場合はユーザーに確認する（誤った番号の可能性）。

## Step 2: ブランチ作成

### 命名規則
- `bug` ラベルがある、またはタイトル/本文に「修正 / 不具合 / バグ / Fix」を含む → **`fix/issue-<N>`**
- それ以外 → **`feat/issue-<N>`**

### 切り替え手順

```bash
git rev-parse --abbrev-ref HEAD                       # 現在ブランチ
git rev-parse --verify --quiet feat/issue-<N>         # 既存確認
git status --porcelain                                 # 未コミット変更
```

判定:
- 未コミット変更がある → ユーザーに確認（stash / commit のどちらか）。勝手に捨てない
- 同名ブランチが既にある → そちらへ `git checkout`（再作成しない）
- ない → `main` を起点に `git checkout -b <branch>`

main が古いと衝突の元になるので、新規作成前に最新化を提案する（`/sync-main` スキルがプロジェクトに存在するなら案内してもよい）。

## Step 3: UI 修正判定

issue 本文・タイトルに以下のキーワードが含まれるかで自動判定する。

**UI 修正ありと判断するキーワード:**
- 画面 / ページ / レイアウト / 見た目 / 表示 / デザイン / UI / UX
- フッター / ヘッダー / ナビ / サイドバー / ボタン / 入力欄 / フォーム / モーダル / ダイアログ
- コンポーネント / Storybook / ストーリー
- 色 / フォント / アイコン / 余白 / スタイル / Tailwind
- 「リンクを表示」「メッセージを表示」「〜を追加して見せる」などユーザーから見える要素の追加

**UI 修正なしと判断するキーワード（純ロジック・データ）:**
- API / エンドポイント / バリデーションロジック / アルゴリズム
- データ取得 / 集計 / 変換 / 並び替え / フィルタ
- 性能 / リファクタ / 型 / 内部テスト / CI

判定に迷う境界ケース（例:「エラーメッセージを表示する」）では、ユーザーから見える要素・文言・配置の変更を伴うなら **UI ありとして扱う**。それでも迷う場合はユーザーに「この issue は UI 変更を伴いますか？」と確認する。

UI あり → Step 4。UI なし → Step 5。

## Step 4: UI 骨組み作成 + Storybook レビュー

### 4-1. View コンポーネントとストーリー作成

`.claude/skills/ui-design/SKILL.md` の指針に従う。最低限の再掲:

- View は `components/<feature>/<Feature>View.tsx`。**すべて props 受け取り**で fetch / useEffect / router 禁止
- ストーリーは `stories/<Feature>.stories.tsx`。`args` でモックデータを注入
- Tailwind v4 を使う

**この段階ではモックデータでビジュアルが確認できれば十分。** 実データ接続・page.tsx 側のロジックは Step 5 でやる。既存コンポーネントの修正の場合は新規作成せず、既存の View / story を更新する。

### 4-2. Storybook 起動（再利用優先）

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:6006
```

- `200` → 既に起動中。再利用する（新規起動しない）
- それ以外 → バックグラウンドで `pnpm storybook` を起動。初回ビルドが終わるまで `curl` で 200 が返るのを待つ

### 4-3. ユーザーレビューを依頼

ユーザーに以下を伝えて **承認を待つ**:
- 確認してほしい story のタイトル（例: `Footer / Default`）
- 何を見てほしいか（レイアウト・文言・リンク先・状態違い）
- 直リンク URL があれば渡す（`http://localhost:6006/?path=/story/<id>`）

**「OK」「承認」「進めて」「いいよ」など明示的承認が出るまで Step 5 に進まない。** 修正要望が出たらストーリー / View を直して再レビューを依頼するループに入る。

## Step 5: ロジック実装

承認後（または UI なしの issue の場合は最初から）、ロジック側を実装する。

- `app/.../page.tsx` でデータ取得・状態管理し、View に props を渡す
- 必要なら `lib/` にユーティリティを追加
- 型: `pnpm tsc --noEmit` または `pnpm build`
- Lint: `pnpm lint`
- テスト: 関連があれば `pnpm test`
- VRT: UI を変えたなら `pnpm test:vrt` で差分を確認。意図した差分なら `pnpm test:vrt:update` の前にユーザーに確認

## Step 6: 完了報告

以下を伝えて次のアクションをユーザーに委ねる:
- 変更したファイル（簡潔に）
- 確認した項目（型・lint・テストの結果）
- 残課題・確認事項
- 次の選択肢: コミットするか / PR を作るか（**自動では実行しない**）

---

## やらないこと

- `git commit` / `git push` / `gh pr create` の自動実行
- `git reset --hard` / `git checkout -- .` / `git clean -f` など破壊的操作を確認なしに実行
- main ブランチへの直接コミット
- 未コミット変更を勝手に stash / 削除
- VRT スナップショットを確認なしに更新（`-u`）
- ユーザー承認前にロジック実装へ進む

## プロジェクト固有の前提

- パッケージマネージャは **pnpm**（`npm` を使わない）
- Next.js 16 + App Router / React 19 / Tailwind CSS v4
- Storybook 10 系（`@storybook/nextjs-vite`）+ Vitest VRT
- AGENTS.md の通り Next.js は破壊的変更を含むため、不確かなら `node_modules/next/dist/docs/` を参照
- コミットメッセージは日本語（プロジェクト方針）
