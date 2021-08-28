import React from "react";
import NavigationItem from "./NavigationItem";
import "./navigation.css";

interface INavigationProps {
    selected: number;
    update: Function;
}

const Navigation: React.FC<INavigationProps> = ({ selected, update }) => {

    return (
        <div className="navigation">
            <NavigationItem label="Swap ETH" active={selected === 1} onClick={() => update(1)} />
            <NavigationItem label="Swap Tokens" active={selected === 2} onClick={() => update(2)} />
            <NavigationItem label="Liquidate" active={selected === 3} onClick={() => update(3)} />
        </div>
    )
}

export default Navigation;