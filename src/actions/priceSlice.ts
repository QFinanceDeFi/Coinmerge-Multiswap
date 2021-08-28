import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface ICoinDetails {
    symbol: string;
    name: string;
    priceUsd: string;
    status: 'loading' | 'succeeded' | 'failed' | 'standby';
}

export const getPrice: any = createAsyncThunk('price/updatePrice', async (coin: string): Promise<ICoinDetails> => {
    const url = `https://api.coincap.io/v2/assets?search=${coin}&limit=1`;
    return await fetch(url).then(res => res.json()).then(data => {
        if (data.data.length !== 0) {
            return {
                symbol: data.data[0].symbol,
                name: data.data[0].name,
                priceUsd: data.data[0].priceUsd,
                status: 'succeeded'
            };
        } else {
            return {
                symbol: '',
                name: '',
                priceUsd: '',
                status: 'failed'
            }
        }
    });
})

export const priceSlice = createSlice({
    name: 'price',
    initialState: {
        symbol: '',
        name: '',
        priceUsd: '',
        status: 'standby'
    },
    reducers: {
        updatePrice: () => {
            return;
        }
    },
    extraReducers: {
        [getPrice.pending]: state => {
          state.status = 'loading';
        },
        [getPrice.fulfilled]: (state, action: PayloadAction<any>) => {
          state.status = 'succeeded';
          state.symbol = action.payload.symbol;
          state.name = action.payload.name;
          state.priceUsd = action.payload.priceUsd;
        },
        [getPrice.rejected]: state => {
          state.status = 'failed';
        }
      }
});

export const { updatePrice } = priceSlice.actions;

export const selectPrice = (state: RootState) => state.price;

export default priceSlice.reducer;