import { action, Action, createStore, createTypedHooks } from "easy-peasy";

export interface StoreModel {
  cardStacks: CardStacks;
  setupHasRun: boolean;
  isWin?: IsWin;
  win: boolean;
  history: Move[];
  addStack: Action<StoreModel, IStack>;
  moveCard: Action<StoreModel, MoveCardPayload>;
  setSetupHasRun: Action<StoreModel, boolean>;
  setIsWin: Action<StoreModel, IsWin>;
  undo: Action<StoreModel>;
}

const findCard = (cardId: string, cardStacks: CardStacks): ICard => {
  for (const stack of Object.values(cardStacks)) {
    const card = stack.cards.find((card) => card.id === cardId);

    if (card) {
      return card;
    }
  }

  throw Error(`Couldn't find card with ID: ${cardId}`);
};

export const store = createStore<StoreModel>({
  cardStacks: {},
  setupHasRun: false,
  win: false,
  history: [],
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
      fromStack.cards.splice(fromIndex, 1);
    } else {
      throw Error(
        `Couldn't find card: { id: ${payload.card.id}, suit: ${payload.card.suit}, rank: ${payload.card.rank} }`
      );
    }

    // Add the card to the new stack
    state.cardStacks[payload.toStack].cards.push(payload.card);

    // Check the win condition
    if (state.isWin && state.isWin(state.cardStacks)) {
      state.win = true;
    }

    if (state.setupHasRun) {
      // Record the move
      state.history.push({
        cards: [payload.card.id],
        fromStack: fromStack.name,
        toStack: payload.toStack,
        fromIndex,
        toIndex: state.cardStacks[payload.toStack].cards.length - 1
      });
    }
  }),
  setSetupHasRun: action((state, setupHasRun) => {
    state.setupHasRun = setupHasRun;
  }),
  setIsWin: action((state, isWin) => {
    state.isWin = isWin;
  }),
  undo: action((state) => {
    const lastMove = state.history.pop();

    if (lastMove) {
      const cards = lastMove.cards.map((id) => findCard(id, state.cardStacks));
      const fromStack = Object.values(state.cardStacks).find((stack) => stack.name === lastMove.fromStack);
      const toStack = Object.values(state.cardStacks).find((stack) => stack.name === lastMove.toStack);

      if (cards && fromStack && toStack) {
        cards.forEach((card) => {
          toStack.cards.splice(lastMove.toIndex, 1);
          fromStack.cards.push(card);
        });
      } else {
        throw Error("Couldn't undo: couldn't find cards or fromStack or toStack");
      }
    }
  })
});

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
