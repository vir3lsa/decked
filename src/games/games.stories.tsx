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

const MOVE_TIMEOUT = 50;

const findStack = (cardStacks: CardStacks, cardId: string): [IStack, number] => {
  let fromStack: IStack | undefined, fromIndex: number | undefined;
  Object.values(cardStacks).forEach((stack) => {
    if (fromStack) {
      // Short-circuit if we've already found the stack.
      return;
    }

    const indexOfCard = stack.cards.indexOf(cardId);

    if (indexOfCard > -1) {
      fromStack = stack;
      fromIndex = indexOfCard;
    }
  });

  if (!fromStack || fromIndex === undefined) {
    throw Error(`Couldn't find card ${cardId} in any stack.`);
  }

  return [fromStack, fromIndex];
};

const canDrag = (cards: CardMap, cardStacks: CardStacks, stackName: string, card: ICard) => {
  const cardsInStack = cardStacks[stackName].cards;
  const index = cardsInStack.indexOf(card.id);
  const isTopCard = index === cardsInStack.length - 1;

  // If it's the top card then we can definitely drag it.
  if (isTopCard) {
    return true;
  }

  // If not, we need to see whether it's part of a sequence.
  for (let i = index + 1; i < cardsInStack.length; i++) {
    const nextCard = cards[cardsInStack[i]];
    const previousCard = cards[cardsInStack[i - 1]];

    if (nextCard.colour === previousCard.colour || nextCard.rank !== previousCard.rank - 1) {
      // It's not part of a sequence, so it can't be dragged.
      return false;
    }
  }

  return true;
};

const canDropOnSpace = (_: CardMap, cardStacks: CardStacks, stackName: string, card: ICard) => {
  const [fromStack, fromIndex] = findStack(cardStacks, card.id);
  const movingSequence = fromIndex < fromStack.cards.length - 1;
  return cardStacks[stackName].cards.length < 1 && !movingSequence;
};
const canDropOnSuit = (cardMap: CardMap, cardStacks: CardStacks, stackName: string, card: ICard) => {
  const [fromStack, fromIndex] = findStack(cardStacks, card.id);
  const movingSequence = fromIndex < fromStack.cards.length - 1;
  const cards = cardStacks[stackName].cards;
  const lastCard = cardMap[cards[cards.length - 1]];
  const canDrop = (!lastCard && card.rank === 1) || (lastCard?.suit === card.suit && lastCard?.rank === card.rank - 1);
  return canDrop && !movingSequence;
};
const canDropOnSpread = (cardMap: CardMap, cardStacks: CardStacks, stackName: string, card: ICard) => {
  const [fromStack, fromIndex] = findStack(cardStacks, card.id);
  const movingSequence = fromIndex < fromStack.cards.length - 1;

  if (movingSequence) {
    // If we're moving a sequence, work out whether there are enough free spaces.
    const numFreeCells = Object.values(cardStacks).filter(
      (stack) => stack.name.startsWith("space") && !stack.cards.length
    ).length;
    const numFreeSpreads = Object.values(cardStacks).filter(
      (stack) => stack.name.startsWith("col") && !stack.cards.length && stack.name !== stackName
    ).length;
    const maxMoveableCards = (numFreeCells + 1) * 2 ** numFreeSpreads;
    const cardsToMove = fromStack.cards.length - fromIndex;

    if (cardsToMove > maxMoveableCards) {
      return false;
    }
  }

  const cards = cardStacks[stackName].cards;
  const lastCard = cardMap[cards[cards.length - 1]];
  const canDrop = !lastCard || (card.colour !== lastCard.colour && lastCard.rank === card.rank + 1);
  return canDrop;
};

const isWin = (cardStacks: CardStacks) =>
  cardStacks["suit1"].cards.length === 13 &&
  cardStacks["suit2"].cards.length === 13 &&
  cardStacks["suit3"].cards.length === 13 &&
  cardStacks["suit4"].cards.length === 13;

const preferredMoveStacks = [
  "suit1",
  "suit2",
  "suit3",
  "suit4",
  "col1",
  "col2",
  "col3",
  "col4",
  "col5",
  "col6",
  "col7",
  "col8",
  "spaceA",
  "spaceB",
  "spaceC",
  "spaceD"
];

