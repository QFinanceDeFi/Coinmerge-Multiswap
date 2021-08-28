import React from "react";
import { getTokenData, setDepositItem, updateDepositAmount } from "../../actions/depositSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import Modal from "../Modal/Modal";
import Search from "../Search/Search";
import "./deposit.css";

const DepositToken: React.FC = () => {
    const [input, setInput] = React.useState<string>('');
    const [modal, setModal] = React.useState<boolean>(false);
    const { name, symbol, address, balance, priceUsd, logo, depositAmount, percent } = useAppSelector(state => {
        return {
            name: state.deposit[0].name,
            symbol: state.deposit[0].symbol,
            address: state.deposit[0].balance,
            priceUsd: state.deposit[0].priceUsd,
            balance: state.deposit[0].balance,
            logo: state.deposit[0].logo,
            depositAmount: state.deposit[0].depositAmount,
            percent: state.tokens.reduce((acc: any, curr: any) => acc + curr.percent, 0)
        }
    });

    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(updateDepositAmount({input, index: 0}));
    }, [input])

    function update(newName: string, newSymbol: string, newAddress: string): void {
        setModal(false);
        if (newAddress !== '') dispatch(getTokenData({token: newAddress, index: 0}));
        dispatch(setDepositItem({
            name: newName,
            symbol: newSymbol,
            address: newAddress,
            index: 0
        }))
    }

    return (
        <>
        <h1 className="eth-deposit_h1">Swap Token for Tokens</h1>
        <div className="eth-deposit">
            <div className="deposit-content">
                <div className="deposit-details">
                    <div className={`token-deposit-icon ${symbol === '' && 'token-icon-empty'}`} onClick={() => setModal(true)}>
                        <img src={logo} width="36px" style={{display: logo === '' ? 'none' : 'block'}} />
                        <span style={{fontSize: '14px'}}>{symbol === '' ? 'Select Token' : symbol.toUpperCase()}</span>
                    </div>
                </div>
                <div className="deposit-amount">
                    <span onClick={() => setInput(balance)} style={{cursor: 'pointer'}}>
                        {`Send Max (~${Number(balance).toFixed(4)} ${symbol.toUpperCase()})`}
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