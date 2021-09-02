import React from "react";
import { addDepositItem, removeDepositItem } from "../actions/depositSlice";
import { getBalances } from "../actions/walletSlice";
import Controls from "../components/Controls/Controls";
import TokenControls from "../components/Controls/TokenControls";
import DepositToken from "../components/Deposit/DepositToken";
import { approveContract } from "../data/transactions";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";

const Liquidate: React.FC = () => {
    const [state, setState] = React.useState<any>({
        status: 'standby',
        message: '',
        hash: ''
    })
    const { deposit, wallet } = useAppSelector(state => { 
        return {
            deposit: state.deposit,
            wallet: state.wallet.tokens
        }
    });
    const dispatch = useAppDispatch();

    function add() {
        dispatch(addDepositItem());
    }

    function remove() {
        dispatch(removeDepositItem(-1));
    }

    function isApproved(index: number, depositAmount: string): boolean {
        return Number(wallet.find(t => t.tokenInfo.address === deposit[index].address)?.allowance ?? '0') > Number(depositAmount) ?? false
    }

    async function approve(address: string, depositAmount: string) {
        setState({
            status: 'pending',
            message: 'Pending',
            hash: ''
        });
        const txHash = await approveContract(deposit[0].address, depositAmount).then((res: any) => {
            console.log(res);

            return res.transactionHash
        }).catch((e: any) => {
            console.log(e);
            setState({
                status: 'error',
                message: 'Swap failed',
                hash: ''
            });
        });

        setState({
            status: 'success',
            hash: txHash,
            message: 'Success'
        })

        await dispatch(getBalances(address));

    }

    return (
        <div className="liquidate" style={{width: '100%'}}>
            <h1 className="eth-deposit_h1">Swap Tokens</h1>
            <TokenControls remove={remove} add={add} length={deposit.length} />
            {deposit.map((item: any, index: number) => (
                <div style={{display: 'inline'}}>
                <DepositToken key={index} index={index} multi={true} />
                {!isApproved(index, item.depositAmount) &&
                <button className={`token-approve-button ${isApproved(index, item.depositAmount) && `token-approved`}`}
                    onClick={() => isApproved(index, item.depositAmount) ? console.log('tx') : approve(item.address, item.depositAmount)}
                    disabled={item.address === '' || Number(item.depositAmount) === 0 || isApproved(index, item.depositAmount)}>
                        Approve
                </button>
                }
                </div>
            ))}
        </div>
    )
}

export default Liquidate;