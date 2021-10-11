# CoinMerge CoinSwap Client

Code for the front-end of CoinMerge CoinSwap available at https://betaswap.coinmerge.io. Interfaces with the QFinance multiswap router @ 0x8e0c9e7a4b9285a2c671942ece944175a52874a7 on Ethereum, BSC, Polygon, and Avalanche (with more coming soon!).

## Setup local

1. Sign up for an API key at Alchemy API.
2. Create apps for Ethereum and Polygon. Copy URL (we need both HTTPS and WSS)
3. Create .env and/or .env.development and add the following entries:

```
REACT_APP_ETH_RPC={alchemy eth wss}
REACT_APP_ETH_RPC_HTTPS={alchemy eth https}
REACT_APP_BSC_RPC=wss://bsc-ws-node.nariox.org:443
REACT_APP_BSC_RPC_HTTPS=https://bsc-dataseed1.defibit.io
REACT_APP_POLYGON_RPC={alchemy polygon wss}
REACT_APP_POLYGON_RPC_HTTPS={alchemy polygon https}
REACT_APP_AVALANCHE_RPC=wss://api.avax.network/ext/bc/C/ws
REACT_APP_AVALANCHE_RPC_HTTPS=https://api.avax.network/ext/bc/C/rpc
```

You can change the BSC and Avalanche APIs if desired. You can also switch off websockets and only use HTTPS in /data/base and make sure getEndpoint second arg is true.

4. `yarn` to install dependencies
5. `yarn start`

## Build

1. `yarn build`
2. Publish build folder