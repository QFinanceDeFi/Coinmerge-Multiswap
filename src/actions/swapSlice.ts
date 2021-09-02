import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { initWeb3 } from "../init";

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
            const web3 = initWeb3();
            state.outputs = action.payload.tokens.map((item: any, index: number) => {
                return {
                    address: item,
                    amount: web3.utils.fromWei(action.payload.amounts[index], 'ether')
                }
            });
        }
    }
});

export const { makeSwap, depositAmount, depositToken, updateOutputs } = swapSlice.actions;

export const selectSwap = (state: RootState) => state.swap;

export default swapSlice.reducer;