import { web3, swapContract } from "./base";
import { toBaseUnit } from "./utils";
import BN from "bn.js"
const ierc20 = require('./IERC20.json');

export const checkOutputs = async (portfolio: any, amount: string, tokenBase = false, base?: string): Promise<any> => {
    const tokens: string[] = [];
    const percent: string[] = [];
    const slippage: number[] = [];
    portfolio.map((tok: any) => {
        tokens.push(tok.address);
        percent.push(tok.percent);
        const slip = Number(tok.slippage);
        slippage.push(Number((slip !== 0 ? slip : 0.1).toFixed(2))*100);
        return tok;
    });

    try {
        const swap: any = swapContract();
        if (tokenBase) {
            const erc = new web3.eth.Contract(ierc20, base);
            const decimals = await erc.methods.decimals().call().catch(() => { return 18 });
            return await swap.methods.checkOutputsToken(tokens, percent, slippage, base, toBaseUnit(amount, decimals, BN))
                .call().catch((e: any) => console.log(e));
        } else {
            const expected = await swap.methods.checkOutputsETH(tokens, percent, slippage, web3.utils.toWei(amount, 'ether'))
                .call().catch((e: any) => console.log(e));
            
            return { tokens: expected[0], outputs: expected[1] };
        }
    }
    catch (e) {
        console.log(e);
    }

}

export const getTokenOutput = async (token: string, amount: string, slippage: number): Promise<any> => {
    slippage = (Number(Number(slippage) !== 0 ? slippage.toFixed(1) : 0.1) * 10);
    
    try {
        const swap: any = swapContract();
        const erc = new web3.eth.Contract(ierc20, token);
        const decimals = !erc.methods.decimals ? 18: await erc.methods.decimals().call().then((res: any) => { return res }).catch(() => { return 18 });
        const out =  await swap.methods.checkTokenValueETH(token, toBaseUnit(amount, decimals, BN), slippage).call();
        return out
    }
    catch (e) {
        console.log(e);
        return;
    }
}

export const getDecimals = async (address: string) => {
    const erc20 = new web3.eth.Contract(ierc20, address);
    const decimals = await erc20.methods.decimals()?.call().catch((e: any) => { return 18 }) ?? 18;
    return decimals;
}

export const convertString = async (address: string, amount: string) => {
    const decimals = await getDecimals(address);
    
    return toBaseUnit(amount, decimals, BN);
}