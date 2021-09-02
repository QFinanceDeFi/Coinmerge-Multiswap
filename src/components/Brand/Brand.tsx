import React from "react";
import "./brand.css";
import logo from "./cm.jpg";

const Brand: React.FC = () => {
    return (
        <div className="floating-brand">
            <img src={logo} width="48px" />
            <span>CoinMerge</span>
        </div>
    )
}

export default Brand;