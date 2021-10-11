import React from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import "./deposit.css";
import { getSwapData, updateDepositAmount } from "../../state/swap/swap";
import Modal from "../Modal/Modal";
import Search from "../Search/Search";
import { checkIsBase, cleanString } from "../../data/utils";
import { SWAP_ADDRESS, web3 } from "../../data/base";
import useToken from "../../hooks/useToken";
import useDecimals from "../../hooks/useDecimals";
import usePrice from "../../hooks/usePrice";

const Deposit: React.FC = () => {
    const [input, setInput] = React.useState<string>('0');
    const [modal, setModal] = React.useState<boolean>(false);
    const { balance, price, swap } = useAppSelector(state => {
        return {
            balance: state.wallet.baseBalance,
            price: state.wallet.basePrice,
            swap: state.swap
        }
    });
    const { state } = useToken(swap.address, SWAP_ADDRESS);
    const { priceUsd } = usePrice(swap.address);
    const decimals: number = useDecimals(swap.address);
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
                    <span onClick={() => setInput(checkIsBase(swap.symbol) ? web3.utils.fromWei(balance, 'ether') : cleanString(state.balance, decimals))}
                        style={{cursor: 'pointer'}}>
                        {`Max ~${checkIsBase(swap.symbol) ? web3.utils.fromWei(balance, 'ether') : cleanString(state.balance, decimals)} ${swap.symbol.toUpperCase()}`}
                    </span>
                    <input className="deposit-input" type="number" value={input} style={{fontWeight: input === '' ? 300 : 600}}
                        onChange={(e: any) => setInput(e.target.value)} placeholder='Enter amount...' autoFocus />
                    <span>{`Value: ~$${(Number(input) * (checkIsBase(swap.address) ? price : priceUsd)).toFixed(2).toLocaleString()} USD`}</span>
                </div>
                {modal &&
                    <Modal open={modal} close={() => setModal(false)}>
                        <h3 style={{margin: '4px 0', fontWeight: 500}}>Select Token</h3>
                        <Search update={update} eth={!checkIsBase(swap.address)} />
                    </Modal>
                }
            </div>
        </div>
    );
}

export default Deposit;