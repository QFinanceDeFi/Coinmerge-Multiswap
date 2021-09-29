import { configureStore } from "@reduxjs/toolkit";
import connectReducer from "./state/connect/connect";
import swapReducer from "./state/swap/swap";
import depositReducer from "./state/deposit/deposit";
import walletReducer from "./state/wallet/wallet";
import tokensReducer from "./state/tokens/tokens";
import txReducer from "./state/tx/tx";

export const store = configureStore({
    reducer: {
        connect: connectReducer,
        swap: swapReducer,
        deposit: depositReducer,
        tokens: tokensReducer,
        wallet: walletReducer,
        tx: txReducer
    }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;