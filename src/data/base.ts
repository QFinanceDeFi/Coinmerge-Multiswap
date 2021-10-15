import { AlchemyWeb3, createAlchemyWeb3 } from "@alch/alchemy-web3";
import detectEthereumProvider from '@metamask/detect-provider';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Networks } from "./networks";

const multiswap = require("./Multiswap.json");

export let web3: AlchemyWeb3 = createAlchemyWeb3(`${process.env.REACT_APP_ETH_RPC}`, { writeProvider: null });

export const SWAP_ADDRESS = "0x8e0c9e7a4b9285a2c671942ece944175a52874a7";

export const swapContract = () => {
    return new web3.eth.Contract(multiswap.abi, SWAP_ADDRESS);
}

export const setProvider = async (service: 'injected' | 'walletconnect') => {
    if (service === 'injected')
    {
        const provider: any = await detectEthereumProvider();
        if (provider)
        {
            await provider.enable();
            web3 = createAlchemyWeb3(getEndpoint(Number(provider.chainId), false));
            localStorage.setItem('walletprovider', service);
        }
        else
        {
            alert(`Install a Web3 wallet such as Metamask. If you're on mobile, use WalletConnect.`)
        }
    }
    else if (service === 'walletconnect')
    {
        const provider: WalletConnectProvider = new WalletConnectProvider({
            rpc: {
                1: getEndpoint(1, true),
                56: getEndpoint(56, true),
                137: getEndpoint(137, true),
                43114: getEndpoint(43114, true)
            }
        });

        await provider.enable();
        web3 = createAlchemyWeb3(getEndpoint(provider.chainId, true));
        web3.setWriteProvider(provider);
        localStorage.setItem('walletprovider', service);
    }
}

export function getEndpoint(chainId: number, https = false): string {
    const chainName: any = JSON.parse(Networks[chainId])?.name ?? 'ethereum';
    switch (chainName.toLowerCase()) {
        case ('ethereum'): {
            if (https) {
                return `${process.env.REACT_APP_ETH_RPC_HTTPS}`;
            }

            return `${process.env.REACT_APP_ETH_RPC}`;
        }
        case ('bsc'): {
            if (https) {
                return `${process.env.REACT_APP_BSC_RPC_HTTPS}`;
            }

            return `${process.env.REACT_APP_BSC_RPC}`;
        }
        case ('polygon'): {
            if (https) {
                return `${process.env.REACT_APP_POLYGON_RPC_HTTPS}`;
            }

            return `${process.env.REACT_APP_POLYGON_RPC}`;
        }
        case ('avalanche'): {
            if (https) {
                return `${process.env.REACT_APP_AVALANCHE_RPC_HTTPS}`;
            }

            return `${process.env.REACT_APP_AVALANCHE_RPC}`;
        }

        default: return `${process.env.REACT_APP_ETH_RPC}`;
    }
}