import { StoreProvider } from "easy-peasy";
import React, { FunctionComponent } from "react";
import { store } from "../model/storeModel";

const Playmat: FunctionComponent = () => {
  return (
    <StoreProvider store={store}>
      <div>PLAYMAT</div>
    </StoreProvider>
  );
};

export default Playmat;
