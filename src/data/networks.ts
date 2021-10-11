// export const networks = {
//     1: {
//         name: 'Ethereum',
//         id: 'ethereum'
//     },
//     56: {
//         name: 'BSC',
//         id: 'binance-smart-chain'
//     },
//     137: {
//         name: 'Polygon',
//         id: 'polygon-pos'
//     },
//     43114: {
//         name: 'Avalanche',
//         id: 'avalanche'
//     }
// }

export enum Networks {
    '{"name": "Unsupported"}' = 0,
    '{"name": "Ethereum", "id": "ethereum", "cmaddr": "0x1190074795dad0e61b61270de48e108427f8f817"}' = 1,
    '{"name": "BSC", "id": "binance-smart-chain", "cmaddr": "0x8d3e3a57c5f140b5f9feb0d43d37a347ee01c851"}' = 56,
    '{"name": "Polygon", "id": "polygon-pos", "cmaddr": "0x9649B0EF94b312341378343E87572592F584E756"}' = 137,
    '{"name": "Avalanche", "id": "avalanche", "cmaddr": "0x9649B0EF94b312341378343E87572592F584E756"}' = 43114
}

export enum NetworkImages {
    'https://upload.wikimedia.org/wikipedia/commons/6/6f/Ethereum-icon-purple.svg' = 1,
    'https://upload.wikimedia.org/wikipedia/commons/5/57/Binance_Logo.png' = 56,
    'https://research.binance.com/static/images/projects/matic-network/logo.png' = 137,
    'https://cryptologos.cc/logos/avalanche-avax-logo.png?v=014' = 43114
}

export enum NetworkSymbols {
    "ETH" = 1,
    "BNB" = 56,
    "MATIC" = 137,
    "AVAX" = 43114
}

export enum NetworkExplorers {
    "https://etherscan.io" = 1,
    "https://bscscan.com" = 56,
    "https://polygonscan.com" = 137,
    "https://avascan.info/blockchain/c" = 43114
}