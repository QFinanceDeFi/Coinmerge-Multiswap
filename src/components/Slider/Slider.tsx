import React from "react";
import "./slider.css";

interface ISliderProps {
    value: number;
    update: Function;
}

const Slider: React.FC<ISliderProps> = ({ value, update }) => {

    return (
        <div className="slide">
            <input type="range" min={0} max={100} value={value} className="slider" step={1} onChange={(e) => {update(Number(e.target.value))}} />
            <div className="slide-percent">
                {value}%
            </div>
        </div>
    )
}

export default Slider;