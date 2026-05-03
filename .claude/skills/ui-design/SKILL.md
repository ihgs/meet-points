---
name: ui-design
description: UIページコンポーネントをViewとロジックを分離した設計で作成し、Storybookで表示する。ユーザーがUIコンポーネント、ページ、画面、レイアウト、Storybookストーリーの作成・追加・修正を求めたとき、またはUI設計・デザインについて話しているときは必ずこのスキルを使う。「〜画面を作って」「〜コンポーネントを追加して」「Storybookに表示して」「UIを作りたい」という要求にも適用する。
---

# UI設計スキル — View/Logic分離 + Storybook

## プロジェクト構成

```
app/                    # Next.js App Router (ロジック層)
  (route)/
    page.tsx            # データ取得・ロジック担当
components/             # UIコンポーネント (View層)
  ui/                   # 汎用UIパーツ
  [feature]/            # 機能別コンポーネント
    [Feature]View.tsx   # ページ単位のViewコンポーネント
stories/                # Storybookストーリー
  [Feature].stories.tsx
```

## 設計原則

### 1. Viewコンポーネント — 表示のみ、ロジックなし

Viewコンポーネントは**すべてのデータをpropsで受け取る**。データ取得・副作用・状態管理は一切持たない。

```tsx
// components/meeting/MeetingListView.tsx
type Meeting = {
  id: string;
  title: string;
  date: string;
  participants: string[];
};

type MeetingListViewProps = {
  meetings: Meeting[];
  onSelect: (id: string) => void;
  isLoading?: boolean;
};

export function MeetingListView({ meetings, onSelect, isLoading = false }: MeetingListViewProps) {
  if (isLoading) return <div className="...">読み込み中...</div>;
  return (
    <ul>
      {meetings.map((m) => (
        <li key={m.id} onClick={() => onSelect(m.id)}>{m.title}</li>
      ))}
    </ul>
  );
}
```

**ルール:**
- `useState` / `useEffect` / `fetch` / `router` は原則禁止
- イベントハンドラはpropsで受け取る (`onClick`, `onSubmit` など)
- `'use client'` は原則不要 (Server Componentとして動く)
- クラス名はTailwind CSS v4を使う

### 2. ページ (app/) — ロジック担当

```tsx
// app/meetings/page.tsx
import { fetchMeetings } from "@/lib/api";
import { MeetingListView } from "@/components/meeting/MeetingListView";

export default async function MeetingsPage() {
  const meetings = await fetchMeetings();
  return <MeetingListView meetings={meetings} onSelect={...} />;
}
```

### 3. Storybookストーリー — すべてのデータはstoryファイルで定義

```tsx
// stories/MeetingList.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { MeetingListView } from "@/components/meeting/MeetingListView";

const meta: Meta<typeof MeetingListView> = {
  title: "Meeting/MeetingListView",
  component: MeetingListView,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof MeetingListView>;

// argsでデータを注入 — コンポーネント内にデータをハードコードしない
export const Default: Story = {
  args: {
    meetings: [
      { id: "1", title: "週次MTG", date: "2026-05-01", participants: ["Alice", "Bob"] },
      { id: "2", title: "デザインレビュー", date: "2026-05-03", participants: ["Carol"] },
    ],
    onSelect: (id) => console.log("selected:", id),
    isLoading: false,
  },
};

export const Loading: Story = {
  args: { meetings: [], onSelect: () => {}, isLoading: true },
};

export const Empty: Story = {
  args: { meetings: [], onSelect: () => {}, isLoading: false },
};
```

**ルール:**
- ストーリーファイルは `stories/` ディレクトリに置く
- モックデータは必ず `args` または `render` 関数内で定義する
- Viewコンポーネントにデータをハードコードしない
- `Default` / `Loading` / `Empty` / `Error` など、主要な状態をカバーする
- `tags: ["autodocs"]` をつけてドキュメントを自動生成する

## 作業手順

ユーザーがUIを作る依頼をしたら、以下の順で進める:

1. **要件確認** — 何を表示するか、どんな状態があるか、インタラクションは何か
2. **型定義** — Propsの型を明確に定義する
3. **Viewコンポーネント作成** — `components/` に配置
4. **ストーリー作成** — `stories/` に配置、主要な状態をすべてカバー
5. **（必要なら）ページ作成** — `app/` にロジック層を配置
6. **Storybook起動確認** — `pnpm storybook` で表示を確認するよう案内する

## ファイル命名規則

| 種類 | 命名 | 例 |
|------|------|----|
| Viewコンポーネント | `[Feature]View.tsx` | `MeetingListView.tsx` |
| 汎用UIパーツ | `[Component].tsx` | `Button.tsx`, `Card.tsx` |
| ストーリー | `[Feature].stories.tsx` | `MeetingList.stories.tsx` |
| ページ | `page.tsx` (App Router規約) | `app/meetings/page.tsx` |

## Tailwind CSS v4 の注意点

このプロジェクトはTailwind CSS v4を使用。v3との主な違い:
- `tailwind.config.js` は不要 (CSS変数ベースの設定)
- `@apply` は `app/globals.css` で使用可能
- カスタムカラーは `--color-*` CSS変数で定義

## Storybook 10 の注意点

- フレームワーク: `@storybook/nextjs-vite`
- ストーリーファイルのパターン: `stories/**/*.stories.@(js|jsx|mjs|ts|tsx)`
- `next/image` や `next/link` はStorybookでそのまま動作する
