import React from "react";
import Loader from "react-spinners/ClipLoader";
import { getTokenData, setDepositItem, updateDepositAmount } from "../../actions/depositSlice";
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
    const [modal, setModal] = React.useState<boolean>(false);
    const { symbol, address, tokenInfo, priceUsd, logo, wallet, amount } = useAppSelector(state => {
        return {
            symbol: state.deposit[index].symbol,
            address: state.deposit[index].address,
            priceUsd: state.deposit[index].priceUsd,
            tokenInfo: state.wallet.tokens.find(t => t.tokenInfo.address === state.deposit[index].address),
            wallet: state.wallet.tokens,
            logo: state.deposit[index].logo,
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
        </>
    )
}

export default DepositToken;