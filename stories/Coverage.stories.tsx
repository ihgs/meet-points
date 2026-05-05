import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState } from "react";
import { CoverageDialogView } from "@/components/meetpoint/CoverageDialogView";

const meta: Meta<typeof CoverageDialogView> = {
  title: "MeetPoint/CoverageDialogView",
  component: CoverageDialogView,
  tags: ["autodocs", "vrt"],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof CoverageDialogView>;

const sampleLines = [
  "JR山手線", "JR中央線", "JR京浜東北線", "JR総武線", "JR東海道線", "JR横須賀線",
  "JR埼京線", "JR湘南新宿ライン", "JR常磐線", "JR京葉線",
  "東急東横線", "東急田園都市線", "東急目黒線", "東急大井町線",
  "京王線", "京王井の頭線", "小田急線", "西武池袋線", "西武新宿線",
  "東武東上線", "東武スカイツリーライン", "京急本線", "京成本線",
  "丸ノ内線", "銀座線", "日比谷線", "千代田線", "半蔵門線", "南北線",
  "副都心線", "有楽町線", "東西線", "三田線", "大江戸線", "新宿線",
  "つくばエクスプレス", "りんかい線",
];

const Wrapper = (args: React.ComponentProps<typeof CoverageDialogView>) => {
  const [open, setOpen] = useState(args.open);
  useEffect(() => setOpen(args.open), [args.open]);
  return (
    <div className="min-h-screen bg-page p-6">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-xs border border-line rounded-sm bg-card hover:bg-soft cursor-pointer"
      >
        対応エリアを開く
      </button>
      <CoverageDialogView
        {...args}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};

export const Open: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    open: true,
    region: "関東近辺",
    stationCount: 2314,
    lines: sampleLines,
    onClose: () => {},
  },
};

export const FewLines: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    open: true,
    region: "東京近郊",
    stationCount: 30,
    lines: ["JR山手線", "JR中央線", "丸ノ内線", "銀座線", "日比谷線"],
    onClose: () => {},
  },
};

export const Closed: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    open: false,
    region: "関東近辺",
    stationCount: 2314,
    lines: sampleLines,
    onClose: () => {},
  },
};
