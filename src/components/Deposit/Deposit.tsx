import React from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import "./deposit.css";
import { getSwapData, updateDepositAmount } from "../../state/swap/swap";
import Modal from "../Modal/Modal";
import Search from "../Search/Search";
import { cleanString } from "../../data/utils";

const Deposit: React.FC = () => {
    const [input, setInput] = React.useState<string>('');
    const [modal, setModal] = React.useState<boolean>(false);
    const { balance, decimals, priceUsd, swap } = useAppSelector(state => {
        const data: any = state.wallet.tokens.find((t: any) => t.tokenInfo.address === state.swap.address);
        return {
            balance: state.swap.symbol === "ETH" ? state.wallet.ethBalance : data?.rawBalance ?? '0',
            decimals: state.swap.symbol === "ETH" ? 18 : data?.tokenInfo.decimals ?? 18,
            priceUsd: state.swap.symbol === "ETH" ? state.wallet.ethPrice : data?.tokenInfo.price?.rate ?? 0,
            swap: state.swap
        }
    });
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(updateDepositAmount(input));
    }, [input, dispatch])

    function update(newName: string, newSymbol: string, newAddress: string, newLogo: string): void {
        setModal(false);
        if (newAddress !== '') {
            dispatch(getSwapData({token: newAddress, name: newName, symbol: newSymbol, logo: newLogo}));
        }
    }

    return (
        <div className="eth-deposit">
            <div className="deposit-content">
                <div className="deposit-details">
                    <div className={`token-deposit-icon ${swap.symbol === '' && 'token-icon-empty'}`} onClick={() => setModal(true)}>
                        <img src={swap.logo} width="28px" style={{display: swap.logo === '' ? 'none' : 'block'}} alt="token logo" />
                        <span style={{fontSize: '14px'}}>{swap.symbol === '' ? 'Select Token' : swap.symbol.toUpperCase()}</span>
                    </div>
                </div>
                <div className="deposit-amount">
                    <span onClick={() => setInput(swap.symbol === "ETH" ? balance : cleanString(balance, decimals))}
                        style={{cursor: 'pointer'}}>
                        {`Max ~${swap.symbol === "ETH" ? balance.toFixed(4) : cleanString(balance, decimals)} ${swap.symbol.toUpperCase()}`}
                    </span>
                    <input className="deposit-input" type="number" value={input} style={{fontWeight: input === '' ? 300 : 600}}
                        onChange={(e: any) => setInput(e.target.value)} placeholder='Enter amount...' autoFocus />
                    <span>{`Value: ~$${(Number(input) * priceUsd).toFixed(2).toLocaleString()} USD`}</span>
                </div>
                {modal &&
                    <Modal open={modal} close={() => setModal(false)}>
                        <h3 style={{margin: '4px 0', fontWeight: 500}}>Select Token</h3>
                        <Search update={update} eth={true} />
                    </Modal>
                }
            </div>
        </div>
    );
}

export default Deposit;