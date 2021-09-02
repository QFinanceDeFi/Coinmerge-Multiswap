import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface ITokenState {
    name: string;
    symbol: string;
    address: string;
    percent: number;
    priceUsd: string;
    balance: string;
    logo: string;
    slippage: number;
    status?: 'loading' | 'standby' | 'success' | 'error';
}

const initialState: ITokenState[] = [{
    name: '',
    symbol: '',
    address: '',
    percent: 0,
    priceUsd: '0',
    balance: '0',
    logo: '',
    slippage: 0,
    status: 'standby'
}];

export const getTokenInfo: any = createAsyncThunk('tokens/info',
    async (data: any): Promise<any> => {
        if (data.token === '') return { index: data.index, priceUsd: '0', logo: '' };
        const url: string = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${data.token}`;
        const { priceUsd, logo } = await fetch(url)
            .then((res: any) => res.json()).then((json: any) => {
                return {
                    priceUsd: json.market_data.current_price.usd,
                    logo: json.image.small
                }
        });
        
        return { priceUsd, logo, index: data.index };
    });

export const tokenSlice = createSlice({
    name: 'tokens',
    initialState,
    reducers: {
        addItem: state => {
            state.push({name: '', symbol: '', address: '', percent: 0, priceUsd: '0', balance: '0', slippage: 0, logo: ''});
        },
        removeItem: (state: ITokenState[], action: PayloadAction<number>) => {
            state.splice(action.payload, 1);
        },
        updateItem: (state: ITokenState[], action: PayloadAction<any>) => {
            state.splice(action.payload.index, 1, {
                name: action.payload.name,
                symbol: action.payload.symbol,
                address: action.payload.address,
                percent: action.payload.percent,
                balance: '0',
                slippage: action.payload.slippage,
                priceUsd: action.payload.priceUsd,
                logo: action.payload.logo
            });
        },
        updateSlippage: (state: ITokenState[], action: PayloadAction<any>) => {
            state[action.payload.index].slippage = action.payload.slippage;
        }
    },
    extraReducers: {
        [getTokenInfo.fulfilled]: (state: ITokenState[], action: PayloadAction<any>) => {
            state[action.payload.index].priceUsd = action.payload.priceUsd;
            state[action.payload.index].logo = action.payload.logo;
        }
    }
});

export const { addItem, removeItem, updateItem, updateSlippage } = tokenSlice.actions;

export const selectTokens = (state: RootState) => state.tokens;

export default tokenSlice.reducer;