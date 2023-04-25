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

const emptyStackStyle: CSSProperties = {
  width: "128px",
  height: "180px",
  border: "5px solid #b0b0b0",
  borderRadius: "16px",
  boxSizing: "border-box"
};

const SPREAD_FACTOR = 45;

const Stack: FunctionComponent<Props> = ({ name, initialContents, spread = false, canDrag = true, canDrop = true }) => {
  const cardStacks = useStoreState((state) => state.cardStacks);
  const cardsInStack = useStoreState((state) => state.cardStacks[name]?.cards);
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

  return (
    <div style={{ position: "relative" }} ref={dropRef}>
      {cardsInStack?.length && spread ? (
        cardsInStack.map((card, index) => (
          <Card
            key={card.id}
            id={card.id}
            suit={card.suit}
            rank={card.rank}
            colour={card.colour}
            top={`${index * SPREAD_FACTOR}px`}
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
          canDrag={(card) => (canDrag ? canDragFunc(cardStacks, name, card) : true)}
        />
      ) : (
        <div style={emptyStackStyle} />
      )}
    </div>
  );
};

export default Stack;
