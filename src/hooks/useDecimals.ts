import React from "react";
import { web3 } from "../data/base";
import { checkIsBase } from "../data/utils";

const abi = require('../data/IERC20.json');

const useDecimals = (address: string) => {
    const [decimals, setDecimals] = React.useState<number>(18);

    React.useEffect(() => {
        async function getDecimals() {
            if (!checkIsBase(address) && address !== '') {
                const erc = new web3.eth.Contract(abi, address);
                const decimals = await erc.methods.decimals()?.call().catch(() => { return 18 }) ?? 18;
                return decimals;  
            }
            else {
                return 18;
            }
        }
        if (!checkIsBase(address)) {
            getDecimals().then((res: number) => {
                setDecimals(res);
            }).catch((e: any) => {
                console.log(e);
            })            
        }

    }, [address])

    return decimals;
}

export default useDecimals;