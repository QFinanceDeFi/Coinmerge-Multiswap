# CoinSwap

## Getting started

1. Install dependencies
   ```bash
   yarn
   ```

2. Create file *.env.development* at project root and add your Infura API ID as REACT_APP_INFURAID variable. If you don't have an Infura account, [Sign up here](https://infura.io). You should use a token for the Kovan testnet.

3. Run
   ```bash
   yarn start
   ```

## Key Components

This app is a React app built to interact with Ethereum. It uses the Infura API to query and transact on the Ethereum blockchain.

The core components of the app are:

* Web3, an api used to securely connect wallets to web apps. This app also uses web3modal to facilitate multi-wallet support.
* The contract ABI in the /data folder. The ABI describes the contract interface so the web3 api can properly build calls and transactions.
* Redux which is used to manage global state. Wallet connection, price API, swap data, and all user inputs for the portfolio are managed this way.
  * You can find the logic for the queries in /actions.

## Notes
* Be sure to set your wallet to Kovan network before interacting with this demo.
* The token list in /data is not production-usable. Some of the addresses do not match mainnet. Do not use this list if you are transacting on mainnet.