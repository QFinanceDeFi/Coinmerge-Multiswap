import React from "react";
import { Minus, Plus } from "react-feather";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import Modal from "../Modal/Modal";
import { Check, X } from "react-feather";
import ClipLoader from "react-spinners/ClipLoader";
import "./controls.css";
import { cleanString } from "../../data/utils";
import { getLiquidationOutputs, getOutputs } from "../../state/swap/swap";
import { getWalletData } from "../../state/wallet/wallet";
import { approveContract, clearTx, liquidateForETH, makeSwap } from "../../state/tx/tx";
import { web3 } from "../../data/base";

interface IControlProps {
    remove: Function;
    add: Function;
    length: number;
    liq?: boolean;
    index?: number;
}

const Controls: React.FC<IControlProps> = ({ remove, add, length, liq = false }) => {
    const [modal, setModal] = React.useState<boolean>(false);
    const [enabledLiq, setEnabledLiq] = React.useState<boolean>(false);
    const [enabled, setEnabled] = React.useState<boolean>(false);
    const { tokens, outputs, percent, depositAmount, base, wallet, tx } = useAppSelector(state => {
        return {
            tokens: state.tokens,
            outputs: state.swap.outputs,
            percent: state.tokens.reduce((acc: number, item: any) => acc + item.percent, 0),
            depositAmount: state.swap.depositAmount,
            base: state.swap.address,
            wallet: state.wallet,
            tx: state.tx
        }
    });

    const dispatch = useAppDispatch();

    React.useEffect(() => {
        function isApproved() {
            const tokenData: any = wallet.tokens.find((tok: any) => tok.tokenInfo.address === base);
            if (!tokenData) return false;
            return base !== "ETH" ? Number(cleanString(tokenData.allowance, Number(tokenData.tokenInfo.decimals))) >= Number(depositAmount) : true;
        }
        if (percent === 100 && Number(depositAmount) > 0 && tokens.filter((t: any) => t.percent === 0).length === 0) {
            setTimeout(async () => {
                dispatch(await getOutputs({amount: depositAmount.toString(), base, portfolio: tokens}));
                setEnabled(isApproved());
            }, 1000)
        }
    }, [depositAmount, percent, tokens, base, wallet, dispatch]);

    React.useEffect(() => {
        if (liq && tokens[0].address !== "") {
            let notMet: string[] = [];
            notMet = tokens.reduce((acc: any, item: any) => {
                const details: any = wallet.tokens.find((t: any) => web3.utils.toChecksumAddress(t.tokenInfo.address) === web3.utils.toChecksumAddress(item.address));
                if (details !== undefined) {
                    if (item.depositAmount === '' || Number(item.depositAmount) === 0
                        || Number(item.depositAmount) > Number(cleanString(details.rawBalance, Number(details.tokenInfo.decimals)))
                        || Number(item.depositAmount) > Number(cleanString(details.allowance, Number(details.tokenInfo.decimals)))) {
                            acc.push(item.address);
                            return acc;
                        }
                    else {
                        return acc;
                    }
                } else {
                    return acc;
                }
            }, []);
            if (notMet.length === 0) {
                setEnabledLiq(true);
            } else {
                setEnabledLiq(false);
            }
        }
    }, [wallet, tokens, liq]);

    async function processTx() {
        setModal(false);
        const txHash = liq ?
        dispatch(await liquidateForETH({portfolio: tokens, expected: outputs})) :
        dispatch(await makeSwap({portfolio: tokens, expected: outputs, amount: depositAmount.toString(), base}));
        dispatch(await getWalletData());
        return txHash;
    }

    async function approve() {
        dispatch(await approveContract({token: base, amount: depositAmount}));
        dispatch(await getWalletData());
    }

    async function checkLiqOutputs() {
        dispatch(getLiquidationOutputs({portfolio: tokens}));
    }

    return (
        <>
        <div className="controls">
            <div className="submit-buttons">
                {!liq && !enabled && base !== "ETH" &&
                <button className="submit-button" onClick={async () => await approve()}
                    disabled={percent !== 100 || Number(depositAmount) === 0 || outputs.filter(o => o.address === '' || Number(o.amount) > 0) === []}>
                        Approve
                    </button>
                }
                {!liq && (enabled || base === "ETH") &&
                <button className="submit-button" onClick={async () => { dispatch(await getOutputs({base, amount: depositAmount, portfolio: tokens})); setModal(true)}}
                    disabled={percent !== 100 || Number(depositAmount) === 0 || outputs.filter(o => o.address === '' || Number(o.amount) > 0) === []}>
                    Swap
                </button>}
                {liq &&
                    <button className="submit-button"
                        disabled={!enabledLiq}
                        onClick={async () => { await checkLiqOutputs(); setModal(true) }}>
                        Swap
                    </button>
                    }
            </div>
            {percent !== 0 && percent !== 100 &&
            <div className="submit-error" style={{margin: '8px 0'}}>
                <span style={{color: 'red'}}>Please ensure the portfolio has 100% allocation</span>
            </div>
            }
            {Number(depositAmount) === 0 && percent === 100 &&
            <div className="submit-error" style={{margin: '8px 0'}}>
                <span style={{color: 'red'}}>Set the deposit amount</span>
            </div>
            }
            <div className="control-buttons-container">
                <h4 style={{margin: 0}}>Select Tokens</h4>
                <div className="control-buttons">
                    {length > 1 &&<button className="control-button-remove" onClick={() => remove()}>
                        <Minus />
                    </button>}
                    <button className="control-button-add" onClick={() => add()}>
                        <Plus />
                    </button>
                </div>
            </div>
            {modal &&
            <Modal open={modal} close={() => setModal(false)}>
                <h3 style={{margin: '4px 0', fontWeight: 500}}>Confirm Transaction</h3>
                <span style={{fontSize: '12px'}}>Estimated values only</span>
                <div className="confirm-list">
                    {tokens.map((item: any, index: number) => (
                        <div className="confirm-line-item" key={index}>
                            <div className="confirm-item-symbol">
                                {item.symbol.toUpperCase()}
                            </div>
                            <div className="confirm-item-amount">
                                {!liq && `${Number(cleanString(outputs[index]?.amount ?? '0', item.decimals)).toLocaleString()} ${item.symbol} (${item.percent}%)`}
                                {liq && `${Number(cleanString(outputs[index]?.amount ?? '0', 18))} ETH`}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="modal-actions">
                    <button onClick={processTx} className="disconnect-modal-action">
                        Confirm
                    </button>
                    <button onClick={() => { setModal(false); }} className="disconnect-modal-action-cancel">
                        Cancel
                    </button>
                </div>
            </Modal>
        }
        </div>
        {tx.status !== 'standby' &&
        <div className="pending-tx">
            <div className="pending-tx-status">
                {tx.status === 'pending' && <ClipLoader color="silver" loading={tx.status === 'pending'} size={24} />}
                {tx.status === 'success' && <Check color="green" size={24} />}
                {tx.status === 'failed' && <X color="red" size={24} />}
            </div>
            <div className="pending-tx-hash">
                {tx.status === 'success' &&
                    <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank noreferrer" className="pending-tx-hash-a">
                        {tx.hash && tx.hash !== '' && `${tx.hash.slice(0, 5)}...${tx.hash.slice(-5)}`}
                    </a>
                }
                {tx.status !== 'success' &&
                    <span>{tx.hash}</span>
                }
            </div>
            <div className="pending-tx-close">
                <X color="silver" size={12} onClick={() => dispatch(clearTx())} />
            </div>
        </div>
        }
        </>
    );
}

export default Controls;