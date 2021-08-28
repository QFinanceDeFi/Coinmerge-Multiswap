import React from "react";
import { ArrowDown, Minus, Plus } from "react-feather";
import { checkOutputs } from "../../data/transactions";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import "./controls.css";

interface IControlProps {
    remove: Function;
    add: Function;
    length: number;
    tokenBase?: boolean;
}

const Controls: React.FC<IControlProps> = ({ remove, add, length, tokenBase = false }) => {
    const { tokens, outputs, depositAmount, percent } = useAppSelector(state => {
        return {
            tokens: state.tokens,
            outputs: state.swap.outputs,
            depositAmount: !tokenBase ? state.swap.depositAmount : state.deposit[0].depositAmount,
            percent: state.tokens.reduce((acc: any, item: any) => acc + item.percent, 0)
        }
    });

    return (
        <div className="controls">
            <div className="submit-buttons">
                <button className="submit-button" onClick={() => checkOutputs(tokens, depositAmount)} disabled={percent !== 100 || Number(depositAmount) === 0}>
                    Swap
                </button>
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
        </div>
    );
}

export default Controls;