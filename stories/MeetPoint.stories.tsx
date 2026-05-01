import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MeetPointView } from "@/components/meetpoint/MeetPointView";

const meta: Meta<typeof MeetPointView> = {
  title: "MeetPoint/MeetPointView",
  component: MeetPointView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;
type Story = StoryObj<typeof MeetPointView>;

export const Default: Story = {
  args: {
    initialMembers: [
      { id: "m1", stationId: "shinjuku" },
      { id: "m2", stationId: "yokohama" },
      { id: "m3", stationId: "kichijoji" },
    ],
    initialCandidates: [],
  },
};

export const TwoMembers: Story = {
  args: {
    initialMembers: [
      { id: "m1", stationId: "shibuya" },
      { id: "m2", stationId: "ikebukuro" },
    ],
    initialCandidates: [],
  },
};

export const WithManualCandidates: Story = {
  args: {
    initialMembers: [
      { id: "m1", stationId: "shinjuku" },
      { id: "m2", stationId: "yokohama" },
    ],
    initialCandidates: [
      { id: "c1", stationId: "shibuya" },
      { id: "c2", stationId: "ebisu" },
      { id: "c3", stationId: "nakameguro" },
    ],
  },
};

export const ManyMembers: Story = {
  args: {
    initialMembers: [
      { id: "m1", stationId: "omiya" },
      { id: "m2", stationId: "chiba" },
      { id: "m3", stationId: "yokohama" },
      { id: "m4", stationId: "tachikawa" },
      { id: "m5", stationId: "kashiwa" },
    ],
    initialCandidates: [],
  },
};

export const EmptyInputs: Story = {
  args: {
    initialMembers: [
      { id: "m1", stationId: null },
      { id: "m2", stationId: null },
    ],
    initialCandidates: [],
  },
};
