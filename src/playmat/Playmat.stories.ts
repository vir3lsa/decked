import type { Meta, StoryObj } from "@storybook/react";

import Playmat from "./Playmat";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/react/writing-stories/introduction
const meta = {
  title: "Decked/Playmat",
  component: Playmat,
  tags: ["autodocs"]
} satisfies Meta<typeof Playmat>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/react/writing-stories/args
export const Empty: Story = {};
