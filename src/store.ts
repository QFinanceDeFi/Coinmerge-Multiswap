import { configureStore } from "@reduxjs/toolkit";
import tokenReducer from "./actions/tokenSlice";
import connectReducer from "./actions/connectSlice";
import priceReducer from "./actions/priceSlice";
import swapReducer from "./actions/swapSlice";
import depositReducer from "./actions/depositSlice";
import walletReducer from "./actions/walletSlice";

export const store = configureStore({
    reducer: {
        tokens: tokenReducer,
        connect: connectReducer,
        price: priceReducer,
        swap: swapReducer,
        deposit: depositReducer,
        wallet: walletReducer
    }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;