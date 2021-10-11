import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SWAP_ADDRESS, web3 } from "../../data/base";
import { NetworkImages, Networks } from "../../data/networks";
import type { RootState } from "../../store";

const erc20 = require('../../data/IERC20.json');

interface ITokenState {
    name: string;
    symbol: string;
    address: string;
    percent: number;
    priceUsd: string;
    balance: string;
    logo: string;
    slippage: number;
    decimals: number;
    depositAmount: string;
    allowance?: string;
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
    decimals: 18,
    slippage: 0,
    depositAmount: '0',
    allowance: '0',
    status: 'standby'
}];

export const getTokenInfo: any = createAsyncThunk('tokens/info', async (data: any, { getState, dispatch }): Promise<any> => {
    const state: any = await getState();
    const chain: {name: string, id: string} = JSON.parse(Networks[Number(state.connect.chainId)] ?? '{"name": "Ethereum", "id": "ethereum"}');
    if (data.token === '') {
        return {
            index: data.index,
            priceUsd: '0',
            logo: NetworkImages[Number(state.connect.chainId)]
        };
    }
    const url: string = `https://api.coingecko.com/api/v3/coins/${chain.id}/contract/${data.token}`;
    const { priceUsd, logo } = await fetch(url)
        .then((res: any) => res.json()).then((json: any) => {
            return {
                priceUsd: json.market_data.current_price.usd ?? 0,
                logo: json.image.small
            }
    });

    dispatch(await getTokenBalance({index: data.index, token: data.token}));
    
    return { priceUsd, logo, index: data.index };
});

export const getTokenBalance: any = createAsyncThunk('tokens/balance', async (args: {index: number, token: string}): Promise<{index: number, balance: string, allowance: string, decimals: number}> => {
    try {
        const tok: any = new web3.eth.Contract(erc20, args.token);
        const accounts: string[] = await web3.eth.getAccounts();
        const balance: string = await tok.methods.balanceOf(accounts.length > 0 ? accounts[0] : '0x').call().catch(() => '0');
        const allowance: string = await tok.methods.allowance(args.token, SWAP_ADDRESS).call().catch(() => '0');
        const decimals: number = await tok.methods.decimals(args.token).call().catch(() => 18);

        return {
            index: args.index, balance, allowance, decimals
        }
    }
    catch {
        return {
            index: args.index,
            balance: '0',
            allowance: '0',
            decimals: 18
        }
    }
});

export const tokenSlice = createSlice({
    name: 'tokens',
    initialState,
    reducers: {
        addItem: state => {
            state.push({name: '', symbol: '', address: '', percent: 0, priceUsd: '0', balance: '0', slippage: 0, decimals: 18, depositAmount: '0', allowance: '0', logo: ''});
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
                decimals: action.payload.decimals,
                depositAmount: action.payload.depositAmount,
                logo: action.payload.logo
            });
        },
        updateSlippage: (state: ITokenState[], action: PayloadAction<any>) => {
            state[action.payload.index].slippage = action.payload.slippage;
        },
        updateDepositAmount: (state: ITokenState[], action: PayloadAction<any>) => {
            state[action.payload.index].depositAmount = action.payload.depositAmount;
        },
        updateDecimals: (state: ITokenState[], action: PayloadAction<any>) => {
            const index = state.findIndex(s => s.address === action.payload.address);
            if (index > -1) {
                state[index].decimals = action.payload.decimals
            }
        },
        clearTokens: (state: ITokenState[]) => {
            state = initialState;
        }
    },
    extraReducers: {
        [getTokenInfo.fulfilled]: (state: ITokenState[], action: PayloadAction<any>) => {
            state[action.payload.index].priceUsd = action.payload.priceUsd;
            state[action.payload.index].logo = action.payload.logo;
            state[action.payload.index].status = 'success';
        },
        [getTokenBalance.fulfilled]: (state: ITokenState[], action: PayloadAction<any>) => {
            state[action.payload.index].decimals = action.payload.decimals;
            state[action.payload.index].balance = action.payload.balance;
            state[action.payload.index].allowance = action.payload.allowance;
        }
    }
});

export const { addItem, removeItem, updateItem, updateSlippage, updateDecimals, updateDepositAmount, clearTokens } = tokenSlice.actions;

export const selectTokens = (state: RootState) => state.tokens;

export default tokenSlice.reducer;