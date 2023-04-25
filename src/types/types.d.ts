type Suit = "hearts" | "spades" | "diamonds" | "clubs";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
type Colour = "red" | "black";
type SuitAndColour = [Suit, Colour];

interface ICard {
  id: string;
  suit: Suit;
  rank: Rank;
  colour: Colour;
}

type CanDragOrDropFunc = (cardStacks: CardStacks, stackName: string, card: ICard) => boolean;
type CanDragOrDrop = boolean | CanDragOrDropFunc;

interface IStack {
  name: string;
  cards: ICard[];
  canDrop?: CanDragOrDropFunc;
}

interface CardStacks {
  [name: string]: IStack;
}

interface MoveCardPayload {
  card: ICard;
  toStack: string;
}

type IsWin = (cardStacks: CardStacks) => boolean;

interface Move {
  cards: string[];
  fromStack: string;
  toStack: string;
  fromIndex: number;
  toIndex: number;
}
