import React from "react";
import { changeAccount, makeConnection, reset } from "./actions/connectSlice";
import { getPrice } from "./actions/priceSlice";
import './App.css';
import Navigation from "./components/Navigation/Navigation";
import Wallet from "./components/Wallet/Wallet";
import { useAppDispatch, useAppSelector } from './hooks/hooks';
import useWindowWidth from "./hooks/useWindowWidth";
import { initWeb3, web3Modal } from "./init";
import Liquidate from "./views/Liquidate";
import SwapEth from "./views/SwapEth";
import SwapTokens from "./views/SwapTokens";

const App: React.FC = () => {
  const [selected, setSelected] = React.useState<number>(1);
  const dispatch = useAppDispatch();
  const width = useWindowWidth(50);
  const {connected, address, balance, priceUsd} = useAppSelector(state => {
    return {
      connected: state.connect.connected,
      address: state.connect.address,
      balance: state.connect.balance,
      priceUsd: state.price.priceUsd
    }
  });

  React.useEffect(() => {
    dispatch(getPrice('ethereum'));
    if (web3Modal.cachedProvider) {
      onConnect();
    }
  }, [])

  const onConnect = async () => {
    const provider = await web3Modal.connect().catch(err => console.log(err));
    if (!provider) {
      return
    }

    await subscribeProvider(provider);

    const web3: any = initWeb3(provider);

    const accounts = await web3.eth.getAccounts();

    const address = accounts[0];

    const networkId = await web3.eth.net.getId();

    const chainId = await web3.eth.chainId();

    const balance = web3.utils.fromWei(await web3.eth.getBalance(address), 'ether');

    dispatch(makeConnection({
      connected: true,
      address: address ?? '',
      chainId,
      networkId,
      fetching: false,
      balance
    }));
  }

  const subscribeProvider = async (provider: any) => {
      provider.on("disconnect", () => dispatch(reset()));

      provider.on("accountsChanged", async (accounts: string[]) => {
      if (accounts.length === 0) {
          return dispatch(reset());
      }
      dispatch(changeAccount(accounts[0]));
      onConnect();
      });

      provider.on("chainChanged", async (chainId: number) => {
        // ...
        onConnect();
      });
}

  return (
    <>
    <Wallet connect={onConnect} />
    <div className="App" style={{marginTop: width > 1200 ? '0px' : '80px'}}>
      <Navigation selected={selected} update={(val: number) => setSelected(val)} />
      {selected === 1 &&
        <SwapEth />
      }
      {selected === 2 &&
        <SwapTokens />
      }
      {selected === 3 &&
        <Liquidate />
      }
    </div>
    </>
  );
}

export default App;
