import React from "react";
import { depositAmount, depositToken } from "../../actions/swapSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import "./deposit.css";

const Deposit: React.FC = () => {
    const [input, setInput] = React.useState<string>('');
    const { balance, priceUsd } = useAppSelector(state => {
        return {
            balance: state.connect.balance,
            priceUsd: state.price.priceUsd
        }
    });

    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(depositAmount(input));
        dispatch(depositToken('ETH'));
    }, [input])

    return (
        <>
        <h1 className="eth-deposit_h1">Swap ETH for Tokens</h1>
        <div className="eth-deposit">
            <div className="deposit-content">
                <div className="deposit-details">
                    <div className="deposit-icon">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Ethereum-icon-purple.svg" width="36px" />
                        <span>ETH</span>
                    </div>
                </div>
                <div className="deposit-amount">
                    <span onClick={() => setInput(balance)} style={{cursor: 'pointer'}}>
                        Max (~{Number(balance).toFixed(5)} ETH)
                    </span>
                    <input className="deposit-input" type="number" value={input} style={{fontWeight: input === '' ? 300 : 600}}
                        onChange={(e: any) => setInput(e.target.value)} placeholder='Enter amount...' autoFocus />
                    <span>{`Value: ~${(Number(input) * Number(priceUsd)).toFixed(2).toLocaleString()} USD`}</span>
                </div>   
            </div>
        </div>
        </>
    );
}

export default Deposit;