import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import BN from "bn.js";
import { swapContract, SWAP_ADDRESS, web3 } from "../../data/base";
import { toBaseUnit } from "../../data/utils";
import { getTokenOutput } from "../../data/calls";
const ierc20 = require('../../data/IERC20.json');

interface IOutputs {
    address: string;
    amount: string;
}

interface ISwapState {
    depositAmount: string;
    address: string;
    symbol: string;
    name: string;
    allowance: string;
    balance: string;
    outputs: IOutputs[];
    logo?: string;
    status: 'standby' | 'pending' | 'success' | 'failed';
}

const initialState: ISwapState = {
    depositAmount: '',
    address: '',
    symbol: '',
    name: '',
    allowance: '0',
    balance: '0',
    status: 'standby',
    logo: '',
    outputs: []
}

export const getSwapData: any = createAsyncThunk(
    'swap/data',
    async (args: {token: string, name: string, symbol: string, logo: string},
        { getState }) => {
    const state: any = getState();

    try {
        if (args.token === "ETH") {
            
            return {
                ...state.swap,
                address: "ETH",
                symbol: "ETH",
                name: "Ethereum",
                logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Ethereum-icon-purple.svg"
            };
        }
        else {
            const tok: any = state.wallet.tokens.find((t: any) => t.tokenInfo.address === args.token);
            if (!tok) {
                return {
                    ...initialState,
                    address: args.token,
                    symbol: args.symbol,
                    name: args.name,
                    allowance: '0',
                    logo: args.logo
                };
            }
            const erc20: any = new web3.eth.Contract(ierc20, args.token);
            const accounts: string[] = await web3.eth.getAccounts();
            const allowance = await erc20.methods.allowance(accounts[0], SWAP_ADDRESS).call().catch(() => { return '0' });
            return {
                ...state.swap,
                address: args.token,
                allowance,
                balance: tok.balance,
                symbol: tok.tokenInfo.symbol,
                name: tok.tokenInfo.name,
                logo: args.logo
            };
        }
    }

    catch (e) {
        console.log(e);

        return {
            ...state.swap,
            allowance: '0',
            balance: '0',
            logo: ''
        };
    }
});

export const getOutputs: any = createAsyncThunk('swap/outputs', async (args: any, { getState }): Promise<{tokens: any[], outputs: any[]}> => {
    const state: any = getState();
    try {
        const tokens: string[] = [];
        const percent: string[] = [];
        const slippage: number[] = [];
        args.portfolio.map((tok: any) => {
            tokens.push(tok.address);
            percent.push(tok.percent);
            slippage.push(Number((tok.slippage * 10).toFixed(0)));
            return tok;
        });

        const swap: any = swapContract();

        if (args.base !== "ETH") {
            const erc = new web3.eth.Contract(ierc20, args.base);
            const details: any = state.wallet.tokens.find((t: any) => t.tokenInfo.address === args.base);
            let decimals: number = 0;

            if (!details) {
                decimals = await erc.methods.decimals().call().catch(() => { return 18 });
            }

            const expected = await swap.methods.checkOutputsToken(
                tokens,
                percent,
                slippage,
                args.base,
                toBaseUnit(args.amount, decimals === 0 ? Number(details.tokenInfo.decimals) : decimals, BN)
            ).call().catch((e: any) => console.log(e));

            return { tokens: expected[0], outputs: expected[1] };
        }
        else {
            const expected: any = await swap.methods.checkOutputsETH(tokens, percent, slippage, web3.utils.toWei(args.amount.toString())).call();
            
            return { tokens: expected[0], outputs: expected[1] };
        }
    }
    catch (e) {
        console.log(e);

        return { tokens: [], outputs: []};
    }
});

export const getLiquidationOutputs: any = createAsyncThunk('swap/liqOutputs', async (args: any) => {
    try {
        const reducer = async (acc: any[], item: any) => {
            const value: string = await getTokenOutput(item.address, item.depositAmount.toString(), Number((item.slippage * 10).toFixed(0))).catch((e: Error) => {
                console.log(e);
            });

            const newItem: object = {
                address: item.address,
                amount: value
            }

            const newList = Promise.resolve(acc).then((res: any) => {
                res.push(newItem);
                return res;
            })

            return newList;
        }

        const newList: any = await args.portfolio.reduce(reducer, Promise.all([]));

        console.log(newList);

        return newList;
    }
    catch (e) {
        console.log(e);

        return [];
    }
})

export const swapSlice = createSlice({
    name: 'swap',
    initialState,
    reducers: {
        updateSwap: (state: ISwapState, action: PayloadAction<ISwapState>) => {
            state = action.payload;
        },
        updateDepositAmount: (state: ISwapState, action: PayloadAction<string>) => {
            state.depositAmount = action.payload;
        },
        updateDepositToken: (state: ISwapState, action: PayloadAction<string>) => {
            state.address = action.payload;
        },
        clearSwap: (state: ISwapState) => {
            state = initialState;
        }
    },
    extraReducers: {
        [getSwapData.pending]: (state: ISwapState) => {
            state.status = 'pending';
        },
        [getSwapData.fulfilled]: (state: ISwapState, action: PayloadAction<ISwapState>) => {
            state.address = action.payload.address;
            state.allowance = action.payload.allowance;
            state.balance = action.payload.balance;
            state.depositAmount = action.payload.depositAmount;
            state.logo = action.payload.logo ?? '';
            state.name = action.payload.name;
            state.outputs = [];
            state.symbol = action.payload.symbol;
            state.status = 'success';
        },
        [getSwapData.failed]: (state: ISwapState, action: PayloadAction<ISwapState>) => {
            state.address = action.payload.address;
            state.allowance = action.payload.allowance;
            state.balance = action.payload.balance;
            state.depositAmount = action.payload.depositAmount;
            state.logo = action.payload.logo ?? '';
            state.name = action.payload.name;
            state.outputs = [];
            state.symbol = action.payload.symbol;
            state.status = 'failed';
        },
        [getOutputs.pending]: (state: ISwapState) => {
            state.status = 'pending';
        },
        [getOutputs.fulfilled]: (state: ISwapState, action: PayloadAction<any>) => {
            if (action.payload.tokens) {
                const newState = action.payload.tokens.reduce((acc: any, item: any, index: number) => {
                    acc.push({
                        address: item,
                        amount: action.payload.outputs[index]
                    });

                    return acc;
                }, [])
                state.outputs = newState;
                state.status = 'success';                
            }
        },
        [getOutputs.failed]: (state: ISwapState) => {
            state.status = 'failed';
        },
        [getLiquidationOutputs.pending]: (state: ISwapState) => {
            state.status = 'pending';
        },
        [getLiquidationOutputs.fulfilled]: (state: ISwapState, action: PayloadAction<any>) => {
            const newState = action.payload;
            console.log(action.payload);
            state.outputs = newState;
            state.status = 'success';
        },
        [getLiquidationOutputs.failed]: (state: ISwapState) => {
            state.status = 'failed';
        }
    }
});

export const { updateSwap, updateDepositAmount, updateDepositToken, clearSwap } = swapSlice.actions;
export const selectSwap = (state: RootState) => state.swap;
export default swapSlice.reducer;