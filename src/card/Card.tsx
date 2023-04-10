import React, { FunctionComponent } from "react";

const cardStyle = {
  width: "50px",
  height: "100px",
  backgroundColor: "#ffe0f0",
  borderRadius: "10px"
};

interface Props {
  suit: "hearts" | "diamonds" | "spades" | "clubs";
  rank: "ace" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | "jack" | "queen" | "king";
}

const Card: FunctionComponent<Props> = ({ suit, rank }) => {
  return (
    <div style={cardStyle}>
      {rank} of {suit}
    </div>
  );
};

export default Card;
