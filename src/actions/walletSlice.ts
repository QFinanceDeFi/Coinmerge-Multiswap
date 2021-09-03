import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initWeb3, SWAP_ADDRESS } from "../init";
import type { RootState } from "../store";
const ierc20 = require('../data/IERC20.json');

interface ITokensState {
    tokenInfo: any;
    balance: any;
    rawBalance: string;
    totalIn: number;
    totalOut: number;
    allowance?: string;
}

interface IWalletState {
    tokens: ITokensState[];
}

const initialState: IWalletState = {
    tokens: []
};

export const getBalances: any = createAsyncThunk('wallet/balances', async (account: string) => {
    const userTokens: any = await fetch(`https://api.ethplorer.io/getAddressInfo/${account}?apiKey=freekey`)
        .then((item: any) => item.json()).then((json: any) => {
            return json.tokens ?? [];
        });

    const web3 = initWeb3();
    const retData = await Promise.all(userTokens.map(async (item: ITokensState) => {
        if (item.tokenInfo.address) {
            const contract = new web3.eth.Contract(ierc20, item.tokenInfo.address);
            return {
                ...item,
                allowance: await contract.methods.allowance(account, SWAP_ADDRESS).call().catch(() => { return '0' })
            }
        }
    }));

    return retData;
})

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        setWallet: (state: IWalletState, action: PayloadAction<any>) => {
            state.tokens = action.payload;
        }
    },
    extraReducers: {
        [getBalances.fulfilled]: (state: IWalletState, action: PayloadAction<any>) => {
            state.tokens = action.payload;
        }
    }
});

export const { setWallet } = walletSlice.actions;

export const selectWallet = (state: RootState) => state.wallet;

export default walletSlice.reducer;