import React from "react";
import { Check, X } from "react-feather";
import ClipLoader from "react-spinners/ClipLoader";
import "./transaction.css";

interface ITransactionProps {
    status: 'pending' | 'standby' | 'error' | 'success';
    message: string;
    hash: string;
    update: Function;
}

const Transaction: React.FC<ITransactionProps> = ({ status, message, hash, update }) => {
    return (
        <div className="pending-tx">
            <div className="pending-tx-status">
                {status === 'pending' && <ClipLoader color="silver" loading={status === 'pending'} size={24} />}
                {status === 'success' && <Check color="green" size={24} />}
                {status === 'error' && <X color="red" size={24} />}
            </div>
            <div className="pending-tx-hash">
                {status !== 'error' && status !== 'standby' &&
                    <a href={`https://etherscan.io/tx/${hash}`} target="_blank noreferrer" className="pending-tx-hash-a">
                        {hash}
                    </a>
                }
                {status === 'error' &&
                    <span>{message}</span>
                }
            </div>
            <div className="pending-tx-close">
                <X color="silver" size={12} onClick={() => update()} />
            </div>
        </div>
    )
}

export default Transaction;