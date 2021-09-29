import React from "react";
import { reset } from "../../state/connect/connect";
import Modal from "../Modal/Modal";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import "./wallet.css";
import useScrollHeight from "../../hooks/useScrollHeight";
import { ChevronDown, ChevronUp } from "react-feather";
import { clearWallet } from "../../state/wallet/wallet";

interface IWalletProps {
    connect: Function
}

const Wallet: React.FC<IWalletProps> = ({ connect }) => {
    const [open, setOpen] = React.useState<boolean>(false);
    const [modal, setModal] = React.useState<boolean>(false);
    const { priceUsd, address, connected, balance } = useAppSelector(state => {
        return {
            priceUsd: state.wallet.ethPrice,
            address: state.connect.address,
            connected: state.connect.connected,
            balance: state.wallet.ethBalance
        }
    })
    const dispatch = useAppDispatch();
    const height = useScrollHeight(50);

    return (
        <div className="floating-wallet-ct" style={{display: height === 0 ? 'block' : 'none'}}>
            <div className="floating-wallet-drop" onClick={() => setOpen(!open)}
                style={{background: open ? 'none' : 'rgba(0,0,0,0.3)'}}>
                    {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            <div className="floating-wallet">
                <div className="floating-wallet-top">
                {connected ?
                    <a href={`https://etherscan.io/address/${address}`} target="_blank noreferrer">
                        {`${address?.slice(0, 6) ?? ''}...${address?.slice(-5) ?? ''}`}
                    </a>
                    :
                    <span onClick={() => setModal(!modal)}>
                        Connect
                    </span>
                }
                    <div className="floating-wallet-indicator" style={{background: connected ? 'green' : 'red'}}></div>
                </div>
                <div style={{height: open ? 'auto' : '0', overflow: 'hidden', transition: 'height 2s ease'}}>
                    <div className="floating-wallet-row">
                        <div></div>
                        <div className="floating-wallet-balance">
                            <span>{`${balance.toLocaleString()} ETH`}</span>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/1257px-Ethereum_logo_2014.svg.png" alt="ETH logo" />
                        </div>
                    </div>
                <div className="floating-wallet-balance-usd">
                    <span>{`$${(Number(balance) * Number(priceUsd)).toLocaleString()} USD`}</span>
                </div>
                <div className="floating-wallet-row">
                    <span onClick={() => setModal(true)} className="floating-wallet-link">
                        {connected ? 'Disconnect' : 'Connect'}
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