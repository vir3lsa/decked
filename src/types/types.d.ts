interface ICard {
  suit: "hearts" | "spades" | "diamonds" | "clubs";
  rank: "ace" | "jack" | "queen" | "king" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
}

interface IPile {
  name: string;
  cards: ICard[];
}
