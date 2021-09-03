import React from "react";
import { initWeb3 } from "../init";
const abi = require('../data/IERC20.json');

const useDecimals = (address: string) => {
    const [decimals, setDecimals] = React.useState<number>(0);

    React.useEffect(() => {
        async function getDecimals() {
            if (address !== '') {
                const web3 = initWeb3();
                const erc = new web3.eth.Contract(abi, address);
                const decimals = await erc.methods.decimals()?.call().catch((e: any) => { return 18 }) ?? 18;
                return decimals;                   
            }
        }

        getDecimals().then((res: number) => {
            setDecimals(res);
        }).catch((e: any) => {
            console.log(e);
        })

    }, [address])

    return decimals;
}

export default useDecimals;