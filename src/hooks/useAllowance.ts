import React from "react";
import { SWAP_ADDRESS, web3 } from "../data/base";

const abi = require('../data/IERC20.json');

const useAllowance = (token: string, owner: string) => {
    const [allowance, setAllowance] = React.useState<string>('0');

    React.useEffect(() => {
        async function getAllowance() {
            if (token !== '') {
                const erc = new web3.eth.Contract(abi, token);
                const allowance = await erc.methods.allowance(
                    owner,
                    SWAP_ADDRESS)?.call()
                    .catch(() => { return '0' }) ?? '0';
                
                return allowance;
            }
        }

        getAllowance().then((res: string) => {
            setAllowance(res);
        }).catch((e: any) => {
            console.log(e);
        });

    }, [token])

    return allowance;
}

export default useAllowance;