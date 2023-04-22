import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import Playmat from "../playmat";
import Stack from "../stack";

const meta = {
  title: "Games/Emscell",
  component: Playmat,
  tags: ["autodocs"]
} satisfies Meta<typeof Playmat>;

export default meta;
type Story = StoryObj<typeof meta>;

const topRowStyle = {
  display: "flex"
};

const bottomRowStyle = {
  display: "grid",
  gridTemplateColumns: "150px 150px 150px 150px 150px 150px 150px 150px",
  gridTemplateRows: "250px"
};

const spacesStyle = {
  display: "grid",
  gridTemplateColumns: "150px 150px 150px 150px",
  gridTemplateRows: "250px"
};

const suitsStyle = {
  display: "grid",
  gridTemplateColumns: "150px 150px 150px 150px",
  gridTemplateRows: "250px",
  marginLeft: "50px"
};

const canDrag = (cardStacks: CardStacks, stackName: string, card: ICard) =>
  cardStacks[stackName].cards.findIndex((cardInStack) => cardInStack.id === card.id) ===
  cardStacks[stackName].cards.length - 1;

const canDropOnSpace = (cardStacks: CardStacks, stackName: string) => cardStacks[stackName].cards.length < 1;
const canDropOnSuit = (cardStacks: CardStacks, stackName: string, card: ICard) => {
  const cards = cardStacks[stackName].cards;
  const lastCard = cards[cards.length - 1];
  const canDrop = (!lastCard && card.rank === 1) || (lastCard?.suit === card.suit && lastCard?.rank === card.rank - 1);
  return canDrop;
};
const canDropOnSpread = (cardStacks: CardStacks, stackName: string, card: ICard) => {
  const cards = cardStacks[stackName].cards;
  const lastCard = cards[cards.length - 1];
  const canDrop =
    !lastCard ||
    ((((card.suit === "hearts" || card.suit === "diamonds") &&
      (lastCard.suit === "spades" || lastCard.suit === "clubs")) ||
      ((card.suit === "spades" || card.suit === "clubs") &&
        (lastCard.suit === "hearts" || lastCard.suit === "diamonds"))) &&
      lastCard.rank === card.rank + 1);
  return canDrop;
};

const isWin = (cardStacks: CardStacks) =>
  cardStacks["suit1"].cards.length === 13 &&
  cardStacks["suit2"].cards.length === 13 &&
  cardStacks["suit3"].cards.length === 13 &&
  cardStacks["suit4"].cards.length === 13;

export const Emscell: Story = {
  args: {
    children: (
      <>
        <div style={topRowStyle}>
          <span style={spacesStyle}>
            <Stack name="spaceA" canDrag={canDrag} canDrop={canDropOnSpace} initialContents="fullDeck" />
            <Stack name="spaceB" canDrag={canDrag} canDrop={canDropOnSpace} />
            <Stack name="spaceC" canDrag={canDrag} canDrop={canDropOnSpace} />
            <Stack name="spaceD" canDrag={canDrag} canDrop={canDropOnSpace} />
          </span>
          <span style={suitsStyle}>
            <Stack name="suit1" canDrag={() => false} canDrop={canDropOnSuit} />
            <Stack name="suit2" canDrag={() => false} canDrop={canDropOnSuit} />
            <Stack name="suit3" canDrag={() => false} canDrop={canDropOnSuit} />
            <Stack name="suit4" canDrag={() => false} canDrop={canDropOnSuit} />
          </span>
        </div>
        <div style={bottomRowStyle}>
          <Stack name="col1" spread={true} canDrag={canDrag} canDrop={canDropOnSpread} />
          <Stack name="col2" spread={true} canDrag={canDrag} canDrop={canDropOnSpread} />
          <Stack name="col3" spread={true} canDrag={canDrag} canDrop={canDropOnSpread} />
          <Stack name="col4" spread={true} canDrag={canDrag} canDrop={canDropOnSpread} />
          <Stack name="col5" spread={true} canDrag={canDrag} canDrop={canDropOnSpread} />
          <Stack name="col6" spread={true} canDrag={canDrag} canDrop={canDropOnSpread} />
          <Stack name="col7" spread={true} canDrag={canDrag} canDrop={canDropOnSpread} />
          <Stack name="col8" spread={true} canDrag={canDrag} canDrop={canDropOnSpread} />
        </div>
      </>
    ),
    setup: (cardStacks, moveCard) => {
      const deck = cardStacks["spaceA"].cards;
      const indices = Array.from(Array(52)).map((_, index) => index);
      const shuffledDeck = Array.from(Array(52));

      deck.forEach((card) => {
        const index = indices[Math.floor(Math.random() * indices.length)];
        shuffledDeck[index] = card;
        indices.splice(indices.indexOf(index), 1);
      });

      let toStack = 1;
      shuffledDeck.forEach((card) => {
        moveCard({ card, toStack: `col${toStack}` });
        toStack++;

        if (toStack > 8) {
          toStack = 1;
        }
      });
    }
  }
};