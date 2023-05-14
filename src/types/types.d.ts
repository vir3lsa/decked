type Suit = "hearts" | "spades" | "diamonds" | "clubs";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
type Colour = "red" | "black";
type SuitAndColour = [Suit, Colour];

interface Position {
  x: number;
  y: number;
}

interface ICard {
  id: string;
  suit: Suit;
  rank: Rank;
  colour: Colour;
  isDragging?: boolean;
  position?: Position;
}

type CanDragOrDropFunc = (cardStacks: CardStacks, stackName: string, card: ICard) => boolean;
type CanDragOrDrop = boolean | CanDragOrDropFunc;

interface IStack {
  name: string;
  cards: ICard[];
  canDrop?: CanDragOrDropFunc;
  position: Position;
  spread: boolean;
}

interface CardStacks {
  [name: string]: IStack;
}

interface MoveCardThunkPayload {
  card: ICard;
  toStack: string;
}

interface MoveCardPayload {
  card: ICard;
  move: Move;
}

type IsWin = (cardStacks: CardStacks) => boolean;

interface Move {
  cards: string[];
  fromStack: string;
  toStack: string;
  fromIndex: number;
  toIndex: number;
  fromTop: boolean;
}

interface SetDraggingPayload {
  cardId: string;
  stack: string;
  dragging: boolean;
}

type StackMoveComparator = (stack1: IStack, stack2: IStack) => number;

interface RecordPositionPayload {
  id: string;
  position: Position;
}

interface SlidePayload {
  animating: boolean;
  slidingCard?: ICard;
  slidingToStack?: IStack;
  onSlideStart?: VoidCallback;
  onSlideEnd?: VoidCallback;
}

interface AddCardToStackPayload {
  card: ICard;
  stackName: string;
}

type VoidCallback = () => void;