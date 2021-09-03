import Web3 from "web3";
import { COINMERGE_ADDR, initWeb3, swapContract, SWAP_ADDRESS, web3Modal } from "../init";
import { toBaseUnit } from "./utils";
import BN from "bn.js"
const ierc20 = require('./IERC20.json');

export const makeSwap = async (portfolio: any, amount: string, expected: any, tokenBase = false, base?: string) => {
    const web3: Web3 = initWeb3();
    const tokens = portfolio.map((tok: any) => tok.address);
    const percent = portfolio.map((tok: any) => tok.percent);
    const outputs = expected.map((item: any) => item.amount);
    const from: string[] = await web3.eth.getAccounts();

    let send: any = 0;

    if (tokenBase) {
        const contract = new web3.eth.Contract(ierc20, base);
        const decimals = await contract.methods.decimals().call().then((res: any) => { return res }).catch((e: any) => { return 18 });
        send = toBaseUnit(amount, decimals, BN);
    } else {
        send = web3.utils.toWei(amount, 'ether');
    }

    const data = async () => {
        if (tokenBase) {
            return await swapContract(web3).methods.makeTokenSwap(tokens, percent, outputs, COINMERGE_ADDR, base, send).encodeABI();
        } else {
            return await swapContract(web3).methods.makeETHSwap(tokens, percent, outputs, COINMERGE_ADDR).encodeABI()
        }
    }

    const txParams: any = {
        to: SWAP_ADDRESS,
        from: from[0],
        value: tokenBase ? '0x0' : send,
        data: await data()
    }

    txParams.gas = (Number(await web3.eth.estimateGas(txParams)) * 1.2).toFixed(0);

    const tx: any = await web3.eth.sendTransaction(txParams);

    return tx;
}

export const liquidateForETH = async (portfolio: any) => {
    const provider = await web3Modal.connect().catch(() => console.log('No provider'));
    const web3: Web3 = initWeb3(provider);
    const { tokens, expected } = portfolio.map((tok: any) => {
        return {
            tokens: tok.address,
            expected: tok.amountOut
        }
    });
    const outputs: any[] = [];
    const amounts: any[] = []; // portfolio.map((tok: any) => tok.depositAmount);
    expected.map(async (item: any, index: number) => {
        const contract = new web3.eth.Contract(ierc20, tokens[index]);
        if (contract.methods.decimals) {
            const decimals = await contract.methods.decimals()?.call().then((res: any) => { return res }).catch(() => { return 18 });
            amounts.push(toBaseUnit(portfolio[index].depositAmount, decimals, BN));
        } else {
            amounts.push(toBaseUnit(portfolio[index].depositAmount, 18, BN));
        }
        outputs.push(web3.utils.toWei(expected[index], 'ether'));
    })

    const from: string[] = await web3.eth.getAccounts();

    const txParams: any = {
        to: SWAP_ADDRESS,
        from: from[0],
        value: '0x0',
        data: swapContract(web3).methods.makeTokenSwapForETH(tokens, amounts, outputs, COINMERGE_ADDR).encodeABI()
    }

    txParams.gas = (Number(await web3.eth.estimateGas(txParams)) * 1.2).toFixed(0);

    const tx: any = await web3.eth.sendTransaction(txParams);

    return tx;
}

export const checkOutputs = async (portfolio: any, amount: string, tokenBase = false, base?: string): Promise<any> => {
    const provider = await web3Modal.connect();
    const web3: Web3 = initWeb3(provider);
    const tokens = portfolio.map((tok: any) => tok.address);
    const percent = portfolio.map((tok: any) => tok.percent);
    const slippage = portfolio.map((tok: any) => Number(Number(tok.slippage !== 0 ? tok.slippage : 0.1).toFixed(1)) * 10);

    try {
        const swap: any = swapContract(web3);
        if (tokenBase) {
            const erc = new web3.eth.Contract(ierc20, base);
            const decimals = await erc.methods.decimals().call().catch(() => { return 18 });
            return await swap.methods.checkOutputsToken(tokens, percent, slippage, base, web3.utils.toBN("0x"+(Number(amount)*10**decimals).toString(16)))
                .call().catch((e: any) => console.log(e));
        } else {
            const expected = await swap.methods.checkOutputsETH(tokens, percent, slippage, web3.utils.toWei(amount, 'ether'))
                .call().catch((e: any) => console.log(e));

            const outputs: any[] = [];

            const reducer = async (acc: any[], item: any, index: number) => {
                const erc = new web3.eth.Contract(ierc20, tokens[index]);
                const decimals = await erc.methods.decimals().call().catch(() => { return 18 });
                outputs.push(toBaseUnit(item, decimals, BN));
                acc[index] = toBaseUnit(item, decimals, BN)
                return item;
            }
            
            const ret =  await expected[1].reduce(reducer, Promise.all([]));
            return { tokens: expected[0], outputs: expected[1] };
        }
    }
    catch (e) {
        console.log(e);
    }

}

export const getTokenOutput = async (token: string, amount: string, slippage: number): Promise<any> => {
    const provider = await web3Modal.connect();
    const web3: Web3 = initWeb3(provider);
    slippage = (Number(slippage !== 0 ? slippage.toFixed(1) : 5) * 10);
    
    try {
        const swap: any = swapContract(web3);
        const erc = new web3.eth.Contract(ierc20, token);
        const decimals = !erc.methods.decimals ? 18: await erc.methods.decimals().call().then((res: any) => { return res }).catch(() => { return 18 });
        const out =  await swap.methods.checkTokenValueETH(token, toBaseUnit(amount, decimals, BN), slippage).call();
        return web3.utils.fromWei(out, 'ether');
    }
    catch (e) {
        console.log(e);
        return;
    }
}

export const approveContract = async (token: string, amount: string): Promise<any> => {
    try {
        const web3: Web3 = initWeb3();
        const from: string[] = await web3.eth.getAccounts();

        const contract = new web3.eth.Contract(ierc20, token);
        const data = contract.methods.approve(SWAP_ADDRESS, web3.utils.toWei(amount, 'ether')).encodeABI();
        const txParams: any = {
            to: token,
            from: from[0],
            value: '0x0',
            data
        }

        txParams.gas = (Number(await web3.eth.estimateGas(txParams)) * 1.1).toFixed(0);

        const tx = await web3.eth.sendTransaction(txParams);

        return tx;        
    }
    catch (e) {
        console.log(e);
        return false;
    }
}