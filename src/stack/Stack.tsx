import React, { CSSProperties, FunctionComponent, useEffect } from "react";
import { useStoreActions, useStoreState } from "../model";
import Card from "../card";

interface Props {
  name: string;
  initialContents?: "fullDeck" | "empty";
  spread?: boolean;
}

const fullDeck = [
  { suit: "hearts", rank: "ace" },
  { suit: "hearts", rank: 2 },
  { suit: "hearts", rank: 3 },
  { suit: "hearts", rank: 4 },
  { suit: "hearts", rank: 5 },
  { suit: "hearts", rank: 6 },
  { suit: "hearts", rank: 7 },
  { suit: "hearts", rank: 8 },
  { suit: "hearts", rank: 9 },
  { suit: "hearts", rank: 10 },
  { suit: "hearts", rank: "jack" },
  { suit: "hearts", rank: "queen" },
  { suit: "hearts", rank: "king" },
  { suit: "spades", rank: "ace" },
  { suit: "spades", rank: 2 },
  { suit: "spades", rank: 3 },
  { suit: "spades", rank: 4 },
  { suit: "spades", rank: 5 },
  { suit: "spades", rank: 6 },
  { suit: "spades", rank: 7 },
  { suit: "spades", rank: 8 },
  { suit: "spades", rank: 9 },
  { suit: "spades", rank: 10 },
  { suit: "spades", rank: "jack" },
  { suit: "spades", rank: "queen" },
  { suit: "spades", rank: "king" },
  { suit: "diamonds", rank: "ace" },
  { suit: "diamonds", rank: 2 },
  { suit: "diamonds", rank: 3 },
  { suit: "diamonds", rank: 4 },
  { suit: "diamonds", rank: 5 },
  { suit: "diamonds", rank: 6 },
  { suit: "diamonds", rank: 7 },
  { suit: "diamonds", rank: 8 },
  { suit: "diamonds", rank: 9 },
  { suit: "diamonds", rank: 10 },
  { suit: "diamonds", rank: "jack" },
  { suit: "diamonds", rank: "queen" },
  { suit: "diamonds", rank: "king" },
  { suit: "clubs", rank: "ace" },
  { suit: "clubs", rank: 2 },
  { suit: "clubs", rank: 3 },
  { suit: "clubs", rank: 4 },
  { suit: "clubs", rank: 5 },
  { suit: "clubs", rank: 6 },
  { suit: "clubs", rank: 7 },
  { suit: "clubs", rank: 8 },
  { suit: "clubs", rank: 9 },
  { suit: "clubs", rank: 10 },
  { suit: "clubs", rank: "jack" },
  { suit: "clubs", rank: "queen" },
  { suit: "clubs", rank: "king" }
] satisfies ICard[];

const emptyStackStyle: CSSProperties = {
  width: "128px",
  height: "180px",
  border: "5px solid #b0b0b0",
  borderRadius: "16px",
  boxSizing: "border-box"
};

const SPREAD_FACTOR = 45;

const Stack: FunctionComponent<Props> = ({ name, initialContents, spread = false }) => {
  const cards = useStoreState((state) => state.cardPiles);
  const addPile = useStoreActions((state) => state.addPile);
  const cardsInPile = cards[name]?.cards;
  const topCard = cardsInPile?.[cardsInPile.length - 1];

  useEffect(() => {
    if (!cardsInPile) {
      addPile({ name, cards: initialContents === "fullDeck" ? fullDeck : [] });
    }
    // Update model with initial contents
  }, [name, initialContents]);

  return (
    <div style={{ position: "relative" }}>
      {spread ? (
        cardsInPile?.map((card, index) => (
          <Card
            key={`${card.suit}-${card.rank}`}
            suit={card.suit}
            rank={card.rank}
            top={`${index * SPREAD_FACTOR}px`}
          />
        ))
      ) : topCard ? (
        <Card suit={topCard?.suit} rank={topCard?.rank} />
      ) : (
        <div style={emptyStackStyle} />
      )}
    </div>
  );
};

export default Stack;
