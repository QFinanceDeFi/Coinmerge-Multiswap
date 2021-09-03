const tokenList = require('./tokenList.json');

interface ITokenOutput {
    name: string;
    symbol: string;
    address: string;
}

export const searchToken = async (symbol: string): Promise<ITokenOutput[] | Promise<void>> => {
    const getTokens = async () => {
        if (symbol.startsWith('0x')) {
            const coin = await fetch(`https://api.ethplorer.io/getTokenInfo/${symbol}?apiKey=freekey`).then((res: any) => {
                if (!res.ok) {
                    return [];
                }
                const data = res.json().then((r:any) => { return {
                    name: r.name,
                    symbol: r.symbol,
                    address: r.address
                }});

                return data;
            })
            return coin ? [coin] : [];
        } else {
            const coins = await tokenList.filter((c: any) => c.symbol.startsWith(symbol.toLowerCase())).filter((c: any) => c.platforms.ethereum && c.platforms.ethereum !== '');
            
            await coins.map(async (item: any) => {
                item.logo = '';
                item.address = item.platforms.ethereum;
                const { logo } = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${item.address}`).then((res: any) =>
                    res.json().then((data: any) => {
                        return {logo: data.image.small}
                    }))
                item.logo = logo;
            })

            return coins;
        }
    }

    const coins = await getTokens();
    
    return coins;

}