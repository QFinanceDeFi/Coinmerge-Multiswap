import React from "react";
import { connect } from "react-redux";
import { reset } from "../../actions/connectSlice";
import Modal from "../Modal/Modal";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import "./wallet.css";
import useScrollHeight from "../../hooks/useScrollHeight";
import { ChevronDown, ChevronUp } from "react-feather";

interface IWalletProps {
    connect: Function
}

const Wallet: React.FC<IWalletProps> = ({ connect }) => {
    const [open, setOpen] = React.useState<boolean>(false);
    const [modal, setModal] = React.useState<boolean>(false);
    const { priceUsd } = useAppSelector(state => state.price);
    const { address, balance, connected } = useAppSelector(state => state.connect);
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
                        {`${address.slice(0, 7)}...${address.slice(-6, -1)}`}
                    </a>
                    :
                    <span onClick={() => connect()}>
                        Connect
                    </span>
                }
                    <div className="floating-wallet-indicator" style={{background: connected ? 'green' : 'red'}}></div>
                </div>
                <div style={{height: open ? 'auto' : '0', overflow: 'hidden', transition: 'height 2s ease'}}>
                    <div className="floating-wallet-row">
                        <div></div>
                        <div className="floating-wallet-balance">
                            <span>{`${Number(balance.slice(0, 10)).toFixed(4)} ETH`}</span>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/1257px-Ethereum_logo_2014.svg.png" alt="ETH logo" />
                        </div>
                    </div>
                <div className="floating-wallet-balance-usd">
                    <span>{`$${(Number(balance) * Number(priceUsd)).toLocaleString()} USD`}</span>
                </div>
                <div className="floating-wallet-row">
                    <span onClick={() => connected ? setModal(true) : connect()} className="floating-wallet-link">
                        {connected ? 'Disconnect' : 'Connect'}
                    </span>
                    <span className="floating-wallet-link">Pending Transactions</span>
                </div>
            </div>
            </div>
            {modal && <Modal open={modal} close={() => setModal(false)}>
                <h3>Disconnect?</h3>
                <div className="disconnect-modal">
                    <span style={{textAlign: 'center', paddingTop: '32px', background: 'radial-gradient(black, rgba(0,0,0,0.1))'}}>Disconnect?</span>
                    <div className="disconnect-modal-header">
                    <video src="https://assets.website-files.com/60e47e3000ca7e8e53523322/60ea0c9e308a0adb0c75196c_Untitled design (3)-transcode.webm" style={{width: '128px'}}
                        autoPlay loop className="App-brand-video" />
                    </div>
                    <div className="modal-actions">
                        <button onClick={() => { setModal(false); }} className="disconnect-modal-action">
                            Cancel
                        </button>
                        <button onClick={() => { dispatch(reset()); setModal(false); }} className="disconnect-modal-action">
                            Confirm
                        </button>
                    </div>              
                </div>
            </Modal>
            }
        </div>
    )
}

export default Wallet;