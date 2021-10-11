import React from "react";
import { reset } from "../../state/connect/connect";
import Modal from "../Modal/Modal";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import "./wallet.css";
import useScrollHeight from "../../hooks/useScrollHeight";
import { ChevronDown, ChevronUp } from "react-feather";
import { clearWallet } from "../../state/wallet/wallet";
import { asDollar, cleanString } from "../../data/utils";
import { NetworkExplorers, NetworkImages, Networks, NetworkSymbols } from "../../data/networks";

interface IWalletProps {
    connect: Function
}

const Wallet: React.FC<IWalletProps> = ({ connect }) => {
    const [open, setOpen] = React.useState<boolean>(false);
    const [modal, setModal] = React.useState<boolean>(false);
    const [network, setNetwork] = React.useState<string>('Ethereum');
    const { priceUsd, address, connected, chainId, balance } = useAppSelector(state => {
        return {
            priceUsd: state.wallet.basePrice,
            address: state.connect.address,
            connected: state.connect.connected,
            chainId: state.connect.chainId,
            balance: state.wallet.baseBalance
        }
    })
    const dispatch = useAppDispatch();
    const height = useScrollHeight(50);

    React.useEffect(() => {
        if (chainId) {
            const str: string = JSON.parse(Networks[chainId ?? 0]).name;
            setNetwork(str);            
        }
    }, [chainId]);

    return (
        <div className="floating-wallet-ct" style={{display: height === 0 ? 'block' : 'none'}}>
            <div className="floating-wallet-drop" onClick={() => setOpen(!open)}
                style={{background: open ? 'none' : 'rgba(0,0,0,0.3)'}}>
                    {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            <div className="floating-wallet">
                <div className="floating-wallet-top">
                {connected ?
                    (network !== 'Unsupported' ?
                    <a href={`${NetworkExplorers[Number(chainId)]}/address/${address}`} target="_blank noreferrer">
                        {`${address?.slice(0, 6) ?? ''}...${address?.slice(-5) ?? ''}`}
                    </a>
                    :
                    <span style={{color: 'red'}}>Unsupported Network</span>)
                    :
                    (network !== 'Unsupported' ?
                    <span onClick={() => setModal(!modal)}>
                        Connect
                    </span>
                    :
                    <span style={{color: 'lightred', fontSize: '10px'}}>Unsupported Network</span>)
                }
                    <div className="floating-wallet-indicator" style={{background: connected ? 'green' : 'red'}}></div>
                </div>
                <div style={{height: open ? 'auto' : '0', overflow: 'hidden', transition: 'height 2s ease'}}>
                    <div className="floating-wallet-row">
                        <div></div>
                        <div className="floating-wallet-balance">
                            <span>{`${Number(cleanString(balance, 18)).toFixed(3)} ${NetworkSymbols[Number(chainId)]}`}</span>
                            <img src={NetworkImages[Number(chainId)]} alt="Coin logo" />
                        </div>
                    </div>
                <div className="floating-wallet-balance-usd">
                    <span>{`${(asDollar(Number(cleanString(balance, 18)) * Number(priceUsd)))} USD`}</span>
                </div>
                <div className="floating-wallet-row">
                    <span onClick={() => network !== 'Unsupported' ? setModal(true) : null} className="floating-wallet-link">
                        {network !== 'Unsupported' ? (connected ? 'Disconnect' : 'Connect') : 'Unsupported network'}
                    </span>
                </div>
            </div>
            </div>
            {modal && <Modal open={modal} close={() => setModal(false)}>
                {connected ?
                <div className="disconnect-modal">
                <h3>Disconnect?</h3>
                <div className="modal-actions">
                    <button onClick={() => { dispatch(reset()); dispatch(clearWallet()); setModal(false); }} className="disconnect-modal-action">
                        Confirm
                    </button>
                    <button onClick={() => { setModal(false); }} className="disconnect-modal-action-cancel">
                        Cancel
                    </button>
                </div>
                </div>
                :
                <div className="disconnect-modal">
                <h3>Select a wallet</h3>
                <div className="wallet-list">
                    <div className="wallet-list-item" onClick={() => { connect('injected'); setModal(false); }}>
                        <span style={{fontSize: '16px', fontWeight: 500}}>
                            Browser Wallet
                        </span>
                    </div>
                    <div className="wallet-list-item" onClick={() => { connect('walletconnect'); setModal(false); }}>
                        <span style={{fontSize: '16px', fontWeight: 500}}>
                            WalletConnect
                        </span>
                    </div>
                </div>
                </div>
                }
            </Modal>
            }
        </div>
    )
}

export default Wallet;