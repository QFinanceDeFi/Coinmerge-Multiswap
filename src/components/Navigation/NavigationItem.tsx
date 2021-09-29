import React from "react";

interface INavigationItemProps {
    label: string;
    active: boolean;
    onClick: Function;
}

const NavigationItem: React.FC<INavigationItemProps> = ({ label, active, onClick }) => {
    return (
        <div className={`nav-item ${active && 'nav-item-active'}`} onClick={() => onClick() }
            style={{
                cursor: active ? 'default' : 'pointer',
                width: '50%'
            }}
            >
            {label}
        </div>
    )
}

export default NavigationItem;