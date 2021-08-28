import React from "react";
import { getTokenInfo, updateItem } from "../../actions/tokenSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import Modal from "../Modal/Modal";
import Search from "../Search/Search";
import Slider from "../Slider/Slider";
import "./token.css";

interface ITokenProps {
    index: number;
}

const Token: React.FC<ITokenProps> = ({ index }) => {
    const [percent, setPercent] = React.useState<number>(0);
    const { name, symbol, address, priceUsd, logo, balance, amount } = useAppSelector(state => {
        return {
            name: state.tokens[index].name,
            symbol: state.tokens[index].symbol,
            address: state.tokens[index].address,
            priceUsd: state.tokens[index].priceUsd,
            balance: state.tokens[index].balance,
            logo: state.tokens[index].logo,
            amount: state.swap.outputs[index]?.amount ?? '0'
        }
    });
    const [modal, setModal] = React.useState<boolean>(false);
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(updateItem({
            name,
            symbol,
            address,
            percent,
            priceUsd,
            logo,
            index
        }))
    }, [percent])

    React.useEffect(() => {
        if (address !== '') dispatch(getTokenInfo({token: address, index}));
    }, [address])

    function update(newName: string, newSymbol: string, newAddress: string) {
        setModal(false);
        dispatch(updateItem({
            name: newName,
            symbol: newSymbol,
            address: newAddress,
            priceUsd,
            logo,
            percent,
            index
        }))
    }

    return (
        <>
        <div className="token">
            <div className="token-content">
                <div className="token-details">
                    <div className={`token-icon ${symbol === '' && 'token-icon-empty'}`} onClick={() => setModal(true)}>
                        {logo !== '' && <img src={logo} width="32px" />}
                        <span style={{fontWeight: 600}}>{symbol !== '' ? symbol.toUpperCase() : 'Select Token'}</span>
                    </div>
                </div>
                <div className="token-amount">
                    <span>Current balance: {balance}</span>
                    <input className="token-input" type="number" value={amount} disabled />
                    <span>{`~$${(Number(amount) * Number(priceUsd)).toFixed(2).toLocaleString()} USD`}</span>
                </div>
            </div>
            <div className="token-warning">
                {address !== '' && <span>Validate {symbol.toUpperCase()}: <a href={`https://etherscan.io/token/${address}`}>{address}</a></span>}
            </div>
            <div className="token-slider">
                <Slider value={percent} update={(val: number) => setPercent(val)} />
                <div className="slider-actions">
                    <button className="slider-button" onClick={() => setPercent(25)}>25%</button>
                    <button className="slider-button" onClick={() => setPercent(50)}>50%</button>
                    <button className="slider-button" onClick={() => setPercent(75)}>75%</button>
                    <button className="slider-button" onClick={() => setPercent(100)}>100%</button>
                </div>
            </div>
        </div>
        {modal &&
            <Modal open={modal} close={() => setModal(false)}>
                <h3 style={{margin: '4px 0', fontWeight: 500}}>Select Token</h3>
                <Search update={update} />
            </Modal>
        }
        </>
    )
}

export default Token;