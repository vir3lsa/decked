import React, { CSSProperties, FunctionComponent, useEffect } from "react";
import { v4 as uuid4 } from "uuid";
import { useStoreActions, useStoreState } from "../model";
import Card from "../card";
import { useDrop } from "react-dnd";
import ItemTypes from "../dnd";

interface Props {
  name: string;
  initialContents?: "fullDeck" | "empty";
  spread?: boolean;
}

const suits: Suit[] = ["hearts", "spades", "diamonds", "clubs"];
const ranks: Rank[] = Array.from(Array(13)).map((_, rank) => (rank + 1) as Rank);

const createDeck = () => {
  let deck: ICard[] = [];

  suits.forEach((suit) => {
    const suitCards = ranks.map((rank) => ({ suit, rank, id: uuid4() }));
    deck = [...deck, ...suitCards];
  });

  return deck;
};

const emptyStackStyle: CSSProperties = {
  width: "128px",
  height: "180px",
  border: "5px solid #b0b0b0",
  borderRadius: "16px",
  boxSizing: "border-box"
};

const SPREAD_FACTOR = 45;

const Stack: FunctionComponent<Props> = ({ name, initialContents, spread = false }) => {
  const cardsInPile = useStoreState(
    (state) => state.cardStacks[name]?.cards,
    (previous, next) => {
      return previous === next;
    }
  );
  const addStack = useStoreActions((state) => state.addStack);
  const moveCard = useStoreActions((state) => state.moveCard);

  const topCard = cardsInPile?.[cardsInPile.length - 1];

  useEffect(() => {
    if (!cardsInPile) {
      addStack({ name, cards: initialContents === "fullDeck" ? createDeck() : [] });
    }
    // Update model with initial contents
  }, [name, initialContents]);

  const [, dropRef] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (card) => moveCard({ card: card as ICard, toStack: name })
  }));

  return (
    <div style={{ position: "relative" }} ref={dropRef}>
      {cardsInPile?.length && spread ? (
        cardsInPile.map((card, index) => (
          <Card key={card.id} id={card.id} suit={card.suit} rank={card.rank} top={`${index * SPREAD_FACTOR}px`} />
        ))
      ) : topCard ? (
        <Card id={topCard.id} suit={topCard.suit} rank={topCard.rank} />
      ) : (
        <div style={emptyStackStyle} />
      )}
    </div>
  );
};

export default Stack;
