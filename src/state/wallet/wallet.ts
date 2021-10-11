import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { web3 } from "../../data/base";
import type { RootState } from "../../store";

interface ITokensState {
    tokenInfo: any;
    balance: number;
    rawBalance: string;
    totalIn: number;
    totalOut: number;
    allowance?: string;
}

interface IWalletState {
    tokens: ITokensState[];
    basePrice: number;
    baseBalance: string;
    status?: 'pending' | 'success' | 'failed' | 'standby';
}

const initialState: IWalletState = {
    tokens: [],
    basePrice: 0,
    baseBalance: '0',
    status: 'standby'
};

enum coingeckoIds {
    'ethereum' = 1,
    'binancecoin' = 56,
    'matic-network' = 137,
    'avalanche-2' = 43114
}

export const getWalletData: any = createAsyncThunk('wallet/data', async (args, { getState }): Promise<IWalletState> => {
    try {
        const state: any = getState();
        const url: string = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,avalanche-2,matic-network,binancecoin&vs_currencies=usd';
        const accounts: string[] = await web3.eth.getAccounts().catch(() => { return [] });
        if (accounts && accounts.length > 0) {

            const priceUsd: number = await fetch(url).then((res: any) => res.json().then((json: any) => {
                return json[coingeckoIds[Number(state.connect.chainId)]].usd;
            })).catch(() => { return 0 });

            const balance: string = await web3.eth.getBalance(accounts[0]);

            return {
                tokens: [],
                basePrice: priceUsd,
                baseBalance: balance,
                status: 'success'
            }
        } else {
            const priceUsd: number = await fetch(url).then((res: any) => res.json().then((json: any) => {
                return json[coingeckoIds[Number(state.connect.chainId)]].usd;
            })).catch(() => { return 0 });

            return {
                tokens: [],
                basePrice: priceUsd,
                baseBalance: '0',
                status: 'success'
            }
        }

    }
    catch (e) {
        console.log(e);

        return initialState;
    }
});

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        setBaseBalance: (state: IWalletState, action: PayloadAction<string>) => {
            state.baseBalance = action.payload;
        },
        setBasePrice: (state: IWalletState, action: PayloadAction<number>) => {
            state.basePrice = action.payload;
        },
        clearWallet: (state: IWalletState) => {
            state.tokens = [];
            state.baseBalance = '0';
            state.status = 'standby';
        }
    },
    extraReducers: {
        [getWalletData.pending]: (state: IWalletState) => {
            state.status = 'pending';
        },
        [getWalletData.fulfilled]: (state: IWalletState, action: PayloadAction<IWalletState>) => {
            state.tokens = action.payload.tokens;
            state.baseBalance = action.payload.baseBalance;
            state.basePrice = action.payload.basePrice;
            state.status = 'success';
        },
        [getWalletData.rejected]: (state: IWalletState) => {
            state.status = 'failed';
        }
    }
});

export const { setBaseBalance, setBasePrice, clearWallet } = walletSlice.actions;

export const selectWallet = (state: RootState) => state.wallet;

export default walletSlice.reducer;