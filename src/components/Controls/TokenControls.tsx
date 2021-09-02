import React from "react";
import { ArrowDown, Minus, Plus } from "react-feather";
import { reset } from "../../actions/connectSlice";
import { updateOutputs } from "../../actions/swapSlice";
import { checkOutputs, getTokenOutput, liquidateForETH, makeSwap } from "../../data/transactions";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import Modal from "../Modal/Modal";
import { Check, X } from "react-feather";
import ClipLoader from "react-spinners/ClipLoader";
import "./controls.css";

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

const TokenControls: React.FC<IControlProps> = ({ remove, add, length, tokenBase = false, index = 0 }) => {
    const [state, setState] = React.useState<ITransactionState>({
        status: 'standby', message: '', hash: ''
    });
    const [outputs, setOutputs] = React.useState<string[]>(['0']);
    const [modal, setModal] = React.useState<boolean>(false);
    const { deposit, address } = useAppSelector(state => {
        return {
            deposit: state.deposit,
            address: state.connect.address
        }
    });

    const dispatch = useAppDispatch();

    async function getOutputs() {
        const tmp: any = [];
        deposit.map(async (item: any) => {
            const output = await getTokenOutput(item.address, item.depositAmount, 0.1);
            tmp.push(output);
        });

        setOutputs(tmp);

        return tmp;
    }

    async function processTx() {
        await liquidateForETH(deposit, outputs, address);
    }

    return (
        <>
        <div className="controls">
            <div className="submit-buttons">
                <button className="submit-button" onClick={async () => { await getOutputs(); setModal(true) }}
                    disabled={deposit.filter(d => d.address === '' || Number(d.depositAmount) === 0) === []}>
                    Swap
                </button>
            </div>
            {deposit.filter(d => Number(d.depositAmount) === 0) === [] &&
            <div className="submit-error" style={{margin: '8px 0'}}>
                <span style={{color: 'red'}}>Check deposit amounts</span>
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
                    {deposit.map((item: any, index) => (
                        <div className="confirm-line-item" key={index}>
                            <div className="confirm-item-symbol">
                                {item.symbol.toUpperCase()}
                            </div>
                            <div className="confirm-item-amount">
                                {`${Number(item.depositAmount ?? '0').toFixed(3)} ${item.symbol.toUpperCase()} for ${outputs[index]?.slice(0, -15) ?? '0'} ETH`}
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

export default TokenControls;