import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SWAP_ADDRESS, web3 } from "../../data/base";
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
    ethPrice: number;
    ethBalance: number;
    status?: 'pending' | 'success' | 'failed' | 'standby';
}

const initialState: IWalletState = {
    tokens: [],
    ethPrice: 0,
    ethBalance: 0,
    status: 'standby'
};

export const getWalletData: any = createAsyncThunk('wallet/data', async (): Promise<IWalletState> => {
    try {
        const accounts: string[] = await web3.eth.getAccounts();
        const userTokens: IWalletState = await fetch(`https://api.ethplorer.io/getAddressInfo/${accounts[0]}?apiKey=freekey`)
            .then((item: any) => item.json()).then(async (json: any) => {
                const reducer = async (arr: any, item: any) => {
                    const allowance: string = await web3.alchemy.getTokenAllowance({
                        contract: item.tokenInfo.address,
                        owner: accounts[0],
                        spender: SWAP_ADDRESS}).catch((e: any) => {
                            console.log(e);
                            return '0';
                        });

                    const newItem: object = {
                        ...item,
                        allowance
                    }

                    const newList = Promise.resolve(arr).then((res: any) => {
                        res.push(newItem);
                        return res;
                    })

                    return newList;
                }

                const newList: any = await json.tokens.reduce(reducer, Promise.all([]));

                return {
                    tokens: newList,
                    ethPrice: json.ETH.price.rate,
                    ethBalance: json.ETH.balance,
                    status: 'success'
                };
            });

        return userTokens;
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
        setETHBalance: (state: IWalletState, action: PayloadAction<number>) => {
            state.ethBalance = action.payload;
        },
        setETHPrice: (state: IWalletState, action: PayloadAction<number>) => {
            state.ethPrice = action.payload;
        },
        clearWallet: (state: IWalletState) => {
            state.tokens = [];
            state.ethBalance = 0;
            state.status = 'standby';
        }
    },
    extraReducers: {
        [getWalletData.pending]: (state: IWalletState) => {
            state.status = 'pending';
        },
        [getWalletData.fulfilled]: (state: IWalletState, action: PayloadAction<IWalletState>) => {
            state.tokens = action.payload.tokens;
            state.ethBalance = action.payload.ethBalance;
            state.ethPrice = action.payload.ethPrice;
            state.status = 'success';
        },
        [getWalletData.rejected]: (state: IWalletState) => {
            state.status = 'failed';
        }
    }
});

export const { setETHBalance, setETHPrice, clearWallet } = walletSlice.actions;

export const selectWallet = (state: RootState) => state.wallet;

export default walletSlice.reducer;