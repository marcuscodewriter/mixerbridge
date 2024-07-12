import { MdOutlineCancel } from "react-icons/md";
import { useState, useCallback } from 'react';

const ChainList = ({creatingExchange, modalTo, setIsModalShowing, setToNetwork, setFromNetwork, networks}) => {
    // const { chains } = useNetwork()

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
    <div id="modal" className="bg-black/80 w-[100%] mt-[0px] absolute h-[100%] z-[9999999999]" style={{ position: 'fixed', paddingBottom: '72px', display: 'flex', justifyContent: 'center', alignContent: 'center', justifyItems: 'center', alignItems: 'center'}}>
        <div style={{ position: 'fixed', margin: 'auto' }} className="w-[94%] lg:w-[30%] h-auto py-3 px-3 drop-shadow-glow ml-auto mr-auto text-white  mt-[230px] bg-black/80 rounded-3xl flex flex-col  pt-5 mb-20 ">
            <div className=" w-[95%] ml-auto mr-auto flex h-12 mb-4 py-4 px-4">
                <p className="text-xl ml-0 mr-auto">Select {modalTo ? 'Destination' : 'Origin'} Chain</p>
                <div className="text-xl mr-0 ml-auto">
                <div onClick={() => setIsModalShowing(false)} className='w-8 h-8 py-1.5 px-1 cursor-pointer hover:bg-green-400/60 cursor-pointer rounded-lg bg-green-400/30'>
                <MdOutlineCancel className='ml-auto mr-auto' />
                </div>
                </div>
            </div>
            <div className="w-[100%] h-14 ml-auto mr-auto" style={{ display: 'flex', alignContent: 'center', alignItems: 'center', alignSelf: 'center', justifyContent: 'center', justifyItems: 'center', justifySelf: 'center'}}>
              <input spellCheck="false" autoCapitalize="off" autoComplete="off" autoCorrect="off" aria-autocomplete="none" autoFocus={true} id='networkSearch' onChange={(e) => setSearch(e.target.value.toUpperCase())} value={search.toUpperCase()} placeholder="Search" style={{ border: '2px solid #007910', borderRadius: '12px', backgroundColor: '#000', color: 'white', width: '90%', height: '40px', cursor: 'text' }} type="text" className="font-extralight outline-none  rounded-xl py-1 px-4 bg-transparent/10 w-20 text-sm"/>
            </div>
            <div className="w-[95%] ml-auto mr-auto h-auto  mb-4 py-4 px-4" style={{ height: '40vh', textAlign: '-webkit-center', overflowY: 'scroll' }}>
                {chunkArray(Array.from(networks.keys()).filter((c) => c.toLowerCase().includes(search.toLowerCase().trim())),3).map((row, rowIndex) => (
                  <div key={`chainRow-${rowIndex}`} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center', justifyItems: 'center', justifySelf: 'center'}}>
                    {row.map((chain, index) => (
                      <div key={chain} onClick={() => {
                        if (!creatingExchange) {
                          if (modalTo) {
                            setToNetwork(chain);
                          } else {
                            setFromNetwork(chain);
                          }
                        }
                        setIsModalShowing(false);
                      }} onMouseEnter={() => cellEnter(index + (rowIndex * 3))} onMouseLeave={() => cellLeave()} style={{ cursor: 'pointer', width: '100%', textAlign: 'center', margin: '6px', padding: '8px', fontSize: '18px', height: '48px', justifyContent: 'center', alignContent: 'center', alignItems: 'center', justifyItems: 'center', fontWeight: '800', backgroundColor: hoverCell === index + (rowIndex * 3) ? '#007910' : 'black', border: '2px solid #007910', borderRadius: '30px' }}>
                        {chain.toUpperCase()}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
        </div>
    </div>
    )
}
export default ChainList;