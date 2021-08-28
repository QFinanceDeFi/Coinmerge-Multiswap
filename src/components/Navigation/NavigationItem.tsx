import React from "react";

interface INavigationItemProps {
    label: string;
    active: boolean;
    onClick: Function;
}

const NavigationItem: React.FC<INavigationItemProps> = ({ label, active, onClick }) => {
    return (
        <div className="nav-item" onClick={() => onClick() }
            style={{
                background: active ? `rgb(180, 180, 180)` : `rgb(240, 240, 240)`,
                cursor: active ? 'default' : 'pointer'}}
            >
            {label}
        </div>
    )
}

export default NavigationItem;