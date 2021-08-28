import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { initWeb3, swapContract, SWAP_ADDRESS } from "../init";
import Web3 from "web3";

interface IOutputsState {
    address: string;
    amount: string;
}

interface ISwapState {
    depositAmount: string;
    outputs: IOutputsState[];
}

const initialState: ISwapState = {
    depositAmount: '',
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
        updateOutputs: (state: ISwapState, action: PayloadAction<any>) => {
            if (action.payload.length > 0) {
                state.outputs = action.payload[0].map((item: any, index: number) => {
                    return {
                        address: item,
                        amount: action.payload[1][index]
                    }
                });              
            }
        }
    }
});

export const { makeSwap, depositAmount, updateOutputs } = swapSlice.actions;

export const selectSwap = (state: RootState) => state.swap;

export default swapSlice.reducer;