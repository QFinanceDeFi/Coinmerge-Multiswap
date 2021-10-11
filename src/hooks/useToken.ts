import React from "react";
import { web3 } from "../data/base";
import { checkIsBase } from "../data/utils";
import { useAppSelector } from "./hooks";

const abi = require('../data/IERC20.json');

interface ITokenState {
    balance: string;
    allowance: string;
}

const useToken = (address: string, spender = '') => {
    const [state, setState] = React.useState<ITokenState>({
        balance: '0',
        allowance: '0'
    });
    const [status, setStatus] = React.useState<'pending' | 'standby' | 'succeeded' | 'failed'>('standby');
    const account: string = useAppSelector(state => state.connect.address);

    const getTokenDetails = React.useCallback(async () => {
            try {
                if (account !== '' && !checkIsBase(address) && address !== '') {
                    setStatus('pending');
                    const token: any = new web3.eth.Contract(abi, address);
                    const balance: string = await token.methods.balanceOf(account).call().catch(() => '0');
                    let allowance: string = '0';
                    if (allowance !== '') {
                        allowance = await token.methods.allowance(address, spender).call().catch(() => '0');
                    }
                    return { balance, allowance };                    
                }
                else {
                    return { balance: '0', allowance: '0' };
                }
            }
            catch (e) {
                console.log(e);
                return { balance: '0', allowance: '0' };
            }        
    }, [account, address, spender]);

    React.useEffect(() => {
        Promise.resolve(getTokenDetails().then(
            (res: any) => {
                setState({
                    balance: res.balance,
                    allowance: res.allowance
                });
                setStatus('succeeded');
            }).catch((e: any) => {
                console.log(e);
                setState({
                    balance: '0',
                    allowance: '0'
                });
                setStatus('failed');
            }));
    }, [getTokenDetails, address, account])

    return { state, status };
}

export default useToken;