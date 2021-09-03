import React from "react";
import { Minus, Plus } from "react-feather";
import { updateOutputs } from "../../actions/swapSlice";
import { approveContract, checkOutputs, makeSwap } from "../../data/transactions";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import Modal from "../Modal/Modal";
import { Check, X } from "react-feather";
import ClipLoader from "react-spinners/ClipLoader";
import "./controls.css";
import { getBalances } from "../../actions/walletSlice";

interface IControlProps {
    remove: Function;
    add: Function;
    length: number;
    tokenBase?: boolean;
    index?: number;
}

interface ITransactionState {
    status: 'pending' | 'standby' | 'error' | 'success';
    message: string;
    hash: string;
}

const Controls: React.FC<IControlProps> = ({ remove, add, length, tokenBase = false, index = 0 }) => {
    const [state, setState] = React.useState<ITransactionState>({
        status: 'standby', message: '', hash: ''
    });
    const [modal, setModal] = React.useState<boolean>(false);
    const { tokens, outputs, deposit, depositAmount, token, percent, address, wallet } = useAppSelector(state => {
        return {
            tokens: state.tokens,
            outputs: state.swap.outputs,
            deposit: tokenBase ? state.deposit : [],
            depositAmount: tokenBase ? state.deposit[index].depositAmount : state.swap.depositAmount,
            token: tokenBase ? state.deposit[index].address : '',
            percent: state.tokens.reduce((acc: any, item: any) => acc + item.percent, 0),
            address: state.connect.address,
            wallet: state.wallet.tokens
        }
    });

    const dispatch = useAppDispatch();

    async function getOutputs() {
        const res = await checkOutputs(tokens, depositAmount, tokenBase, token).catch((e: any) => console.log(e));
        if (res) {
            dispatch(updateOutputs({tokens: res[0], amounts: res[1]}));
        }
    }

    React.useEffect(() => {

        if (percent === 100 && Number(depositAmount) > 0) {
            setTimeout(() => {
                getOutputs();
            }, 1000)
        }

    }, [depositAmount, percent, tokens])

    async function processTx() {
        setModal(false);
        setState({
            ...state,
            status: 'pending'
        });
        const txHash = await makeSwap(tokens, depositAmount, outputs, address, tokenBase, token).then((res: any) => {
            setState({
                ...state,
                hash: res.transactionHash
            })

            return res.transactionHash;
        }).catch((e: any) => {
            console.log(e);
            setState({
                status: 'error',
                message: 'Swap failed',
                hash: ''
            })
            return;
        })

        if (txHash) {
            setState({
                status: 'success',
                message: 'Swap successful',
                hash: txHash
            })
        }

        return txHash;
    }

    async function approve() {
        setState({
            status: 'pending',
            message: 'Pending',
            hash: ''
        });
        const txHash = await approveContract(deposit[0].address, depositAmount).then((res: any) => {
            console.log(res);

            return res.transactionHash
        }).catch((e: any) => {
            console.log(e);
            setState({
                status: 'error',
                message: 'Swap failed',
                hash: ''
            });
        });

        setState({
            status: 'success',
            hash: txHash,
            message: 'Success'
        })

        await dispatch(getBalances(address));

    }

    function isApproved() {
        return tokenBase ? Number(wallet.find((tok: any) => tok.tokenInfo.address === deposit[0]?.address)?.allowance) >= Number(depositAmount) : true;
    }

    return (
        <>
        <div className="controls">
            <div className="submit-buttons">
                {!isApproved() &&
                <button className="submit-button" onClick={async () => await approve()}
                    disabled={percent !== 100 || Number(depositAmount) === 0 || outputs.filter(o => o.address === '' || Number(o.amount) > 0) === []}>
                        Approve
                    </button>
                }
                {isApproved() &&
                <button className="submit-button" onClick={async () => { await getOutputs(); setModal(true)}}
                    disabled={percent !== 100 || Number(depositAmount) === 0 || outputs.filter(o => o.address === '' || Number(o.amount) > 0) === []}>
                    Swap
                </button>}
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
                    {tokens.map((item: any, index) => (
                        <div className="confirm-line-item">
                            <div className="confirm-item-symbol">
                                {item.symbol.toUpperCase()}
                            </div>
                            <div className="confirm-item-amount">
                                {`${Number(outputs[index]?.amount ?? '0').toFixed(4)} (${item.percent}%)`}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="modal-actions">
                        <button onClick={() => { setModal(false); }} className="disconnect-modal-action">
                            Cancel
                        </button>
                        <button onClick={processTx} className="disconnect-modal-action">
                            Confirm
                        </button>
                </div>
            </Modal>
        }
        </div>
        {state.status !== 'standby' &&
        <div className="pending-tx">
            <div className="pending-tx-status">
                {state.status === 'pending' && <ClipLoader color="silver" loading={state.status === 'pending'} size={24} />}
                {state.status === 'success' && <Check color="green" size={24} />}
                {state.status === 'error' && <X color="red" size={24} />}
            </div>
            <div className="pending-tx-hash">
                {state.status !== 'error' &&
                    <a href={`https://etherscan.io/tx/${state.hash}`} target="_blank noreferrer" className="pending-tx-hash-a">
                        {state.hash !== '' && `${state.hash.slice(0, 5)}...${state.hash.slice(-5)}`}
                    </a>
                }
                {state.status === 'error' &&
                    <span>{state.message}</span>
                }
            </div>
            <div className="pending-tx-close">
                <X color="silver" size={12} onClick={() => setState({status: 'standby', message: '', hash: ''})} />
            </div>
        </div>
        }
        </>
    );
}

export default Controls;