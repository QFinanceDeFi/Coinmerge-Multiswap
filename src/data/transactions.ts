import Web3 from "web3";
import { initWeb3, swapContract, SWAP_ADDRESS, web3Modal } from "../init";

export const makeSwap = async (portfolio: any, amount: string) => {
    const provider = web3Modal.connect().catch((e: any) => console.log(e));
    const web3: Web3 = initWeb3(provider);
    const from: string[] = await web3.eth.getAccounts();
    const tokens = portfolio.map((tok: any) => tok.address);
    const percent = portfolio.map((tok: any) => tok.percent);

    const data = await swapContract(web3).methods.makeETHSwap(tokens, percent).encodeABI();

    const txParams = {
        to: SWAP_ADDRESS,
        from: from[0],
        value: web3.utils.toWei(amount, 'ether'),
        data
    }

    const txHash: any = await web3.eth.sendTransaction(txParams);

    console.log(txHash);

    return txHash;
}

export const checkOutputs = async (portfolio: any, amount: string) => {
    const provider = await web3Modal.connect();
    const web3: Web3 = initWeb3(provider);
    const tokens = portfolio.map((tok: any) => tok.address);
    const percent = portfolio.map((tok: any) => tok.percent);

    const swap: any = swapContract(web3);
    const res: any = await swap.methods.checkOutputsEth(tokens, percent, web3.utils.toWei(amount, 'ether')).call().catch((e: any) => console.log(e));
    
    return res;
}