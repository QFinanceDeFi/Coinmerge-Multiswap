import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface IDepositState {
    name: string;
    symbol: string;
    address: string;
    balance: string;
    priceUsd: string;
    logo: string;
    decimals: number | string;
    depositAmount: string;
    amountOut?: string;
}

const initialState: IDepositState[] = [{
    name: '', symbol: '', address: '', balance: '0', priceUsd: '0', logo: '', decimals: 0, depositAmount: '0.0'
}]

export const getTokenData: any = createAsyncThunk('deposit/info',
    async (token: any): Promise<any> => {
        if (token.token === '') return { index: token.index, priceUsd: '0', logo: '' };
        const url: string = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${token.token}`;
        const { priceUsd, logo } = await fetch(url)
            .then((res: any) => res.json()).then((data: any) => {
                return {
                    priceUsd: data.market_data.current_price.usd,
                    logo: data.image.small
                }
        }).catch((e: any) => {
            console.log(e);
            return { priceUsd: '0', logo: ''};
        });
        
        return { priceUsd, logo, index: token.index };
    });

export const depositSlice = createSlice({
    name: 'deposit',
    initialState,
    reducers: {
        addDepositItem: (state: any) => {
            state.push({
                name: '', symbol: '', address: '', balance: '0', priceUsd: '0', logo: '', decimals: 18, depositAmount: '0.0'
            })
        },
        removeDepositItem: (state: any, action: any) => {
            state.splice(action.payload, 1);
        },
        setDepositItem: (state: IDepositState[], action: PayloadAction<any>) => {
            state[action.payload.index].name = action.payload.name;
            state[action.payload.index].symbol = action.payload.symbol;
            state[action.payload.index].address = action.payload.address;
        },
        updateDepositAmount: (state: IDepositState[], action: PayloadAction<any>) => {
            state[action.payload.index].depositAmount = action.payload.depositAmount;
        },
        updateOutputAmounts: (state: IDepositState[], action: PayloadAction<any>) => {
            const index = state.findIndex(s => s.address === action.payload.address);
            if (index > -1) {
                state[index].amountOut = action.payload.amountOut;    
            }     
        },
        updateDepositDecimals: (state: IDepositState[], action: PayloadAction<any>) => {
            const index = state.findIndex(s => s.address === action.payload.address);
            if (index > -1) {
                state[index].decimals = action.payload.decimals
            }
        }
    },
    extraReducers: {
        [getTokenData.fulfilled]: (state: IDepositState[], action: PayloadAction<any>) => {
            state[action.payload.index].priceUsd = action.payload.priceUsd;
            state[action.payload.index].logo = action.payload.logo;
        }
    }
});

export const { addDepositItem, removeDepositItem, setDepositItem, updateDepositAmount, updateOutputAmounts, updateDepositDecimals } = depositSlice.actions;

export const depositSelect = (state: RootState) => state.deposit;

export default depositSlice.reducer;