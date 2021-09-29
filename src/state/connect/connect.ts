import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

interface IConnectState {
    connected: boolean;
    address: string;
    chainId: number;
    networkId: number;
    status: 'pending' | 'succeeded' | 'failed' | 'standby';
}

const initialState: IConnectState = {
    connected: false, address: '', chainId: 0, networkId: 0, status: 'standby'
}

export const connectSlice = createSlice({
    name: 'connect',
    initialState,
    reducers: {
        makeConnection: (state: IConnectState, action: PayloadAction<any>) => {
            state.connected = action.payload.connected;
            state.address = action.payload.address;
            state.chainId = action.payload.chainId;
            state.networkId = action.payload.networkId;
        },
        setStatus: (state: IConnectState, action: PayloadAction<'pending' | 'succeeded' | 'failed' | 'standby'>) => {
            state.status = action.payload;
        },
        changeAccount: (state: IConnectState, action: PayloadAction<string>) => {
            state.address = action.payload;
        },
        changeChain: (state: IConnectState, action: PayloadAction<number>) => {
            state.chainId = action.payload;
        },
        reset: (state: IConnectState) => {
            localStorage.clear();
            state.connected = false;
            state.address = '';
            state.chainId = 1;
            state.networkId = 1;
            state.status = 'standby';
        }
    }
});

export const { makeConnection, setStatus, changeAccount, changeChain, reset } = connectSlice.actions;

export const selectConnect = (state: RootState) => state.connect;

export default connectSlice.reducer;