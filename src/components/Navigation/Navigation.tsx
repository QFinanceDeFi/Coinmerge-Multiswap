import React from "react";
import NavigationItem from "./NavigationItem";
import "./navigation.css";
import { useAppDispatch } from "../../hooks/hooks";
import { clearTokens } from "../../state/tokens/tokens";
import { clearSwap } from "../../state/swap/swap";

interface INavigationProps {
    selected: number;
    update: Function;
}

const Navigation: React.FC<INavigationProps> = ({ selected, update }) => {
    const dispatch = useAppDispatch();

    function handleClick(num: number) {
        dispatch(clearTokens());
        dispatch(clearSwap());
        update(num);
    }

    return (
        <div className="navigation">
            <NavigationItem label="Swap for Multiple" active={selected === 1} onClick={() => handleClick(1)} />
            <NavigationItem label="Swap for ETH" active={selected === 2} onClick={() => handleClick(2)} />
        </div>
    )
}

export default Navigation;