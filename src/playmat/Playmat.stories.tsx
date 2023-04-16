import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import Playmat from "./Playmat";
import Stack from "../stack";

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

const parentStyle = {
  display: "grid",
  gridTemplateColumns: "250px 250px",
  gridTemplateRows: "250px 250px"
};

export const WithCardStacks: Story = {
  args: {
    children: (
      <div style={parentStyle}>
        <Stack name="notSpread" spread={false} initialContents="fullDeck" />
        <Stack name="empty" spread={false} initialContents="empty" />
        <Stack name="spread" spread initialContents="fullDeck" />
      </div>
    )
  }
};
