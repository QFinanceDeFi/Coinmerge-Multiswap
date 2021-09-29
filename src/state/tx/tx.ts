import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CM_ADDRESS, swapContract, SWAP_ADDRESS, web3 } from "../../data/base";
import type { RootState } from "../../store";
import { toBaseUnit } from "../../data/utils";
import BN from "bn.js"
import { getDecimals } from "../../data/calls";
import { getWalletData } from "../wallet/wallet";
const ierc20 = require('../../data/IERC20.json');

interface ITxState {
    status: 'pending' | 'success' | 'failed' | 'standby';
    current: 'approve' | 'swap' | 'liquidate' | '';
    hash: string;
}

const initialState: ITxState = {
    status: 'standby',
    current: '',
    hash: ''
}

export const makeSwap: any = createAsyncThunk('tx/swap', async (args: {portfolio: any, expected: any, amount: string, base: string}): Promise<any> => {
    try {
        const tokens: string[] = [];
        const percent: number[] = [];
        const outputs: string[] = [];
        args.portfolio.map((item: any) => {
            tokens.push(item.address);
            percent.push(item.percent);
            outputs.push(args.expected.find((a: any) => a.address === item.address)?.amount ?? '0');
            return item;
        });

        const from: string[] = await web3.eth.getAccounts();

        let send: any = 0;

        if (args.base !== "ETH") {
            const contract = new web3.eth.Contract(ierc20, args.base);
            const decimals = await contract.methods.decimals().call().catch((e: Error) => {
                console.log(e);
                return 18;
            });
            send = toBaseUnit(args.amount, decimals, BN);
        } else {
            send = web3.utils.toWei(args.amount.toString(), 'ether');
        }

        const data = () => {
            if (args.base !== "ETH") {
                return swapContract().methods.makeTokenSwap(
                    tokens,
                    percent,
                    outputs,
                    CM_ADDRESS,
                    args.base,
                    send
                ).encodeABI();
            } else {
                return swapContract().methods.makeETHSwap(
                    tokens,
                    percent,
                    outputs,
                    CM_ADDRESS
                ).encodeABI();
            }
        }

        const txParams: any = {
            to: SWAP_ADDRESS,
            from: from[0],
            value: args.base !== "ETH" ? "0x0" : send,
            data: data()
        }

        const gas: any = await web3.eth.estimateGas(txParams).catch((e: Error) => { throw e; });
        const fee: any = await web3.eth.getGasPrice().catch((e: Error) => { throw e;})
        txParams.gas = gas;
        txParams.maxFeePerGas = (Number(fee) * 1.25).toFixed(0);
        txParams.maxPriorityFeePerGas = web3.utils.fromWei('1500000000000000000', 'gwei');

        const tx: any = await web3.eth.sendTransaction(txParams).catch((e: Error) => { throw Error });

        return tx;        
    }
    catch (e) {
        console.log(e);

        return '';
    }
});

export const liquidateForETH: any = createAsyncThunk('tx/liquidate', async (args: {portfolio: any, expected: any}, { getState, dispatch}) => {
    try {
        const tokens: string[] = [];
        const expected: number[] = [];
        const inputs: string[] = [];
        await Promise.all(args.portfolio.map(async (item: any) => {
            tokens.push(item.address);
            const decimals = await getDecimals(item.address);
            inputs.push(toBaseUnit(item.depositAmount, decimals, BN));
            expected.push(args.expected.find((a: any) => a.address === item.address)?.amount ?? '0');
            return ;
        }));

        const from: string[] = await web3.eth.getAccounts();

        const txParams: any = {
            to: SWAP_ADDRESS,
            from: from[0],
            value: '0x0',
            data: swapContract().methods.makeTokenSwapForETH(
                tokens,
                inputs,
                expected,
                CM_ADDRESS
            ).encodeABI()
        }

        const gas: any = await web3.eth.estimateGas(txParams).catch((e: Error) => { throw e; });
        const fee: any = await web3.eth.getGasPrice().catch((e: Error) => { throw e;})
        txParams.gas = gas;
        txParams.maxFeePerGas = (Number(fee) * 1.25).toFixed(0);
        txParams.maxPriorityFeePerGas = web3.utils.fromWei('1500000000000000000', 'gwei');

        const tx: any = await web3.eth.sendTransaction(txParams).catch((e: Error) => { console.log(e); throw Error });
        dispatch(await getWalletData());

        return tx;
    }
    catch (e) {
        console.log(e);

        return '';
    }
});

export const approveContract: any = createAsyncThunk('tx/approve', async (args: any, { getState, dispatch }): Promise<any> => {
    try {
        const from: string[] = await web3.eth.getAccounts();

        const contract = new web3.eth.Contract(ierc20, args.token);
        const decimals: number = await contract.methods.decimals()?.call();
        const data = contract.methods.approve(SWAP_ADDRESS, toBaseUnit(args.amount, decimals, BN)).encodeABI();
        const txParams: any = {
            to: args.token,
            from: from[0],
            value: '0x0',
            data
        }

        const gas: any = await web3.eth.estimateGas(txParams).catch((e: Error) => { throw e; });
        const fee: any = await web3.eth.getGasPrice().catch((e: Error) => { throw e;})
        txParams.gas = gas;
        txParams.maxFeePerGas = (Number(fee) * 1.25).toFixed(0);
        txParams.maxPriorityFeePerGas = web3.utils.fromWei('1500000000000000000', 'gwei');

        const tx = await web3.eth.sendTransaction(txParams).catch((e: Error) => { console.log(e); throw Error });
        dispatch(await getWalletData());

        return tx;
    }
    catch (e) {
        console.log(e);

        return '';
    }
});

export const txSlice = createSlice({
    name: 'tx',
    initialState,
    reducers: {
        clearTx: (state: ITxState) => {
            state.current = '';
            state.hash = '';
            state.status = 'standby';
        }
    },
    extraReducers: {
        [makeSwap.pending]: (state: ITxState) => {
            state.current = "swap";
            state.status = "pending";
        },
        [makeSwap.fulfilled]: (state: ITxState, action: PayloadAction<any>) => {
            state.hash = action.payload.transactionHash;
            state.status = "success";
        },
        [makeSwap.failed]: (state: ITxState, action: PayloadAction<any>) => {
            state.hash = action.payload;
            state.status = "failed";
        },
        [liquidateForETH.pending]: (state: ITxState) => {
            state.current = "liquidate";
            state.status = "pending";
        },
        [liquidateForETH.fulfilled]: (state: ITxState, action: PayloadAction<any>) => {
            state.hash = action.payload.transactionHash;
            state.status = "success";
        },
        [liquidateForETH.failed]: (state: ITxState, action: PayloadAction<any>) => {
            state.hash = action.payload.transactionHash;
            state.status = "failed";
        },
        [approveContract.pending]: (state: ITxState) => {
            state.current = "approve";
            state.status = "pending";
        },
        [approveContract.fulfilled]: (state: ITxState, action: PayloadAction<any>) => {
            state.hash = action.payload.transactionHash;
            state.status = "success";
        },
        [approveContract.failed]: (state: ITxState, action: PayloadAction<any>) => {
            state.hash = action.payload;
            state.status = "failed";
        }
    }
});

export const { clearTx } = txSlice.actions;
export const selectTx = (state: RootState) => state.tx;
export default txSlice.reducer;