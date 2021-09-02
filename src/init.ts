import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import Web3Modal from "web3modal";
const multiswap = require('./data/Multiswap.json');

export const SWAP_ADDRESS = '0x24B211deC8b68c6A348Dd81B758DAC6899deF2b8';

export const providerOptions: any =  {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: process.env.REACT_APP_INFURAID
        }
    }
}

export const web3Modal: Web3Modal = new Web3Modal({
    network: "kovan",
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