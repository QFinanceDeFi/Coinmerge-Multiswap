import React from "react";
import { ExternalLink } from "react-feather";
import { NetworkExplorers } from "../../data/networks";
import { searchToken } from "../../data/searchToken";
import { useAppSelector } from "../../hooks/hooks";
import { RootState } from "../../store";
import "./search.css";

interface ISearchProps {
    update: Function;
    eth: boolean;
}

const Search: React.FC<ISearchProps> = ({ update, eth }) => {
    const [input, setInput] = React.useState<string>('');
    const [loading, setLoading] = React.useState<boolean>(false);
    const [options, setOptions] = React.useState<any>([]);

    const chain: number = useAppSelector((state: RootState) => state.connect.chainId);

    React.useEffect(() => {
        setTimeout(() => {
            if (input !== '' && input.length > 1) {
                setLoading(true);
                setTimeout(async () => {
                await searchToken(input, eth).then((res: any) => {
                    setOptions(res);
                    setLoading(false);
                    }).catch((e: Error) => {
                        console.log(e.message);
                        setLoading(false);
                    });
                }, 1250);
            }
        });
    }, [input, eth]);

    return (
        <div className="search">
            <input className="search-input" onChange={(e: any) => setInput(e.target.value)} placeholder="Search symbol or address" value={input} autoFocus />
            {input !== '' &&
            <div className="token-list">
                {loading && <span>LOADING</span>}
                {options.length > 0 && !loading &&
                    options.map((item: any) => (
                        <div className="token-list-item" key={item.address} onClick={() => { update(item.name, item.symbol, item.address, item.logo) }}>
                            <div className="token-list-item-brand">
                                {item.logo && <img src={item.logo} width="24px" alt="token logo" />}
                                <div className="token-list-item-name">
                                    <span>{`${item.name} (${item.symbol?.toUpperCase()})`}</span>
                                </div>
                            </div>
                            <div className="token-list-item-link">
                                <a href={`${NetworkExplorers[Number(chain)]}/token/${item.address}`} target="_blank noreferrer"><ExternalLink size="24" /></a>
                            </div>
                        </div>
                    ))
                }
            </div>
            }
        </div>
    )
}

export default Search;