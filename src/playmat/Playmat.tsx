import { StoreProvider } from "easy-peasy";
import React, { FunctionComponent, ReactNode } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { store } from "../model/storeModel";

interface Props {
  children?: ReactNode;
}

const Playmat: FunctionComponent<Props> = ({ children }) => {
  return (
    <StoreProvider store={store}>
      <DndProvider backend={HTML5Backend}>{children}</DndProvider>
    </StoreProvider>
  );
};

export default Playmat;
