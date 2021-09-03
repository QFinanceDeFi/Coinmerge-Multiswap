import React from "react";
import NavigationItem from "./NavigationItem";
import "./navigation.css";
import { useAppDispatch } from "../../hooks/hooks";
import { depositAmount } from "../../actions/swapSlice";

interface INavigationProps {
    selected: number;
    update: Function;
}

const Navigation: React.FC<INavigationProps> = ({ selected, update }) => {
    const dispatch = useAppDispatch();

    function handleClick(num: number) {
        dispatch(depositAmount('0'));
        update(num);
    }

    return (
        <div className="navigation">
            <NavigationItem label="Swap ETH" active={selected === 1} onClick={() => handleClick(1)} />
            <NavigationItem label="Swap Tokens" active={selected === 2} onClick={() => handleClick(2)} />
            <NavigationItem label="Liquidate" active={selected === 3} onClick={() => handleClick(3)} />
        </div>
    )
}

export default Navigation;