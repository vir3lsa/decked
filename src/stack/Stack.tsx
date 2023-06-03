import React, { CSSProperties, FunctionComponent, useEffect, useMemo, useRef } from "react";
import { v4 as uuid4 } from "uuid";
import { findStack, useStoreActions, useStoreState } from "../model";
import Card from "../card";
import { useDrop } from "react-dnd";
import ItemTypes from "../dnd";
import "./Stack.css";
import { SPREAD_FACTOR } from "../common/constants";

interface Props {
  name: string;
  initialContents?: "fullDeck" | "empty";
  spread?: boolean;
  canDrag?: CanDragOrDrop;
  canDrop?: CanDragOrDrop;
}

const suitsAndColours: SuitAndColour[] = [
  ["hearts", "red"],
  ["spades", "black"],
  ["diamonds", "red"],
  ["clubs", "black"]
];
const ranks: Rank[] = Array.from(Array(13)).map((_, rank) => (rank + 1) as Rank);

const createDeck = () => {
  let deck: ICard[] = [];

  suitsAndColours.forEach(([suit, colour]) => {
    const suitCards = ranks.map((rank) => ({ suit, rank, colour, id: uuid4() }));
    deck = [...deck, ...suitCards];
  });

  return deck;
};

const Stack: FunctionComponent<Props> = ({ name, initialContents, spread = false, canDrag = true, canDrop = true }) => {
  const cards = useStoreState((state) => state.cards);
  const cardStacks = useStoreState((state) => state.cardStacks);
  const cardsInStack = useStoreState((state) => state.cardStacks[name]?.cards);
  const addStack = useStoreActions((state) => state.addStack);
  const moveCardThunk = useStoreActions((state) => state.moveCardThunk);
  const animationRef = useRef<HTMLDivElement>(null);
  const canDragFunc = typeof canDrag === "function" ? canDrag : () => canDrag;
  const canDropFunc = typeof canDrop === "function" ? canDrop : () => canDrop;

  const topCard = cardsInStack?.[cardsInStack.length - 1];

  useEffect(() => {
    if (!cardsInStack && animationRef.current) {
      const rect = animationRef.current.getBoundingClientRect();
      const cards = initialContents === "fullDeck" ? createDeck() : [];
      addStack({
        stack: {
          name,
          cards: cards.map((card) => card.id),
          canDrop: canDropFunc,
          position: { x: rect.left, y: rect.top },
          spread
        },
        cards
      });
    }
    // Update model with initial contents
  }, [name, initialContents]);

  const [, dropRef] = useDrop(
    () => ({
      accept: ItemTypes.CARD,
      drop: (card) => {
        const [stack, index] = findStack(cardStacks, (card as ICard).id);
        const cards = stack.cards.slice(index); // Cards to top of stack.
        moveCardThunk({ cards, toStack: name });
      },
      canDrop: (card) => {
        return canDrop ? canDropFunc(cards, cardStacks, name, card as ICard) : true;
      }
    }),
    [name, canDrop, cardStacks]
  );

  return (
    <div ref={animationRef}>
      <div className="stack" ref={dropRef}>
        <div className="empty" />
        {cardsInStack?.length && spread ? (
          cardsInStack.map((card, index) => (
            <Card
              key={card}
              id={card}
              top={`${index * SPREAD_FACTOR}px`}
              stack={name}
              canDrag={(card) => {
                return canDrag ? canDragFunc(cards, cardStacks, name, card) : true;
              }}
            />
          ))
        ) : topCard ? (
          <Card
            id={topCard}
            top="0px"
            stack={name}
            canDrag={(card) => (canDrag ? canDragFunc(cards, cardStacks, name, card) : true)}
          />
        ) : undefined}
      </div>
    </div>
  );
};

export default Stack;
