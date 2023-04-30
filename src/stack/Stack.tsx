import React, { CSSProperties, FunctionComponent, useEffect } from "react";
import { v4 as uuid4 } from "uuid";
import { useStoreActions, useStoreState } from "../model";
import Card from "../card";
import { useDrop } from "react-dnd";
import ItemTypes from "../dnd";
import "./Stack.css";
import { SPREAD_FACTOR } from "../common/constants";
import { store } from "../model/storeModel";

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
  const cardStacks = useStoreState((state) => state.cardStacks);
  const cardsInStack = useStoreState((state) => state.cardStacks[name]?.cards);
  const dragMultiple = useStoreState((state) => state.dragMultiple);
  const addStack = useStoreActions((state) => state.addStack);
  const moveCardThunk = useStoreActions((state) => state.moveCardThunk);
  const canDragFunc = typeof canDrag === "function" ? canDrag : () => canDrag;
  const canDropFunc = typeof canDrop === "function" ? canDrop : () => canDrop;

  const topCard = cardsInStack?.[cardsInStack.length - 1];

  useEffect(() => {
    if (!cardsInStack) {
      addStack({ name, cards: initialContents === "fullDeck" ? createDeck() : [], canDrop: canDropFunc });
    }
    // Update model with initial contents
  }, [name, initialContents]);

  const [, dropRef] = useDrop(
    () => ({
      accept: ItemTypes.CARD,
      drop: (card) => moveCardThunk({ card: card as ICard, toStack: name }),
      canDrop: (card) => {
        return canDrop ? canDropFunc(cardStacks, name, card as ICard) : true;
      }
    }),
    [name, canDrop, cardStacks]
  );

  const draggingIndex = dragMultiple ? cardsInStack?.findIndex((card) => card.isDragging) : -1;

  return (
    <div className="stack" ref={dropRef}>
      {cardsInStack?.length && spread ? (
        cardsInStack.map((card, index) => (
          <Card
            key={card.id}
            id={card.id}
            suit={card.suit}
            rank={card.rank}
            colour={card.colour}
            top={`${index * SPREAD_FACTOR}px`}
            stack={name}
            stackDragging={draggingIndex !== -1 && index > draggingIndex}
            canDrag={(card) => {
              return canDrag ? canDragFunc(cardStacks, name, card) : true;
            }}
          />
        ))
      ) : topCard ? (
        <Card
          id={topCard.id}
          suit={topCard.suit}
          rank={topCard.rank}
          colour={topCard.colour}
          stack={name}
          stackDragging={false}
          canDrag={(card) => (canDrag ? canDragFunc(cardStacks, name, card) : true)}
        />
      ) : (
        <div className="empty" />
      )}
    </div>
  );
};

export default Stack;
