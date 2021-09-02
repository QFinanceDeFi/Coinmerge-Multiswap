import React from "react";
import { getTokenInfo, updateItem, updateSlippage } from "../../actions/tokenSlice";
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
    const [slippageInput, setSlippageInput] = React.useState<number>(0);
    const { name, symbol, address, priceUsd, logo, tokenInfo, slippage, amount } = useAppSelector(state => {
        return {
            name: state.tokens[index].name,
            symbol: state.tokens[index].symbol,
            address: state.tokens[index].address,
            priceUsd: state.tokens[index].priceUsd,
            tokenInfo: state.wallet.tokens.find(t => t.tokenInfo.address === state.tokens[index].address),
            logo: state.tokens[index].logo,
            slippage: state.tokens[index].slippage,
            amount: state.swap.outputs[index]?.amount ?? '0'
        }
    });
    const [modal, setModal] = React.useState<boolean>(false);
    const [slippageModal, setSlippageModal] = React.useState<boolean>(false);
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(updateItem({
            name,
            symbol,
            address,
            percent,
            priceUsd,
            slippage,
            logo,
            index
        }))
    }, [percent])

    React.useEffect(() => {
        if (address !== '') dispatch(getTokenInfo({token: address, index}));
    }, [address])

    React.useEffect(() => {
        dispatch(updateSlippage({slippage: slippageInput, index}));
    }, [slippageInput])

    function update(newName: string, newSymbol: string, newAddress: string) {
        setModal(false);
        dispatch(updateItem({
            name: newName,
            symbol: newSymbol,
            address: newAddress,
            priceUsd,
            logo,
            percent,
            slippage,
            index
        }))
    }

    function cleanString(str: string) {
        const decimalPlaces = str.slice(-tokenInfo?.tokenInfo.decimals) ?? '0';
        const inFront = str.slice(0, str.length - tokenInfo?.tokenInfo.decimals) ?? '0';
        
        return `${inFront}.${decimalPlaces}` ?? '0';
    }

    return (
        <>
        <div className="token">
            <div className="token-content">
                <div className="token-details">
                    <div className={`token-icon ${symbol === '' && 'token-icon-empty'}`} onClick={() => setModal(true)}>
                        {logo !== '' && <img src={logo} width="24px" />}
                        <span style={{fontWeight: 600}}>{symbol !== '' ? symbol.toUpperCase() : 'Select Token'}</span>
                    </div>
                </div>
                <div className="token-amount">
                    <span>{`Balance: ${Number(cleanString(tokenInfo?.rawBalance ?? '0')).toFixed(4) ?? 0} ${symbol && symbol.toUpperCase()}`}</span>
                    <input className="token-input" type="number" value={amount} disabled />
                    <span>{`~$${(Number(amount) * Number(priceUsd)).toFixed(2).toLocaleString()} USD`}</span>
                </div>
            </div>
            <div className="token-slippage" onClick={() => setSlippageModal(true)}>
                {`Slippage: ${slippage === 0 ? `Auto` : slippage}`}
            </div>
            <div className="token-warning">
                {address !== '' && <span>Validate {symbol.toUpperCase()}: <a href={`https://etherscan.io/token/${address}`} target="_blank noreferrer">
                    {address}
                </a></span>}
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
        {slippageModal &&
            <Modal open={slippageModal} close={() => setSlippageModal(false)}>
                <h3 style={{margin: '4px 0', fontWeight: 500}}>Custom Slippage</h3>
                <span style={{fontSize: '14px', marginTop: '8px'}}>
                    Warning: Increasing the slippage means you are willing to take less than the originally quoted amount on your swap.
                    Too high a slippage value allows bots to front-run you, causing your swap to be at a higher price. If you
                    are not sure if you need this, try completing the swap with 'Auto' slippage. If that fails, then you should slowly
                    increase slippage value until the transaction is accepted.
                </span>
                <div className="token-slippage-input-container">
                    <button onClick={() => setSlippageInput(0)} className="token-slippage-input-button">
                        Auto
                    </button>
                    <input className="token-slippage-input" placeholder="0" type="number" min={0} max={100}
                        onChange={(e: any) => setSlippageInput(e.target.value)} value={slippageInput} />
                </div>
                <div className="token-slippage-confirm">
                    <button onClick={() => setSlippageModal(false)} className="token-slippage-confirm-button">
                        Confirm
                    </button>
                </div>
            </Modal>
        }
        </>
    )
}

export default Token;