import Web3 from "web3";
import { initWeb3, swapContract, SWAP_ADDRESS, web3Modal } from "../init";
const ierc20 = require('./IERC20.json').abi;

export const makeSwap = async (portfolio: any, amount: string, expected: any, from: string, tokenBase = false, base?: string) => {
    const web3: Web3 = initWeb3();
    const tokens = portfolio.map((tok: any) => tok.address);
    const percent = portfolio.map((tok: any) => tok.percent);
    const outputs: any[] = [];
    expected.map(async (item: any, index: number) => {
        const contract = new web3.eth.Contract(ierc20, tokens[index]);
        if (contract.methods.decimals) {
            const decimals = await contract.methods.decimals()?.call().then((res: any) => { return res }).catch(() => { return 18 });
            outputs.push(web3.utils.toBN("0x"+(Number(item.amount)*10**decimals).toString(16)));
        } else {
            outputs.push(web3.utils.toBN("0x"+(Number(item.amount)*10**18).toString(16)));
        }

    });

    let send: any;

    if (tokenBase) {
        const contract = new web3.eth.Contract(ierc20, base);
        if (contract.methods.decimals) {
            const decimals = await contract.methods.decimals().call().then((res: any) => { return res }).catch((e: any) => { return 18 });
            send = web3.utils.toBN("0x"+(Number(amount)*10**decimals).toString(16))
        } else {
            send = web3.utils.toBN("0x"+(Number(amount)*10**18).toString(16))
        } 
    } else {
        send = web3.utils.toBN("0x"+(Number(amount)*10**18).toString(16))
    }

    const data = async () => {
        if (tokenBase) {
            return await swapContract(web3).methods.makeTokenSwap(tokens, percent, outputs, SWAP_ADDRESS, base, send).encodeABI();
        } else {
            return await swapContract(web3).methods.makeETHSwap(tokens, percent, outputs, SWAP_ADDRESS).encodeABI()
        }
    }

    const txParams = {
        to: SWAP_ADDRESS,
        from,
        value: tokenBase ? '0x0' : send,
        data: await data()
    }

    const tx: any = await web3.eth.sendTransaction(txParams);

    return tx;
}

export const liquidateForETH = async (portfolio: any, expected: any, from: string) => {
    const provider = await web3Modal.connect().catch(() => console.log('No provider'));
    const web3: Web3 = initWeb3(provider);
    const tokens = portfolio.map((tok: any) => tok.address);
    const outputs: any[] = [];
    const amounts: any[] = []; // portfolio.map((tok: any) => tok.depositAmount);
    expected.map(async (item: any, index: number) => {
        const contract = new web3.eth.Contract(ierc20, tokens[index]);
        if (contract.methods.decimals) {
            const decimals = await contract.methods.decimals()?.call().then((res: any) => { return res }).catch(() => { return 18 });
            amounts.push(web3.utils.toBN("0x"+(Number(portfolio[index].depositAmount)*10**decimals).toString(16)));
        } else {
            amounts.push(web3.utils.toBN("0x"+(Number(portfolio[index].depositAmount)*10**18).toString(16)));
        }
        outputs.push(web3.utils.toWei(expected[index], 'ether'));
    })

    const txParams = {
        to: SWAP_ADDRESS,
        from,
        value: '0x0',
        data: swapContract(web3).methods.makeTokenSwapForETH(tokens, amounts, outputs, SWAP_ADDRESS).encodeABI()
    }

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
            const decimals = erc.methods.decimals ? await erc.methods.decimals().call().then((res: any) => { return res }).catch(() => { return 18 }) : 18;
            return await swap.methods.checkOutputsToken(tokens, percent, slippage, base, web3.utils.toBN("0x"+(Number(amount)*10**decimals).toString(16)))
                .call().catch((e: any) => console.log(e));
        } else {
            return await swap.methods.checkOutputsETH(tokens, percent, slippage, web3.utils.toWei(amount, 'ether'))
                .call().catch((e: any) => console.log(e));
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
        const decimals = erc.methods.decimals ? await erc.methods.decimals().call().then((res: any) => { return res }).catch(() => { return 18 }) : 18;
        const out =  await swap.methods.checkTokenValueETH(token, web3.utils.toBN("0x"+(Number(amount)*10**decimals).toString(16)), slippage).call();
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
        const txParams = {
            to: token,
            from: from[0],
            value: '0x0',
            data
        }

        const tx = await web3.eth.sendTransaction(txParams);

        return tx;        
    }
    catch (e) {
        console.log(e);
        return false;
    }
}