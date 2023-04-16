import { action, Action, createStore, createTypedHooks } from "easy-peasy";

interface StoreModel {
  cardStacks: {
    [name: string]: IStack;
  };
  addStack: Action<StoreModel, IStack>;
  moveCard: Action<StoreModel, MoveCardPayload>;
}

export const store = createStore<StoreModel>({
  cardStacks: {},
  addStack: action((state, stack) => {
    state.cardStacks[stack.name] = stack;
  }),
  moveCard: action((state, payload) => {
    // Find the card in the old stack
    let fromStack: IStack | undefined, fromIndex: number | undefined;
    Object.values(state.cardStacks).forEach((stack) => {
      const indexOfCard = stack.cards.findIndex((card) => card.id === payload.card.id);

      if (indexOfCard > -1) {
        fromStack = stack;
        fromIndex = indexOfCard;
      }
    });

    // Remove the card from the old stack
    if (fromStack && fromIndex !== undefined) {
      fromStack.cards.splice(fromIndex);
    } else {
      throw Error(
        `Couldn't find card: { id: ${payload.card.id}, suit: ${payload.card.suit}, rank: ${payload.card.rank} }`
      );
    }

    // Add the card to the new stack
    state.cardStacks[payload.toStack].cards.push(payload.card);
  })
});

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
