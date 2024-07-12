import { MdOutlineCancel } from "react-icons/md";
import { useState, useCallback } from 'react';
const TokenList = ({creatingExchange, setIsTokenShowing, fromNetwork, toNetwork, setFromCurrency, setToCurrency, modalTo, currencies, networks}) => {

    const [hoverCell, setHover] = useState(null);
    const [search, setSearch] = useState('');

    const cellEnter = useCallback((id) => {
        setHover(id);
    }, []);
    const cellLeave = useCallback(() => {
        setHover(null);
    }, []);

    const chunkArray = (array, size) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }
    
    return(
    <div id="modal" className="bg-black/80 w-[100%] absolute h-[100%] z-[9999999999]" style={{ position: 'fixed', paddingBottom: '72px', display: 'flex', justifyContent: 'center', alignContent: 'center', justifyItems: 'center', alignItems: 'center'}}>
        <div style={{ position: 'fixed', margin: 'auto' }} className="w-[96%] lg:w-[30%] h-auto py-3 px-3 drop-shadow-glow ml-auto mr-auto text-white  mt-[230px] bg-black/80 rounded-3xl flex flex-col  pt-5 mb-20 ">
            <div className=" w-[95%] ml-auto flex mr-auto h-12 mb-4 py-4 px-4">
            <p className="text-xl ml-0 mr-auto">{modalTo ? 'Receive' : 'Send'} Token <span style={{ paddingLeft: '4px'}}>- <em>{(modalTo ? toNetwork : fromNetwork).toUpperCase()} ⛓️</em></span></p>
                <div className="text-xl mr-0 ml-auto">
                <div onClick={() => {
                  setIsTokenShowing(false)
                  
                }
                  } className='w-8 h-8 py-1.5 px-1 hover:bg-green-400/60 cursor-pointer rounded-lg bg-green-400/30'>
                <MdOutlineCancel className='ml-auto mr-auto' />
                </div>
                </div>
            </div>
            <div className="w-[100%] h-14 ml-auto mr-auto" style={{ display: 'flex', alignContent: 'center', alignItems: 'center', alignSelf: 'center', justifyContent: 'center', justifyItems: 'center', justifySelf: 'center'}}>
              <input autoFocus={true} id='tokenSearch' spellCheck="false" autoCapitalize="off" autoComplete="off" autoCorrect="off" aria-autocomplete="none" onChange={(e) => setSearch(e.target.value.toUpperCase())} value={search.toUpperCase()} placeholder="Search" style={{ border: '2px solid #007910', borderRadius: '12px', backgroundColor: '#000', color: 'white', opacity: '0.8', width: '90%', height: '40px', cursor: 'text' }} type="text" className="font-extralight outline-none  rounded-xl py-1 px-4 bg-transparent/10 w-20 text-sm"/>
            </div>
            <div className="w-[95%] ml-auto mr-auto h-auto  mb-4 py-4 px-4" style={{ height: '40vh', textAlign: '-webkit-center', overflowY: 'scroll' }}>
                {
                    chunkArray(currencies.get(networks.get(modalTo ? toNetwork : fromNetwork).toLowerCase()).filter((c) => c.toLowerCase().includes(search.toLowerCase().trim())),3).map((row, rowIndex) => (
                        <div key={`tokenRow-${rowIndex}`} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center', justifyItems: 'center', justifySelf: 'center'}}>
                        {row.map((currency, index) => (
                            <div key={`${modalTo ? toNetwork : fromNetwork}-${currency}`} className="w-[100%] h-14 ml-auto mr-auto"
                                onClick={() => {
                                if (!creatingExchange) {
                                if (modalTo) {
                                    setToCurrency(currency);
                                } else {
                                    setFromCurrency(currency);
                                }
                                }
                                setIsTokenShowing(false)
                                } } onMouseEnter={() => cellEnter(index + (rowIndex * 3))} onMouseLeave={() => cellLeave()} style={{ cursor: 'pointer', width: '100%', textAlign: 'center', margin: '6px', padding: '8px', fontSize: '18px', height: '48px', justifyContent: 'center', alignContent: 'center', alignItems: 'center', justifyItems: 'center', fontWeight: '800', backgroundColor: hoverCell === index + (rowIndex * 3) ? '#007910' : 'black', border: '2px solid #007910', borderRadius: '16px' }}>
                                {`$${currency.toUpperCase()}`}
                            </div>
                        ))}
                    </div>
                    ))
                }
            </div>
        </div>
    </div>
    )
}
export default TokenList;