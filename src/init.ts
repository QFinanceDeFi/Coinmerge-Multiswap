import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import Web3Modal from "web3modal";
const multiswap = require('./data/Multiswap.json');

export const SWAP_ADDRESS = '0x08b16410c53FA67b0CC2cA58bd0F6409f3349f7a';
export const COINMERGE_ADDR = '0x1190074795dad0e61b61270de48e108427f8f817';

export const providerOptions: any =  {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: process.env.REACT_APP_INFURAID
        }
    }
}

export const web3Modal: Web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    theme: 'dark',
    providerOptions
});

export const swapContract = (web3: Web3) => {
  return new web3.eth.Contract(multiswap.abi, SWAP_ADDRESS);
}

export function initWeb3(provider?: any): Web3 {
  if (!provider) {
    provider = window.web3?.currentProvider;
  }
  const web3: any = new Web3(provider);

  web3.eth.extend({
    methods: [
      {
        name: "chainId",
        call: "eth_chainId",
        outputFormatter: web3.utils.hexToNumber
      }
    ]
  });

  return web3;
}