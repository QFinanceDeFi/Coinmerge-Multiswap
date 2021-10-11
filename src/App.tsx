import React from 'react';
import './App.css';
import detectEthereumProvider from '@metamask/detect-provider';
import { setProvider, web3 } from './data/base';
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
import { Networks } from './data/networks';

const App: React.FC = () => {
  const [selected, setSelected] = React.useState<number>(1);
  const [network, setNetwork] = React.useState<string>('Ethereum');
  const [modal, setModal] = React.useState<boolean>(false);
  const { tokens, connected, chain } = useAppSelector(state => {
    return {
      tokens: state.tokens,
      connected: state.connect.connected,
      chain: state.connect.chainId
    }
  });
  const width = useWindowWidth(50);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    setModal(true)
  }, []);

  const connectWallet = React.useCallback(async (service: 'injected' | 'walletconnect') => {
    try {
      await setProvider(service);
      const accounts: string[] = await web3.eth.getAccounts();
      dispatch(makeConnection({
        connected: true,
        address: accounts[0],
        chainId: Number(await web3.eth.getChainId())
      }));
      localStorage.setItem('walletprovider', service);
      dispatch(await getWalletData());
    }
    catch (e) {
      console.log(e);
      dispatch(makeConnection({
        connected: false,
        address: '',
        chainId: 1
      }));
    }
  }, [dispatch]);

  React.useEffect(() => {
    async function start() {
      const walletprovider: string | null = localStorage.getItem('walletprovider');
      if (walletprovider === 'injected' || walletprovider === 'walletconnect') {
        await connectWallet(walletprovider);
      } else {
        const chain: number = await web3.eth.getChainId();
        dispatch(changeChain(chain));
      }
    }

    Promise.resolve(start());

  }, [connectWallet, dispatch]);

  React.useEffect(() => {
    const str: string = JSON.parse(Networks[Number(chain) ?? 0]).name;
    setNetwork(str);
  }, [chain])

  React.useEffect(() => {
    async function subscribe() {
      const provider: any = await detectEthereumProvider();
      if (!provider) return;
      provider.on("connect", async () => {
      });
  
      provider.on("disconnect", async () => {
          localStorage.removeItem('walletprovider');
          dispatch(reset());
          dispatch(await getWalletData());
        }
      );
  
      provider.on("accountsChanged", async (accounts: string[]) => {
        if (accounts.length === 0) {
          localStorage.removeItem('walletprovider');
          window.location.reload();
        } else {
          dispatch((changeAccount(accounts[0])));
          dispatch(await getWalletData());          
        }
      });
  
      provider.on("chainChanged", async (chainId: number) => {
        dispatch(changeChain(Number(chainId)));
        window.location.reload();
      });
    }
    
    Promise.resolve(subscribe());

  }, [connected, dispatch])

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
        <h3>{`Network: ${network}`}</h3>
        <Deposit />
        <Controls add={add} remove={remove} length={tokens.length} />
        {tokens.map((item: any, index: number) => (
            <Token key={index} index={index} deposit={false} />
          ))}
        </>}
        {selected === 2 &&
        <>
        <h1>Swap Multiple to ETH</h1>
        <h3>{`Network: ${network}`}</h3>
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
