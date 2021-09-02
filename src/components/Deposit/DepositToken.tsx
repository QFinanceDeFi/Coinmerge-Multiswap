import React from "react";
import { getTokenData, setDepositItem, updateDepositAmount } from "../../actions/depositSlice";
import { depositAmount, depositToken } from "../../actions/swapSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import Modal from "../Modal/Modal";
import Search from "../Search/Search";
import "./deposit.css";

interface IDepositProps {
    index: number;
    multi: boolean;
}

const DepositToken: React.FC<IDepositProps> = ({ index, multi }) => {
    const [input, setInput] = React.useState<string>('');
    const [modal, setModal] = React.useState<boolean>(false);
    const { name, symbol, address, tokenInfo, priceUsd, logo, wallet, amount, percent } = useAppSelector(state => {
        return {
            name: state.deposit[index].name,
            symbol: state.deposit[index].symbol,
            address: state.deposit[index].address,
            priceUsd: state.deposit[index].priceUsd,
            tokenInfo: state.wallet.tokens.find(t => t.tokenInfo.address === state.deposit[index].address),
            wallet: state.wallet.tokens,
            logo: state.deposit[index].logo,
            amount: multi ? state.deposit[index].balance : state.swap.depositAmount,
            percent: state.tokens.reduce((acc: any, curr: any) => acc + curr.percent, 0)
        }
    });

    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(updateDepositAmount({depositAmount: input, index}))
    }, [input])

    function update(newName: string, newSymbol: string, newAddress: string): void {
        setModal(false);
        if (newAddress !== '') {
            dispatch(getTokenData({token: newAddress, index}));
            dispatch(depositToken(newAddress));
        }
        dispatch(setDepositItem({
            name: newName,
            symbol: newSymbol,
            address: newAddress,
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
        <div className="eth-deposit">
            <div className="deposit-content">
                <div className="deposit-details">
                    <div className={`token-deposit-icon ${symbol === '' && 'token-icon-empty'}`} onClick={() => setModal(true)}>
                        <img src={logo} width="32px" style={{display: logo === '' ? 'none' : 'block'}} />
                        <span style={{fontSize: '14px'}}>{symbol === '' ? 'Select Token' : symbol.toUpperCase()}</span>
                    </div>
                </div>
                <div className="deposit-amount">
                    <span onClick={() => setInput(cleanString(tokenInfo?.rawBalance ?? '0'))} style={{cursor: 'pointer'}}>
                        {`Send Max (~${Number(cleanString(tokenInfo?.rawBalance ?? '0')).toFixed(4)} ${symbol.toUpperCase()})`}
                    </span>
                    <input className="deposit-input" type="number" style={{fontWeight: input === '' ? 300 : 600}} placeholder='Enter amount...' autoFocus
                        value={input} onChange={(e: any) => setInput(e.target.value)} />
                    <span>Value: ~${(Number(input) * Number(priceUsd)).toFixed(2).toLocaleString()}</span>
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

export default DepositToken;