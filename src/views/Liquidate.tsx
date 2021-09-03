import React from "react";
import { addDepositItem, removeDepositItem } from "../actions/depositSlice";
import TokenControls from "../components/Controls/TokenControls";
import DepositToken from "../components/Deposit/DepositToken";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";

const Liquidate: React.FC = () => {
    const { deposit } = useAppSelector(state => { 
        return {
            deposit: state.deposit
        }
    });
    const dispatch = useAppDispatch();

    function add() {
        dispatch(addDepositItem());
    }

    function remove() {
        dispatch(removeDepositItem(-1));
    }

    return (
        <div className="liquidate" style={{width: '100%'}}>
            <h1 className="eth-deposit_h1">Swap Tokens</h1>
            <TokenControls remove={remove} add={add} length={deposit.length} />
            {deposit.map((item: any, index: number) => (
                <div style={{display: 'inline'}} key={index}>
                <DepositToken key={index} index={index} multi={true} />
                </div>
            ))}
        </div>
    )
}

export default Liquidate;