import React from "react";
import { ExternalLink } from "react-feather";
import { searchToken } from "../../data/findToken";
import "./search.css";

interface ISearchProps {
    update: Function;
}

const Search: React.FC<ISearchProps> = ({ update }) => {
    const [input, setInput] = React.useState<string>('');
    const [loading, setLoading] = React.useState<boolean>(false);
    const [options, setOptions] = React.useState<any>([]);

    React.useEffect(() => {
        if (input !== '' && input.length > 2) {
            setLoading(true);
            setTimeout(async () => {
            await searchToken(input).then((res: any) => {
                setOptions(res);
                setLoading(false);
                }).catch((e: Error) => {
                    console.log(e.message);
                    setLoading(false);
                });
            }, 500);
        }
    }, [input]);

    return (
        <div className="search">
            <input className="search-input" onChange={(e: any) => setInput(e.target.value)} placeholder="Search symbol or address" value={input} autoFocus />
            {input !== '' &&
            <div className="token-list">
                {loading && <span>LOADING</span>}
                {options.length > 0 && !loading &&
                    options.map((item: any) => (
                        <div className="token-list-item" key={item.address} onClick={() => { update(item.name, item.symbol, item.address) }}>
                            <div className="token-list-item-brand">
                                {item.logo && <img src={item.logo} width="24px" alt="token logo" />}
                                <div className="token-list-item-name">
                                    <span>{`${item.name} (${item.symbol?.toUpperCase()})`}</span>
                                </div>
                            </div>
                            <div className="token-list-item-link">
                                <a href={`https://etherscan.io/token/${item.address}`} target="_blank noreferrer"><ExternalLink size="24" /></a>
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