const compareMoveStacks = (stack1: IStack, stack2: IStack) => {
  const occupancyComparison =
    stack1.cards.length && !stack2.cards.length ? -1 : stack2.cards.length && !stack1.cards.length ? 1 : 0;

  if (occupancyComparison !== 0) {
    return occupancyComparison;
  }

  return preferredMoveStacks.indexOf(stack1.name) - preferredMoveStacks.indexOf(stack2.name);
};

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
          <Stack name="col1" spread canDrag={canDrag} canDrop={canDropOnSpread} />
          <Stack name="col2" spread canDrag={canDrag} canDrop={canDropOnSpread} />
          <Stack name="col3" spread canDrag={canDrag} canDrop={canDropOnSpread} />
          <Stack name="col4" spread canDrag={canDrag} canDrop={canDropOnSpread} />
          <Stack name="col5" spread canDrag={canDrag} canDrop={canDropOnSpread} />
          <Stack name="col6" spread canDrag={canDrag} canDrop={canDropOnSpread} />
          <Stack name="col7" spread canDrag={canDrag} canDrop={canDropOnSpread} />
          <Stack name="col8" spread canDrag={canDrag} canDrop={canDropOnSpread} />
        </div>
      </>
    ),
    setup: (cardStacks, moveCardThunk) => {
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
        moveCardThunk({ card, toStack: `col${toStack}` });
        toStack++;

        if (toStack > 8) {
          toStack = 1;
        }
      });
    },
    isWin,
    compareMoveStacks,
    onMove: (cards, cardStacks, move, moveCardThunk, setSlide) => {
      const fromStackCards = cardStacks[move.fromStack].cards;

      if (move.fromIndex < fromStackCards.length) {
        // Wasn't moved from top of stack, so moving a sequence. Now move the next card in the sequence.
        setSlide({
          animating: true,
          slidingCard: fromStackCards[move.fromIndex],
          slidingToStack: cardStacks[move.toStack],
          onSlideStart: () => moveCardThunk({ card: fromStackCards[move.fromIndex], toStack: move.toStack })
        });

        return;
        // return moveCardThunk({ card: fromStackCards[move.fromIndex], toStack: move.toStack });
      }

      const playStacks = Object.values(cardStacks).filter((stack) => !stack.name.startsWith("suit"));
      const suitStacks = Object.values(cardStacks).filter((stack) => stack.name.startsWith("suit"));

      let cardToMove: ICard | undefined, destinationStack: IStack | undefined;

      playStacks.forEach((playStack) => {
        if (cardToMove) {
          // Short-circuit if we've already found a card to move.
          return;
        }
        // Look at the last card of the stack.
        const candidate = playStack.cards.length && cards[playStack.cards[playStack.cards.length - 1]];

        if (!candidate) {
          // If the stack's empty, move on.
          return;
        }

        // Check there's nothing in the top layer that could be put on this card.
        const stackWithDroppableCard = playStacks
          .filter((stack) => stack.name !== playStack.name)
          .find((stack) => {
            const topCard = cards[stack.cards[stack.cards.length - 1]];

            if (topCard && topCard.colour !== candidate.colour && topCard.rank === candidate.rank - 1) {
              // This card could drop on the candidate, so it's a match.
              return true;
            }
          });

        if (stackWithDroppableCard) {
          // Short-circuit as this candidate has a card that could drop on it.
          return;
        }

        const availableSuitStack = suitStacks.find((suitStack) => {
          const lastSuitCard = suitStack.cards.length && cards[suitStack.cards[suitStack.cards.length - 1]];

          if (lastSuitCard && lastSuitCard.suit === candidate.suit && lastSuitCard.rank === candidate.rank - 1) {
            return true;
          } else if (!lastSuitCard && candidate.rank === 1) {
            return true;
          }
        });

        if (availableSuitStack) {
          // We've got a match!
          cardToMove = candidate;
          destinationStack = availableSuitStack;
        }
      });

      if (cardToMove && destinationStack) {
        // moveCardThunk({ card: cardToMove, toStack: destinationStack.name });
        setSlide({
          animating: true,
          slidingCard: cardToMove.id,
          slidingToStack: destinationStack,
          onSlideStart: () => moveCardThunk({ card: cardToMove!.id, toStack: destinationStack!.name })
        });
      }
    },
    onUndo: (_, history, undoThunk) => {
      setTimeout(() => {
        const lastMove = history.length && history[history.length - 1];

        if (lastMove && !lastMove.fromTop) {
          // The last move was part of a sequence, so we need to undo that too.
          undoThunk();
        }
      }, MOVE_TIMEOUT);
    }
  }
};
