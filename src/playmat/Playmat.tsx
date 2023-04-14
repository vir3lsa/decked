import { StoreProvider } from "easy-peasy";
import React, { FunctionComponent, ReactNode } from "react";
import { store } from "../model/storeModel";

interface Props {
  children?: ReactNode;
}

const Playmat: FunctionComponent<Props> = ({ children }) => {
  return <StoreProvider store={store}>{children}</StoreProvider>;
};

export default Playmat;
