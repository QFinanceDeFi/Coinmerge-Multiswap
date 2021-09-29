import React from "react";
import { getTokenInfo, updateDecimals, updateDepositAmount, updateItem, updateSlippage } from "../../state/tokens/tokens";
import { cleanString } from "../../data/utils";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import useDecimals from "../../hooks/useDecimals";
import Modal from "../Modal/Modal";
import Search from "../Search/Search";
import Slider from "../Slider/Slider";
import "./token.css";
import { getWalletData } from "../../state/wallet/wallet";
import { approveContract } from "../../state/tx/tx";

interface ITokenProps {
    index: number;
    deposit: boolean;
}

const Token: React.FC<ITokenProps> = ({ index, deposit = false }) => {
    const [percent, setPercent] = React.useState<number>(0);
    const [slippageInput, setSlippageInput] = React.useState<number>(0);
    const [input, setInput] = React.useState<string>('');
    const { name, symbol, address, priceUsd, logo, tokenInfo, slippage, amount, wallet } = useAppSelector(state => {
        return {
            name: state.tokens[index].name,
            symbol: state.tokens[index].symbol,
            address: state.tokens[index].address,
            priceUsd: state.tokens[index].priceUsd,
            tokenInfo: state.wallet.tokens.find(t => t.tokenInfo.address === state.tokens[index].address),
            logo: state.tokens[index].logo,
            slippage: state.tokens[index].slippage,
            amount: deposit ? state.swap.depositAmount : state.swap.outputs[index]?.amount ?? '0',
            wallet: state.wallet
        }
    });
    const decimals = useDecimals(address);
    const [modal, setModal] = React.useState<boolean>(false);
    const [slippageModal, setSlippageModal] = React.useState<boolean>(false);
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(updateItem({
            name,
            symbol,
            address,
            percent,
            priceUsd,
            slippage,
            decimals,
            logo,
            index
        }))
    }, [name, symbol, address, priceUsd, logo, tokenInfo, slippage, amount, index, percent, dispatch, decimals])

    React.useEffect(() => {
        dispatch(updateDecimals({address, decimals}));
    }, [decimals, address, dispatch]);

    React.useEffect(() => {
        async function get() {
            dispatch(await getTokenInfo({token: address, index}));
        }
        if (address !== '') {
            Promise.resolve(async () => await get ());
        }
    }, [address, index, dispatch]);

    React.useEffect(() => {
        dispatch(updateSlippage({slippage: slippageInput, index}));
    }, [slippageInput, index, dispatch]);

    React.useEffect(() => {
        dispatch(updateDepositAmount({index, depositAmount: input}))
    }, [input, dispatch, index]);

    async function update(newName: string, newSymbol: string, newAddress: string) {
        setModal(false);
        dispatch(updateItem({
            name: newName,
            symbol: newSymbol,
            address: newAddress,
            priceUsd,
            logo,
            percent,
            slippage,
            index
        }));
        dispatch(await getTokenInfo({index, token: newAddress}))
    };

    async function approve() {
        try {
            dispatch(await approveContract({token: address, amount: input}));
            dispatch(await getWalletData());            
        }
        catch (e) {
            console.log(e);

            await dispatch(getWalletData());
        }
    }

    function isApproved() {
        return deposit ? Number(cleanString(wallet.tokens.find((tok: any) => tok.tokenInfo.address === address)?.allowance ?? '0', decimals)) >= Number(input) : true;
    }

    return (
        <>
        <div className="token">
            <div className="token-content">
                <div className="token-details">
                    <div className={`token-icon ${symbol === '' && 'token-icon-empty'}`} onClick={() => setModal(true)}>
                        {logo !== '' && <img src={logo} width="24px" alt="token logo" />}
                        <span style={{fontWeight: 600}}>{symbol !== '' ? symbol.toUpperCase() : 'Select Token'}</span>
                    </div>
                </div>
                <div className="token-amount">
                    <span onClick={() => deposit && setInput(cleanString((tokenInfo?.rawBalance ?? '0'), decimals))}>
                        {`Balance: ${Number(Number(cleanString((tokenInfo?.rawBalance ?? '0'), decimals)).toFixed(4)).toLocaleString()} ${symbol && symbol.toUpperCase()}`}
                    </span>
                    <input className="token-input"
                        value={deposit ? input : Number(Number(cleanString(amount, decimals)).toFixed(5)).toLocaleString()}
                        disabled={!deposit} onChange={(e: any) => setInput(e.target.value)} />
                    <span>{`~$${(Number(Number(deposit ? input : cleanString(amount, decimals)) * Number(priceUsd)).toFixed(2)).toLocaleString()} USD`}</span>
                </div>
            </div>
            <div className="token-slippage" onClick={() => setSlippageModal(true)}>
                {`Slippage: ${slippage === 0 ? `Auto` : `${slippage}%`}`}
            </div>
            <div className="token-warning">
                {address !== '' && <span>Validate {symbol.toUpperCase()}: <a href={`https://etherscan.io/token/${address}`} target="_blank noreferrer">
                    {address}
                </a></span>}
            </div>
            {!deposit &&
            <div className="token-slider">
                <Slider value={percent} update={(val: number) => setPercent(val)} />
                <div className="slider-actions">
                    <button className="slider-button" onClick={() => setPercent(25)}>25%</button>
                    <button className="slider-button" onClick={() => setPercent(50)}>50%</button>
                    <button className="slider-button" onClick={() => setPercent(75)}>75%</button>
                    <button className="slider-button" onClick={() => setPercent(100)}>100%</button>
                </div>
            </div>}
        </div>
        {deposit && !isApproved() &&
            <button className="submit-button" style={{width: '100%'}} onClick={async () => await approve()}
                disabled={Number(input) === 0 || Number(input) > Number(cleanString(tokenInfo?.rawBalance ?? '0', tokenInfo?.tokenInfo.decimals ?? 18))}>
                {`Approve ${symbol.toUpperCase()}`}
            </button>
        }
        {modal &&
            <Modal open={modal} close={() => setModal(false)}>
                <h3 style={{margin: '4px 0', fontWeight: 500}}>Select Token</h3>
                <Search update={update} eth={false} />
            </Modal>
        }
        {slippageModal &&
            <Modal open={slippageModal} close={() => setSlippageModal(false)}>
                <h3 style={{margin: '4px 0', fontWeight: 500}}>Custom Slippage</h3>
                <span style={{fontSize: '14px', marginTop: '8px'}}>
                    Warning: Increasing the slippage means you are willing to take less than the originally quoted amount on your swap.
                    Too high a slippage value allows bots to front-run you, causing your swap to be at a higher price. If you
                    are not sure if you need this, try completing the swap with 'Auto' slippage. If that fails, then you should slowly
                    increase slippage value until the transaction is accepted.
                </span>
                <div className="token-slippage-input-container">
                    <button onClick={() => setSlippageInput(0)} className="token-slippage-input-button">
                        Auto
                    </button>
                    <input className="token-slippage-input" placeholder="0" type="number" min={0} max={100}
                        onChange={(e: any) => setSlippageInput(e.target.value)} value={slippageInput} />
                </div>
                <div className="token-slippage-confirm">
                    <button onClick={() => setSlippageModal(false)} className="token-slippage-confirm-button">
                        Confirm
                    </button>
                </div>
            </Modal>
        }
        </>
    )
}

export default Token;