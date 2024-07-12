const TokenSelect = ({creatingExchange, setIsTokenShowing, minAmount, maxAmount, fetchingOuput, fromCurrency, toCurrency, setAmount, fromAmount, toAmount, fromNetwork, toNetwork, setModalTo, modalTo}) => { 
  
  return (
    <div>
      <div aria-disabled={(fromNetwork === '' && !modalTo) || (toNetwork === '' && modalTo)} disabled={(fromNetwork === '' && !modalTo) || (toNetwork === '' && modalTo)} style={{ display: 'flex', gap: '12px', cursor: (fromNetwork === '' && !modalTo) || (toNetwork === '' && modalTo) ? 'not-allowed' : 'pointer' }} className="bg-green-400/30 flex border border-gray-300 text-gray-900 text-sm outline-none rounded-lg h-12  focus:ring-green-500 focus:border-green-500 w-[98%] p-2.5 dark:bg-green-400/30 dark:border-green-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        <div  onClick={() => {
          if (creatingExchange) return;
          if ((fromNetwork === '' && !modalTo) || (toNetwork === '' && modalTo)) return;
          setModalTo(modalTo);
          setIsTokenShowing(true)
        }} className="flex py-1 px-1 ml-3 mr-auto" style={{ marginLeft: '0', width: '100%'}}>
          <div className=" flex">
            {/* <img className="ml-1 mr-2" src={selectedTokenLogo} /> */}
            <p className="ml-1 mr-1" style={(modalTo ? toCurrency : fromCurrency) !== '' ?{ fontWeight: 'bold'} : {}} >{(modalTo ? toCurrency : fromCurrency) !== '' ? `$${(modalTo ? toCurrency : fromCurrency).toUpperCase()}` : 'Select Token'}</p>
          </div>
          <img alt='' src="/icons/chevron-down.svg" />
        </div>
        <div className="mr-1 ml-auto py-0.1 px-1" style={{ textAlign: 'center'}}>
          { modalTo && fetchingOuput ?
            <div className="w-6 h-6 ml-auto mr-auto">
              <img alt='' src="/icons/infinite_white.gif" />
            </div>
            :
            <input pattern="[0-9]+" min={0} spellCheck="false" autoCapitalize="off" autoComplete="off" autoCorrect="off" aria-autocomplete="none" id={`input-${modalTo ? 'to' : 'from'}`} onChange={(e) => modalTo ? false : setAmount(String(e.target.value).charAt(0) === "0" ? String(e.target.value).slice(1) : String(e.target.value), modalTo)} value={modalTo ? toAmount === 0 ? '' : parseFloat(toAmount).toLocaleString('en-US', { maximumFractionDigits: 3}) : String(fromAmount).charAt(0) === "0" ? String(fromAmount).slice(1) : fromAmount} style={{ width: '100%', cursor: ((fromNetwork === '' || fromCurrency === '') && !modalTo) || (modalTo) ? 'not-allowed' : 'text' }} aria-disabled={((fromNetwork === '' || fromCurrency === '') && !modalTo) || (modalTo)} disabled={((fromNetwork === '' || fromCurrency === '') && !modalTo) || (modalTo)} type={modalTo ? "text" : "number"} className="font-extralight outline-none  rounded-xl py-1 px-4 bg-transparent/10 w-20 text-sm"/>
          }
        </div>
      </div>
      {!modalTo && minAmount > 0 && 
          <div style={{ flexDirection: 'row', display: 'flex', marginLeft: '8px', marginTop: '10px', gap: '28px' }}>
            <p>Min: {minAmount}</p>
            <p>Max: {maxAmount > -1 ? maxAmount : '∞'}</p>
          </div>
        }
    </div>
  );
};

export default TokenSelect;