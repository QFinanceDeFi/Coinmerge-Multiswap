import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface IOutputsState {
    address: string;
    amount: string;
}

interface ISwapState {
    depositAmount: string;
    address: string;
    allowance: string;
    balance: string;
    outputs: IOutputsState[];
}

const initialState: ISwapState = {
    depositAmount: '',
    address: '',
    allowance: '0',
    balance: '0',
    outputs: []
}

export const swapSlice = createSlice({
    name: 'swap',
    initialState,
    reducers: {
        makeSwap: () => {},
        depositAmount: (state: ISwapState, action: PayloadAction<string>) => {
            state.depositAmount = action.payload;
        },
        depositToken: (state: ISwapState, action: PayloadAction<string>) => {
            state.address = action.payload;
        },
        updateOutputs: (state: ISwapState, action: PayloadAction<any>) => {
            state.outputs = action.payload.tokens.map((item: any, index: number) => {
                return {
                    address: item,
                    amount: action.payload.amounts[index]
                }
            });
        }
    }
});

export const { makeSwap, depositAmount, depositToken, updateOutputs } = swapSlice.actions;

export const selectSwap = (state: RootState) => state.swap;

export default swapSlice.reducer;