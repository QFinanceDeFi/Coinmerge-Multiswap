import React from "react";
import Loader from "react-spinners/ClipLoader";
import { getTokenData, setDepositItem, updateDepositAmount, updateDepositSlippage } from "../../actions/depositSlice";
import { depositToken } from "../../actions/swapSlice";
import { getBalances } from "../../actions/walletSlice";
import { approveContract } from "../../data/transactions";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import Modal from "../Modal/Modal";
import Search from "../Search/Search";
import "./deposit.css";

interface IDepositProps {
    index: number;
    multi: boolean;
}

const DepositToken: React.FC<IDepositProps> = ({ index, multi }) => {
    const [state, setState] = React.useState({
        status: 'standby',
        message: 'Standby',
        hash: '',
        approved: true
    })
    const [input, setInput] = React.useState<string>('');
    const [slippageInput, setSlippageInput] = React.useState<number>(0);
    const [slippageModal, setSlippageModal] = React.useState<boolean>(false);
    const [modal, setModal] = React.useState<boolean>(false);
    const { symbol, address, tokenInfo, priceUsd, logo, wallet, slippage, amount } = useAppSelector(state => {
        return {
            symbol: state.deposit[index].symbol,
            address: state.deposit[index].address,
            priceUsd: state.deposit[index].priceUsd,
            tokenInfo: state.wallet.tokens.find(t => t.tokenInfo.address === state.deposit[index].address),
            wallet: state.wallet.tokens,
            logo: state.deposit[index].logo,
            slippage: state.deposit[index].slippage,
            amount: multi ? state.deposit[index].depositAmount : state.swap.depositAmount
        }
    });

    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(updateDepositAmount({depositAmount: input, index}))
        setState(s => {
            return {
                ...s,
                approved: isApproved(input)
            }
        })
    }, [input, address, dispatch, index, logo])

    React.useEffect(() => {
        console.log(slippageInput);
        dispatch(updateDepositSlippage({slippage: slippageInput, address}));
    }, [slippageInput, index, dispatch])

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
        
        return `${inFront}.${decimalPlaces}` ?? '0'
    }

    function isApproved(depositAmount: string): boolean {
        return Number(wallet.find(t => t.tokenInfo.address === address)?.allowance ?? '0') > Number(depositAmount) ?? false
    }

    async function approve(depositAmount: string) {
        setState({
            status: 'pending',
            message: 'Pending',
            hash: '',
            approved: state.approved
        });
        const txHash = await approveContract(address, depositAmount).then(async (res: any) => {
            if (!res) {
                setState({
                    status: 'error',
                    message: 'Approval failed',
                    hash: '',
                    approved: false
                });
            }
            else {
                setState({
                    status: 'success',
                    hash: res.transactionHash,
                    message: 'Success',
                    approved: true
                })
                
                await dispatch(getBalances(address));   
            }

            return res.transactionHash
        }).catch((e: any) => {
            console.log(e);
            setState({
                status: 'error',
                message: 'Approval failed',
                hash: '',
                approved: false
            });
        });

        console.log(txHash);

    }

    return (
        <>
        <div className="eth-deposit">
            <div className="deposit-content">
                <div className="deposit-details">
                    <div className={`token-deposit-icon ${symbol === '' && 'token-icon-empty'}`} onClick={() => setModal(true)}>
                        <img src={logo} width="32px" style={{display: logo === '' ? 'none' : 'block'}} alt="token logo" />
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
            <div className="token-slippage" onClick={() => setSlippageModal(true)}>
                {`Slippage: ${slippage === 0 ? `Auto` : `${slippage}%`}`}
            </div>
        </div>
        {modal &&
            <Modal open={modal} close={() => setModal(false)}>
                <h3 style={{margin: '4px 0', fontWeight: 500}}>Select Token</h3>
                <Search update={update} />
            </Modal>
        }
        {multi && !state.approved &&
        <button className={`token-approve-button ${state.approved && `token-approved`}`}
            onClick={() => isApproved(amount) ? console.log('tx') : approve(amount)}
            disabled={address === '' || Number(amount) === 0}>
                {state.status === 'pending' && <Loader size="12" />}
                <span style={{marginLeft: state.status === 'pending' ? '8px' : '0'}}>Approve</span>
        </button>}
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

export default DepositToken;