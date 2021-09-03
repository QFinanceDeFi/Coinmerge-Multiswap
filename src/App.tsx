import React from "react";
import { changeAccount, makeConnection, reset } from "./actions/connectSlice";
import { getPrice } from "./actions/priceSlice";
import { getBalances, setWallet } from "./actions/walletSlice";
import './App.css';
import Brand from "./components/Brand/Brand";
import Modal from "./components/Modal/Modal";
import Navigation from "./components/Navigation/Navigation";
import Wallet from "./components/Wallet/Wallet";
import { useAppDispatch } from './hooks/hooks';
import useWindowWidth from "./hooks/useWindowWidth";
import { initWeb3, web3Modal } from "./init";
import Liquidate from "./views/Liquidate";
import SwapEth from "./views/SwapEth";
import SwapTokens from "./views/SwapTokens";

const App: React.FC = () => {
  const [selected, setSelected] = React.useState<number>(1);
  const [modal, setModal] = React.useState<boolean>(false);
  const dispatch = useAppDispatch();
  const width = useWindowWidth(50);

  React.useEffect(() => {
    setModal(true)
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
    
    const walletInfo = await dispatch(getBalances(address));

    dispatch(setWallet(walletInfo.payload));

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

  React.useEffect(() => {
    dispatch(getPrice('ethereum'));
    if (web3Modal.cachedProvider) {
      onConnect();
    }
  }, [dispatch])

  return (
    <>
    <Brand />
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
    {modal &&
    <Modal close={() => setModal(false)} open={modal}>
      <span>I understand that CoinSwap is a new swapping platform that routes through Uniswap. I understand that, at this time, selling ERC tokens with taxed tokenomics will cause the tax on said tokens to occur twice, once by CoinSwap, and once by Uniswap.</span>
      <div className="disconnect-modal">
            <div className="modal-actions">
                <button onClick={() => { reset(); setModal(false); }} className="disconnect-modal-action">
                    Cancel
                </button>
                <button onClick={() => setModal(false)} className="disconnect-modal-action">
                    Confirm
                </button>
            </div>              
        </div>
    </Modal>
    }
    </>
  );
}

export default App;
