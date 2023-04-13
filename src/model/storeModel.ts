import { action, Action, createStore, createTypedHooks } from "easy-peasy";

interface StoreModel {
  cardPiles: {
    [name: string]: IPile;
  };
  addPile: Action<StoreModel, IPile>;
}

export const store = createStore<StoreModel>({
  cardPiles: {},
  addPile: action((state, pile) => {
    state.cardPiles[pile.name] = pile;
  })
});

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
