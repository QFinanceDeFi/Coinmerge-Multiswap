import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initWeb3, web3Modal } from "../init";
import type { RootState } from "../store";

interface IConnectState {
    connected: boolean;
    address: string;
    chainId: string;
    networkId: string;
    fetching: boolean;
    balance: string;
    ethPrice: string;
    status: 'loading' | 'succeeded' | 'failed' | 'standby';
}

const initialState: IConnectState = {
    connected: false,
    address: '',
    chainId: '',
    networkId: '',
    fetching: false,
    balance: '0',
    ethPrice: '0',
    status: 'standby'
}

export const updateBalance: any = createAsyncThunk('connect/updateBalance', async (): Promise<string> => {
    if (web3Modal.cachedProvider) {
        const provider = web3Modal.connect().catch((e: any) => console.log(e));
        const web3: any = initWeb3(provider);
        const accounts = web3.eth.getAccounts();

        return web3.eth.getBalance(accounts[0]);
    }
    
    return '0';
});

export const connectSlice = createSlice({
    name: 'connect',
    initialState,
    reducers: {
        makeConnection: (state: IConnectState, action: PayloadAction<any>) => {
            state.connected = true;
            state.address = action.payload.address;
            state.chainId = action.payload.chainId;
            state.networkId = action.payload.networkId;
            state.fetching = false;
            state.balance = action.payload.balance;
            updateBalance();
        },
        isFetching: (state: IConnectState, action: PayloadAction<boolean>) => {
            state.fetching = action.payload;
        },
        changeAccount: (state: IConnectState, action: PayloadAction<string>) => {
            state.address = action.payload;
            updateBalance();
        },
        reset: state => {
            const web3: any = window.web3 ?? null;
            if (web3 && web3.currentProvider && web3.currentProvider.close) {
                web3.currentProvider.close();
            }

            web3Modal.clearCachedProvider();
            state.connected = false;
            state.address = '';
            state.chainId = '';
            state.networkId = '';
            state.fetching = false;
            state.balance = '0';
        }
    },
    extraReducers: {
        [updateBalance.pending]: state => {
            state.status = 'loading';
        },
        [updateBalance.fulfilled]: (state, action: PayloadAction<any>) => {
            if (action.payload) {
                state.balance = action.payload;
            }
        },
        [updateBalance.rejected]: state => {
            state.status = 'failed';
        }
      }
});

export const { makeConnection, isFetching, changeAccount, reset } = connectSlice.actions;

export const selectConnect = (state: RootState) => state.connect;

export default connectSlice.reducer;