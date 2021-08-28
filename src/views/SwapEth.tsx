import React from "react";
import { addItem, removeItem } from "../actions/tokenSlice";
import Controls from "../components/Controls/Controls";
import Deposit from "../components/Deposit/Deposit";
import Token from "../components/Token/Token";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";

const SwapEth: React.FC = () => {
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
            <Deposit />
            <Controls remove={remove} add={add} length={tokens.length} />
            
            {tokens.map((item: any, index: number) => (
                <Token key={index} index={index} />
            ))}
        </>
    )
}

export default SwapEth;