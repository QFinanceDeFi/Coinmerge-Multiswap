import { AlchemyWeb3, createAlchemyWeb3 } from "@alch/alchemy-web3";
import detectEthereumProvider from '@metamask/detect-provider';
import WalletConnectProvider from "@walletconnect/web3-provider";
const multiswap = require("./Multiswap.json");

export const web3: AlchemyWeb3 = createAlchemyWeb3(`wss://${process.env.REACT_APP_ALCHEMY}`);

export const SWAP_ADDRESS = "0x8e0c9e7a4b9285a2c671942ece944175a52874a7";
export const CM_ADDRESS = "0x1190074795dad0e61b61270de48e108427f8f817";

export const swapContract = () => {
    return new web3.eth.Contract(multiswap.abi, SWAP_ADDRESS);
}

export const setProvider = async (service: 'injected' | 'walletconnect') => {

    if (service === 'injected') {
        const provider: any = await detectEthereumProvider();
        
        if (provider) {
            await provider.enable();
        }
    }
    else if (service === 'walletconnect') {
        const provider: any = new WalletConnectProvider({
            rpc: {
                1: process.env.REACT_APP_ALCHEMY ?? ''
            }
        });

        await provider.enable();

        web3.setWriteProvider(provider);
    }

}