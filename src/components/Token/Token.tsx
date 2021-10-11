import React from "react";
import { getTokenBalance, getTokenInfo, updateDepositAmount, updateItem, updateSlippage } from "../../state/tokens/tokens";
import { checkIsBase, cleanString, toBaseUnit } from "../../data/utils";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import useDecimals from "../../hooks/useDecimals";
import Modal from "../Modal/Modal";
import Search from "../Search/Search";
import Slider from "../Slider/Slider";
import "./token.css";
import { approveContract } from "../../state/tx/tx";
import useToken from "../../hooks/useToken";
import { SWAP_ADDRESS, web3 } from "../../data/base";
import BN from "bn.js";
import { NetworkExplorers } from "../../data/networks";

const erc20 = require('../../data/IERC20.json');

interface ITokenProps {
    index: number;
    deposit: boolean;
}

const Token: React.FC<ITokenProps> = ({ index, deposit = false }) => {
    const [percent, setPercent] = React.useState<number>(0);
    const [slippageInput, setSlippageInput] = React.useState<number>(0);
    const [input, setInput] = React.useState<string>('0');
    const [enabled, setEnabled] = React.useState<boolean>(false);
    const { account, name, symbol, address, priceUsd, logo, slippage, amount, chain } = useAppSelector(state => {
        return {
            account: state.connect.address,
            name: state.tokens[index].name,
            symbol: state.tokens[index].symbol,
            address: state.tokens[index].address,
            priceUsd: state.tokens[index].priceUsd,
            logo: state.tokens[index].logo,
            slippage: state.tokens[index].slippage,
            amount: deposit ? state.swap.depositAmount : state.swap.outputs[index]?.amount ?? '0',
            chain: state.connect.chainId
        }
    });
    const { state } = useToken(address, SWAP_ADDRESS);
    const decimals = useDecimals(address);

    const [modal, setModal] = React.useState<boolean>(false);
    const [slippageModal, setSlippageModal] = React.useState<boolean>(false);

    const dispatch = useAppDispatch();

    const isApproved = React.useCallback(async () => {
        if (account !== '') {
            const token: any = new web3.eth.Contract(erc20, address);
            const allowance: string = await token.methods.allowance(account, SWAP_ADDRESS).call().catch(() => '0');
            const decimals: number = await token.methods.decimals().call().catch(() => 18);
            
            return web3.utils.toBN(allowance) >= toBaseUnit(amount, decimals, BN);            
        } else {
            return false;
        }
    }, [account, address, amount]);

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
    }, [name, symbol, address, priceUsd, logo, slippage, amount, index, percent, dispatch, decimals])

    React.useEffect(() => {
        async function get() {
            dispatch(await getTokenInfo({token: address, index}));
            dispatch(await getTokenBalance({token: address, index}));
        }
        if (address !== '') {
            Promise.resolve(get());
        }
    }, [address, index, dispatch]);

    React.useEffect(() => {
        dispatch(updateSlippage({slippage: slippageInput, index}));
    }, [slippageInput, index, dispatch]);

    React.useEffect(() => {
        dispatch(updateDepositAmount({index, depositAmount: input}))
    }, [input, dispatch, index]);

    React.useEffect(() => {
        if (address !== '' && Number(amount) > 0) {
            setTimeout(async () => {
                setEnabled(await isApproved());
            }, 1000);
        }
    }, [address, amount, isApproved]);

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
            dispatch(await approveContract({token: address, amount: input})).then(async () => {
                setEnabled(await isApproved());
            });     
        }
        catch (e) {
            console.log(e);
        }
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
                    <span onClick={() => deposit && setInput(cleanString(state.balance, decimals))}>
                        {`Balance: ${Number(Number(cleanString(state.balance, decimals)).toFixed(4)).toLocaleString()} ${symbol && symbol.toUpperCase()}`}
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
                {address !== '' && !checkIsBase(address) && <span>Validate {symbol.toUpperCase()}: <a href={`${NetworkExplorers[Number(chain)]}/token/${address}`} target="_blank noreferrer">
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
        {deposit && !enabled &&
            <button className="submit-button" style={{width: '100%'}} onClick={async () => await approve()}
                disabled={Number(input) === 0 || Number(input) > Number(cleanString(state.balance, decimals))}>
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