import React from "react";
import { addItem, removeItem } from "../actions/tokenSlice";
import Controls from "../components/Controls/Controls";
import DepositToken from "../components/Deposit/DepositToken";
import Token from "../components/Token/Token";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";

const SwapTokens: React.FC = () => {
    const { tokens, priceUsd, swap } = useAppSelector(state => {
        return {
            tokens: state.tokens,
            priceUsd: state.price.priceUsd,
            swap: state.swap
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
            <DepositToken />
            <Controls remove={remove} add={add} length={tokens.length} tokenBase={true} />
            {tokens.map((item: any, index: number) => (
                <Token key={index} index={index} />
            ))}
        </>
    )
}

export default SwapTokens;