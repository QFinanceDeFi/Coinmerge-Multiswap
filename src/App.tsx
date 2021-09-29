import React from 'react';
import './App.css';
import detectEthereumProvider from '@metamask/detect-provider';
import { web3 } from './data/base';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { useAppDispatch, useAppSelector } from './hooks/hooks';
import { changeAccount, changeChain, makeConnection, reset } from './state/connect/connect';
import { getWalletData } from './state/wallet/wallet';
import Brand from './components/Brand/Brand';
import Wallet from './components/Wallet/Wallet';
import Navigation from './components/Navigation/Navigation';
import useWindowWidth from './hooks/useWindowWidth';
import Deposit from './components/Deposit/Deposit';
import Controls from './components/Controls/Controls';
import { addItem, removeItem } from './state/tokens/tokens';
import Token from './components/Token/Token';
import Modal from './components/Modal/Modal';

const App: React.FC = () => {
  const [selected, setSelected] = React.useState<number>(1);
  const [modal, setModal] = React.useState<boolean>(false);
  const { tokens } = useAppSelector(state => {
    return {
      tokens: state.tokens
    }
  });
  const width = useWindowWidth(50);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    setModal(true)
  }, []);

  const subscribeProvider = React.useCallback(async (provider: any, service: 'injected' | 'walletconnect') => {
    provider.on("connect", async () => {
      localStorage.setItem('walletprovider', service);
      dispatch(await getWalletData());
    });

    provider.on("disconnect", () => {
        dispatch(
          makeConnection({
            connected: false,
            address: "",
            chainId: 0,
            networkId: 0,
          })
        );

        localStorage.removeItem('walletprovider');
      }
    );

    provider.on("accountsChanged", async (accounts: string[]) => {
      if (accounts.length === 0) {
        return dispatch(
          makeConnection({
            connected: false,
            address: "",
            chainId: 0,
            networkId: 0,
          })
        );
      }
      dispatch(changeAccount(accounts[0]));
      dispatch(await getWalletData());
    });

    provider.on("chainChanged", async (chainId: number) => {
      dispatch(changeChain(chainId));
      dispatch(await getWalletData());
    });
  }, [dispatch]);

    const connectWallet = React.useCallback(async (service: "injected" | "walletconnect"): Promise<void> => {
    try {
      if (service === "injected") {
        const provider: any = await detectEthereumProvider();

        if (provider) {
          // await provider.enable().catch((e: any) => { throw Error (e)});
          await subscribeProvider(provider, service);
          web3.setWriteProvider(provider);
        } else {
          alert("You need a Web3 wallet installed such as Metamask.");
          return;
        }
      } else if (service === "walletconnect") {
        const provider: any = new WalletConnectProvider({
          rpc: {
            1: `https://${process.env.REACT_APP_ALCHEMY}`,
          },
        });

        await provider.enable();
        await subscribeProvider(provider, service);

        web3.setWriteProvider(provider);
      }

      const accounts: string[] = await web3.eth.getAccounts();
      const networkId: number = await web3.eth.net.getId();
      const chainId: number = await web3.eth.getChainId();

      dispatch(
        makeConnection({
          connected: true,
          address: accounts[0],
          chainId,
          networkId,
        })
      );

      localStorage.setItem('walletprovider', service);

      dispatch(await getWalletData());
      
      return;

    } catch {
      dispatch(
        makeConnection({
          connected: false,
          address: "",
          chainId: 0,
          networkId: 0,
        })
      );

      return;
    }
  }, [dispatch, subscribeProvider]);

  React.useEffect(() => {
    const wallet: string | null = localStorage.getItem('walletprovider');
    if (wallet === "injected" || wallet === "walletconnect") {
      Promise.resolve(connectWallet(wallet));
    }
  }, [connectWallet])

  function add() {
    dispatch(addItem());
  }

  function remove() {
    dispatch(removeItem(-1));
  }

  return (
    <>
      <Brand />
      <Wallet connect={(service: 'injected' | 'walletconnect') => connectWallet(service)} />
      <div className="app" style={{marginTop: width > 1200 ? '0px' : '80px'}}>
      <Navigation selected={selected} update={(val: number) => setSelected(val)} />
        {selected === 1 &&
        <>
        <h1>Swap One For Multiple</h1>
        <Deposit />
        <Controls add={add} remove={remove} length={tokens.length} />
        {tokens.map((item: any, index: number) => (
            <Token key={index} index={index} deposit={false} />
          ))}
        </>}
        {selected === 2 &&
        <>
        <h1>Swap Multiple to ETH</h1>
        <Controls add={add} remove={remove} length={tokens.length} liq={true} />
        {tokens.map((item: any, index: number) => (
            <Token key={index} index={index} deposit={true} />
        ))}
        </>
        }
      </div>
      {modal &&
      <Modal close={() => setModal(false)} open={modal}>
        <div className="disconnect-modal">
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
        <span>I understand that CoinSwap is a new swapping platform that routes through Uniswap. I understand that, at this time, selling ERC tokens with taxed tokenomics will cause the tax on said tokens to occur twice, once by CoinSwap, and once by Uniswap.</span>
        </div>
              <div className="modal-actions">
                  <button onClick={() => setModal(false)} className="disconnect-modal-action">
                      Confirm
                  </button>
                  <button onClick={() => { dispatch(reset()); setModal(false); }} className="disconnect-modal-action-cancel">
                      Cancel
                  </button>
              </div>              
          </div>
      </Modal>
      }
    </>
  );
}

export default App;
