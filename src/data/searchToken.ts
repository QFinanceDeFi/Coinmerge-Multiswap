import detectEthereumProvider from "@metamask/detect-provider";
import { web3 } from "./base";
import { NetworkImages, Networks } from "./networks";
import { checkIsBase } from "./utils";

const tokenList = require('./tokenList.json');
const erc20 = require('./IERC20.json');

interface ITokenOutput {
    name: string;
    symbol: string;
    address: string;
}

export const searchToken = async (symbol: string, eth = true): Promise<ITokenOutput[]> => {
    const provider: any = await detectEthereumProvider();
    let chain: string = 'ethereum';
    if (provider) {
        const network: {name: string, id: string} = JSON.parse(Networks[Number(provider.chainId)] ?? '{"name": "Ethereum", "id": "ethereum"}');
        chain = network.id;
    }
    const getTokens = async () => {
        if (symbol.startsWith('0x') && symbol.length > 32) {
            const token: any = new web3.eth.Contract(erc20, symbol);
            const name: string = await token.methods.name().call().catch(() => '');
            const ticker: string = await token.methods.symbol().call().catch(() => '');
            return [{
                name,
                symbol: ticker,
                address: symbol,
                logo: ''
            }];
        } else if (symbol.toLowerCase() === 'eth' && eth) {
            return [{
                name: 'Ethereum',
                symbol: 'ETH',
                address: 'ETH',
                logo: NetworkImages[1]
            }];
        } else if (symbol.toLowerCase() === 'bnb' && eth) {
            return [{
                name: 'Binance Coin',
                symbol: 'BNB',
                address: 'BNB',
                logo: NetworkImages[56]
            }]
        } else if (symbol.toLowerCase() ==='avax' && eth) {
            return [{
                name: 'Avalanche',
                symbol: 'AVAX',
                address: 'AVAX',
                logo: NetworkImages[43114]
            }]
        } else if (symbol.toLowerCase() === 'matic' && eth) {
            return [{
                name: 'Polygon',
                symbol: 'MATIC',
                address: 'MATIC',
                logo: NetworkImages[137]
            }]
        } else {
            const coins = await tokenList.filter((c: any) => c.symbol === symbol.toLowerCase()).filter((c: any) => c.platforms[`${chain}`] && c.platforms[`${chain}`] !== '');

            const tmp = coins.filter((c: any) => !checkIsBase(c.address));
            
            await tmp.map(async (item: any) => {
                if (!checkIsBase(item.address)) {
                    item.logo = '';
                    item.address = item.platforms[`${chain}`];
                    const { logo } = await fetch(`https://api.coingecko.com/api/v3/coins/${chain}/contract/${item.address}`).then((res: any) =>
                        res.json().then((data: any) => {
                            return {logo: data.image?.small ?? ''}
                        }))
                    item.logo = logo;                    
                }
            });

            return tmp;
        }
    }

    const coins = await getTokens();
    
    return coins;
}