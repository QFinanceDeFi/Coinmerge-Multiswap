import React from "react";
import { addItem, removeItem } from "../actions/tokenSlice";
import Controls from "../components/Controls/Controls";
import DepositToken from "../components/Deposit/DepositToken";
import Token from "../components/Token/Token";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";

const SwapTokens: React.FC = () => {
    const { tokens } = useAppSelector(state => {
        return {
            tokens: state.tokens
        }
    });
    const dispatch = useAppDispatch();

    function add() {
        dispatch(addItem());
    }

    function remove() {
        dispatch(removeItem(-1));
    }
    return (
        <>
            <h1 className="eth-deposit_h1">Swap Token for Tokens</h1>
            <DepositToken index={0} multi={false} />
            <Controls remove={remove} add={add} length={tokens.length} tokenBase={true} />
            {tokens.map((item: any, index: number) => (
                <Token key={index} index={index} />
            ))}
        </>
    )
}

export default SwapTokens;