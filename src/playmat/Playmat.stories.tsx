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
  gridTemplateRows: "250px 250px 250px"
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

export const SetupFunction: Story = {
  args: {
    children: (
      <div style={parentStyle}>
        <Stack name="a" spread={false} initialContents="fullDeck" />
        <Stack name="b" spread={false} initialContents="empty" />
        <Stack name="c" spread initialContents="empty" />
        <Stack name="d" spread initialContents="empty" />
      </div>
    ),
    setup: (cardStacks, moveCard) => {
      const deck = cardStacks["a"].cards;
      const indices = Array.from(Array(52)).map((_, index) => index);
      const shuffledDeck = Array.from(Array(52));

      deck.forEach((card) => {
        const index = indices[Math.floor(Math.random() * indices.length)];
        shuffledDeck[index] = card;
        indices.splice(indices.indexOf(index), 1);
      });

      let toStack = "a";
      shuffledDeck.forEach((card) => {
        moveCard({ card, toStack });
        switch (toStack) {
          case "a":
            toStack = "b";
            break;
          case "b":
            toStack = "c";
            break;
          case "c":
            toStack = "d";
            break;
          case "d":
            toStack = "a";
            break;
        }
      });
    }
  }
};

export const CanDrag: Story = {
  args: {
    children: (
      <div style={parentStyle}>
        <Stack name="notSpread" spread={false} initialContents="fullDeck" />
        <Stack name="empty" spread={false} initialContents="empty" />
        <Stack
          name="spread"
          spread
          initialContents="fullDeck"
          canDrag={(_, cardStacks, stackName, card) =>
            cardStacks[stackName].cards.indexOf(card.id) === cardStacks[stackName].cards.length - 1
          }
        />
      </div>
    )
  }
};

export const CanDrop: Story = {
  args: {
    children: (
      <div style={parentStyle}>
        <Stack
          name="notSpread"
          spread={false}
          initialContents="fullDeck"
          canDrop={(_, cardStacks, stackName) => cardStacks[stackName].cards.length <= 10}
        />
        <Stack
          name="empty"
          spread={false}
          initialContents="empty"
          canDrop={(_, __, ___, card) => card.suit === "hearts" || card.suit === "diamonds"}
        />
        <Stack name="spread" spread initialContents="fullDeck" canDrop={(_, __, ___, card) => card.rank > 3} />
      </div>
    )
  }
};

export const WinFunction: Story = {
  args: {
    children: (
      <div style={parentStyle}>
        <Stack name="aa" spread={false} initialContents="fullDeck" />
        <Stack name="bb" spread={false} initialContents="empty" />
        <Stack name="cc" spread initialContents="empty" />
        <Stack name="dd" spread initialContents="empty" />
      </div>
    ),
    isWin: (cardStacks) =>
      cardStacks["aa"].cards.length > 0 &&
      cardStacks["bb"].cards.length > 0 &&
      cardStacks["cc"].cards.length > 0 &&
      cardStacks["dd"].cards.length > 0
  }
};

const canDrop = (_: CardMap, cardStacks: CardStacks, name: string) => cardStacks[name].cards.length < 1;
const stackOrder = ["eee", "bbb", "ggg", "ddd", "ccc", "fff"];

export const compareMoveStacks: Story = {
  args: {
    children: (
      <div style={parentStyle}>
        <Stack name="aaa" spread={false} canDrop={canDrop} initialContents="fullDeck" />
        <Stack name="bbb" spread={false} canDrop={canDrop} initialContents="empty" />
        <Stack name="ccc" spread={false} canDrop={canDrop} initialContents="empty" />
        <Stack name="ddd" spread={false} canDrop={canDrop} initialContents="empty" />
        <Stack name="eee" spread={false} canDrop={canDrop} initialContents="empty" />
        <Stack name="fff" spread={false} canDrop={canDrop} initialContents="empty" />
        <Stack name="ggg" spread={false} canDrop={canDrop} initialContents="empty" />
      </div>
    ),
    compareMoveStacks: (stack1, stack2) => stackOrder.indexOf(stack1.name) - stackOrder.indexOf(stack2.name)
  }
};

export const OnMove: Story = {
  args: {
    children: (
      <div style={parentStyle}>
        <Stack name="notSpread2" spread={false} initialContents="fullDeck" />
        <Stack name="empty2" spread={false} initialContents="empty" />
        <Stack name="spread2" spread initialContents="fullDeck" />
      </div>
    ),
    onMove: () => {
      window.alert("Moved a card");
      return false;
    }
  }
};

export const OnUndo: Story = {
  args: {
    children: (
      <div style={parentStyle}>
        <Stack name="notSpread2" spread={false} initialContents="fullDeck" />
        <Stack name="empty2" spread={false} initialContents="empty" />
        <Stack name="spread2" spread initialContents="fullDeck" />
      </div>
    ),
    onUndo: () => window.alert("Rewinding.")
  }
};
