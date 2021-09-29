import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

interface IDepositTokenState {
    name: string;
    symbol: string;
    address: string;
    decimals: string;
    balance: string;
    depositAmount: string;
    slippage: number;
    amountOut?: string;
}

interface IDepositState {
    tokens: IDepositTokenState[];
    status: 'standby' | 'pending' | 'success' | 'failed';
}

const initialState: IDepositState = {
    tokens: [],
    status: 'standby'
};

export const getTokenData: any = createAsyncThunk('deposit/info',
    async (args: {token: string, index: number}, { getState }) => {
        const state: any = getState();
        const findInWallet: any = state.wallet.tokens.find((t: any) => t.tokenInfo.address === args.token);
        if (!findInWallet) {
            return {
                ...state.deposit[args.index],
                address: args.token,
                balance: '0',
                index: args.index
            }
        }
        else {
            return {
                ...state.deposit[args.index],
                name: findInWallet.tokenInfo.name,
                symbol: findInWallet.tokenInfo.symbol,
                address: args.token,
                decimals: findInWallet.tokenInfo.decimals,
                index: args.index
            }
        }
    })

export const depositSlice = createSlice({
    name: 'deposit',
    initialState,
    reducers: {
        addDepositItem: (state: IDepositState) => {
            state.tokens.push({
                name: '', symbol: '', address: '', decimals: '18', balance: '0', depositAmount: '0', slippage: 0, amountOut: '0'
            });
        },
        removeDepositItem: (state: IDepositState, action: PayloadAction<number>) => {
            state.tokens.splice(action.payload, 1);
        },
        updateDepositAmount: (state: IDepositState, action: PayloadAction<{index: number, amount: string}>) => {
            state.tokens[action.payload.index].depositAmount = action.payload.amount;
        }
    },
    extraReducers: {
        [getTokenData.pending]: (state: IDepositState) => {
            state.status = 'pending';
        },
        [getTokenData.fulfilled]: (state: IDepositState, action: PayloadAction<any>) => {
            state.tokens[action.payload.index] = {
                ...state.tokens[action.payload.index],
                name: action.payload.name,
                symbol: action.payload.symbol,
                address: action.payload.address,
                decimals: action.payload.decimals,
                slippage: action.payload.slippage,
                balance: action.payload.balance
            }
            state.status = 'success';
        },
        [getTokenData.failed]: (state: IDepositState) => {
            state.status = 'failed';
        }
    }
});

export const { addDepositItem, removeDepositItem, updateDepositAmount } = depositSlice.actions;
export const selectDeposit = (state: RootState) => state.deposit;
export default depositSlice.reducer;