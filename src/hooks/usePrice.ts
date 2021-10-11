import React from "react";
import { web3 } from "../data/base";
import { Networks } from "../data/networks";
import { checkIsBase } from "../data/utils";

const usePrice = (address: string) => {
    const [priceUsd, setPriceUsd] = React.useState<number>(0.00);
    const [status, setStatus] = React.useState<'standby' | 'succeeded' | 'failed' | 'pending'>('standby');

    React.useEffect(() => {
        async function getPrice() {
            setStatus('pending');
            if (address !== '' && !checkIsBase(address)) {
                const chainId: number = await web3.eth.getChainId();
                if (Networks[Number(chainId)] !== undefined) {
                    const url: string = `https://api.coingecko.com/api/v3/coins/${JSON.parse(Networks[Number(chainId)]).id.toLowerCase()}/contract/${address}`;
                    const { priceUsd, logo } = await fetch(url)
                        .then((res: any) => res.json()).then((json: any) => {
                            setPriceUsd(json.market_data.current_price.usd ?? 0);
                            return {
                                priceUsd: json.market_data.current_price.usd ?? 0,
                                logo: json.image.small
                            }
                    }).catch((e: any) => {
                        console.log(e);
                        setPriceUsd(0);
                        return {
                            priceUsd: 0,
                            logo: ''
                        }
                    });

                    return { priceUsd, logo };
                }
            }
        }

        Promise.resolve(getPrice()).then(() => {
            setStatus('succeeded');
        }).catch(() => {
            setStatus('failed');
        });
    }, [address]);

    return { priceUsd, status };
}

export default usePrice;