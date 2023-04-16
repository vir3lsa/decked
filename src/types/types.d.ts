type Suit = "hearts" | "spades" | "diamonds" | "clubs";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

interface ICard {
  id: string;
  suit: Suit;
  rank: Rank;
}

interface IStack {
  name: string;
  cards: ICard[];
}

interface CardStacks {
  [name: string]: IStack;
}

interface MoveCardPayload {
  card: ICard;
  toStack: string;
}
