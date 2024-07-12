import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { initializeApp } from "firebase/app";
import { collection, addDoc, Timestamp, initializeFirestore, onSnapshot, doc } from "firebase/firestore";
import ChainList from "./components/ChainList";
import TokenList from "./components/TokenList";
import TokenSelect from "./components/TokenSelect";
import "./globals.css";
import "./App.css";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

const networks = new Map([
  ['TON', 'ton'],
  ['BTC', 'btc'],
  ['ETH', 'eth'],
  ['SOL', 'sol'],
  ['BASE', 'base'],
  ['BSC', 'bsc'],
  ['DOT', 'dot'],
  ['XMR', 'xmr'],
  ['XRP', 'xrp'],
  ['ADA', 'ada'],
  ['ALGO', 'algo'],
  ['APT', 'apt'],
  ['ARB', 'arbitrum'],
  ['ATOM', 'atom'],
  ['AVAX', 'cchain'],
  ['BCH', 'bch'],
  ['BSV', 'bsv'],
  ['CELO', 'celo'],
  ['ETC', 'etc'],
  ['ETHW', 'ethw'],
  ['FTM', 'ftm'],
  ['KAVA', 'kava'],
  ['LTC', 'ltc'],
  ['MATIC', 'matic'],
  ['NEAR', 'near'],
  ['OP', 'op'],
  ['PLS', 'pulse'],
  ['SEI', 'sei'],
  ['TIA', 'tia'],
  ['TRX', 'trx'],
  ['XEC', 'xec'],
  ['XLM', 'xlm'],
  ['XTZ', 'xtz'],
  ['ZEC', 'zec'],
  ['ZIL', 'zil'],
  ['ZKSYNC', 'zksync']
]);

function App() {
  const requestTimer = useRef(null);
  const [exchangeData, setExchangeData] = useState(null);
  const [creatingExchange, setCreatingExchange] = useState(false);
  const [isModalShowing, setIsModalShowing] = useState(false);
  const [isTokenShowing, setIsTokenShowing] = useState(false);
  const [fromNetwork, _setFromNetwork] = useState('');
  const [toNetwork, _setToNetwork] = useState('');
  const [fromCurrency, _setFromCurrency] = useState('');
  const [toCurrency, _setToCurrency] = useState('');
  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  const [fromAmount, setFromAmount] = useState(0);
  const [currencies, setCurrencies] = useState(new Map());
  const [modalTo, setModalTo] = useState(false);
  const [fetchingOuput, setFetchingOuput] = useState(false);
  const [recipientAddress, _setRecipientAddress] = useState('');
  const [error, setError] = useState("");

  const setFromNetwork = (network) => {
    if (network !== fromNetwork) {
      setAmount(0, false);
      setToAmount(0);
      setMinAmount(0);
      setMaxAmount(0);
      setFromCurrency('');
    }
    _setFromNetwork(network);
  }

  const setToNetwork = (network) => {
    if (network !== toNetwork) {
      setToAmount(0);
      setMinAmount(0);
      setMaxAmount(0);
      setToCurrency('');
    }
    _setToNetwork(network);
  }

  const setFromCurrency = async (currency) => {
    const difference = currency !== fromCurrency;
    _setFromCurrency(currency);
    if (toCurrency !== '' && currency !== '') {
      if (Number(fromAmount) > 0) setFetchingOuput(true);
      fetch(`https://api.changenow.io/v2/exchange/min-amount?fromCurrency=${currency}&toCurrency=${toCurrency}&fromNetwork=${networks.get(fromNetwork)}&toNetwork=${networks.get(toNetwork)}&flow=standard`, {
        headers: {
          [`x-changenow-api-key`]: '9e27b09a64a0a1251c512396f77b7d41484804d2bc80bcf16b3aff8894679e13'
        }
      }).then(async (res) => {
        const response = await res.json();
        const _minAmount = Number(response.minAmount);
        const _maxAmount = response.maxAmount ? Number(response.maxAmount) : -1;
        const nonZero = minAmount !== 0 && maxAmount !== 0;
        setMinAmount(_minAmount);
        setMaxAmount(_maxAmount);

        let currentFromAmount = (document.getElementById('input-from').value ? Number(document.getElementById('input-from').value) : 0);
        if (!((Number(currentFromAmount) > _maxAmount && _maxAmount > -1) || Number(currentFromAmount) < _minAmount)) {
          setFetchingOuput(true);
          setAmount(currentFromAmount, false, _minAmount, _maxAmount, currency, toCurrency);
        } else if (nonZero && currentFromAmount !== 0) {
          if (Number(currentFromAmount) > _maxAmount && _maxAmount > -1) {
            setError(`Amount must be less than ${_maxAmount} ${currency}`);
          } else if (Number(currentFromAmount) < _minAmount) {
            setError(`Amount must be greater than ${_minAmount} ${currency}`);
          };
          setFetchingOuput(false);
        }
      }).catch((error) => {
        console.error(error);
        if (difference) {
          setMinAmount(0);
          setMaxAmount(0);
          setToAmount(0);
        }
      });
    } else if (difference) {
      setMinAmount(0);
      setMaxAmount(0);
      setToAmount(0);
    }
  }

  const setToCurrency = async (currency) => {
    const difference = currency !== toCurrency;
    _setToCurrency(currency);

    if (fromCurrency !== '' && currency !== '') {
      if (Number(fromAmount) > 0) setFetchingOuput(true);
      fetch(`https://api.changenow.io/v2/exchange/min-amount?toCurrency=${currency}&fromCurrency=${fromCurrency}&fromNetwork=${networks.get(fromNetwork)}&toNetwork=${networks.get(toNetwork)}&flow=standard`, {
        headers: {
          [`x-changenow-api-key`]: '9e27b09a64a0a1251c512396f77b7d41484804d2bc80bcf16b3aff8894679e13'
        }
      }).then(async (res) => {
        const response = await res.json();
        const _minAmount = Number(response.minAmount);
        const _maxAmount = response.maxAmount ? Number(response.maxAmount) : -1;
        const nonZero = minAmount !== 0 && maxAmount !== 0;
        setMinAmount(_minAmount);
        setMaxAmount(_maxAmount);

        let currentFromAmount = (document.getElementById('input-from').value ? Number(document.getElementById('input-from').value) : 0);
        if (!((Number(currentFromAmount) > _maxAmount && _maxAmount > -1) || Number(currentFromAmount) < _minAmount)) {
          setFetchingOuput(true);
          setAmount(currentFromAmount, false, _minAmount, _maxAmount, fromCurrency, currency);
        } else if (nonZero && currentFromAmount !== 0) {
          if (Number(currentFromAmount) > _maxAmount && _maxAmount > -1) {
            setError(`Amount must be less than ${_maxAmount} ${fromCurrency}`);
          } else if (Number(currentFromAmount) < _minAmount) {
            setError(`Amount must be greater than ${_minAmount} ${fromCurrency}`);
          };
          setFetchingOuput(false);
        }
      }).catch((error) => {
        console.error(error);
        if (difference) {
          setMinAmount(0);
          setMaxAmount(0);
          setToAmount(0);
        }
      });
    } else if (difference) {
      setMinAmount(0);
      setMaxAmount(0);
      setToAmount(0);
    }
  }

  const setAmount = async (amount, modalTo, min = minAmount, max = maxAmount, from = fromCurrency, to = toCurrency) => {
    if (modalTo) {
      return;
    } else {
      setFromAmount(+Number(amount));
    }
    if (from === '' || to === '' || fromNetwork === '' || toNetwork === '') return;
    setToAmount(0);
    if (amount < min || (amount > max && max > -1)) return;
    setFetchingOuput(true);
    setError("");
    if (requestTimer.current != null) {
      clearTimeout(requestTimer.current);
      requestTimer.current = null;
    }
    requestTimer.current = setTimeout(() => {
      fetch(`https://api.changenow.io/v2/exchange/estimated-amount?fromCurrency=${from}&toCurrency=${to}&${modalTo ? `toAmount` : `fromAmount`}=${amount}&fromNetwork=${networks.get(fromNetwork)}&toNetwork=${networks.get(toNetwork)}&flow=standard`, {
        headers: {
          [`x-changenow-api-key`]: '9e27b09a64a0a1251c512396f77b7d41484804d2bc80bcf16b3aff8894679e13'
        }
      }).then(async (res) => {
        try {
          const response = await res.json();
          const estimatedAmount = Number(response.toAmount);
          setToAmount(estimatedAmount);
        } catch (e) {
          console.error(e);
        }
      }).catch((error) => {
        console.error(error);
      }).finally(() => {
        setFetchingOuput(false);
      });
    }, 333);
  }

  const setRecipientAddress = (address) => {
    _setRecipientAddress(address);
  }

  const getCurrencies = async () => {
    const response = await fetch('https://api.changenow.io/v2/exchange/currencies?active=true&flow=standard');
    const data = await response.json();
    return data;
  }

  const getNetworkGroupedCurrencies = (currs) => {
    const netCurrMap = new Map();
    for (const cObj of currs) {
      const network = cObj.network;
      const currency = cObj.ticker;
      if (cObj.isFiat) continue;
      if (!netCurrMap.get(network.toLowerCase())?.includes(currency)) {
        netCurrMap.set(network.toLowerCase(), [...netCurrMap.get(network) ?? [], currency]);
      }
    }
    return netCurrMap;
  }

  const createExchange = () => {
    if (creatingExchange) return;
    setCreatingExchange(true);
    axios.post(`https://api.changenow.io/v2/exchange`, {
      fromCurrency: fromCurrency,
      fromNetwork: networks.get(fromNetwork),
      toCurrency: toCurrency,
      toNetwork: networks.get(toNetwork),
      fromAmount: fromAmount,
      toAmount: toAmount,
      address: recipientAddress,
      flow: "standard",
      type: "direct",
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-changenow-api-key': '9e27b09a64a0a1251c512396f77b7d41484804d2bc80bcf16b3aff8894679e13'
      }
    }).then(async (exchange) => {
      const eData = exchange.data;
      if (eData.error) {
        console.error('Error:', eData.error);
        setError(eData.error.toString());
        setCreatingExchange(false);
        return;
      }
      const depositAddress = eData.payinAddress;

      const nowTime = Date.now();

      let order = {
        referralCode: 'tma',
        amount: fromAmount,
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        toNetwork: toNetwork,
        fromNetwork: fromNetwork,
        recipientAddress: recipientAddress,
        extraId: eData.payinExtraId ?? null,
        extraIdName: eData.payinExtraIdName ?? null,
        depositAddress,
        status: 'pending',
        step: 0,
        toAmount: toAmount,
        exchangeId: eData.id,
        createdAt: Timestamp.fromMillis(nowTime),
        updatedAt: Timestamp.fromMillis(nowTime),
      };

      addDoc(collection(db, `orders`), order).then((ref) => {
        window.open(`/?id=${ref.id}`, '_self');
      }).catch((error) => {
        console.error('Error adding document: ', error);
        setError(error.message);
        setCreatingExchange(false);
      });

    }).catch((error) => {
      console.error('Error:', error);
      setError(error.response.data.message ?? error.message);
      setCreatingExchange(false);
    });
  }

  useEffect(() => {
    getCurrencies().then((data) => {
      const currs = getNetworkGroupedCurrencies(data);
      setCurrencies(currs);
    }).catch((error) => {
      console.error('Error:', error);
    });

    const params = new URLSearchParams(window.location.search);
    const paramArray = Array.from(params.entries())[0];
    let query = '';
    if (paramArray && paramArray.length === 2 && paramArray[0].toLowerCase() === 'id') {
      query = paramArray[1];
      let listener;
      listener = onSnapshot(doc(db, `orders/${query}`), (doc) => {
        if (doc.exists()) {
          setExchangeData(doc.data());
        } else {
          listener();
          console.error('`No such `document!');
          window.open('/', '_self');
        }
      }, (error) => {
        listener();
        console.error('Error getting document:', error);
        window.open('/', '_self');
      });
      const interval = setInterval(() => {
        if (listener) listener();
        listener = onSnapshot(doc(db, `orders/${query}`), (doc) => {
          if (doc.exists()) {
            setExchangeData(doc.data());
          } else {
            clearInterval(interval);
            listener();
            console.error('`No such `document!');
            window.open('/', '_self');
          }
        }, (error) => {
          clearInterval(interval);
          listener();
          console.error('Error getting document:', error);
          window.open('/', '_self');
        });
      }, 12000);
    }
  }, []);

  const getTime = (exchangeData) => {
    if (exchangeData.status === 'completed') {
      return `${exchangeData.updatedAt.toDate().toLocaleString('en-US', { timeZone: 'UTC' })} UTC`;
    }
    let elapsed = Math.floor((Date.now() - exchangeData.updatedAt.toMillis()) / 1000);
    let updatedAtText = '';
    if (elapsed > 86400) {
        updatedAtText += `${Math.floor(elapsed / 86400)}d `;
        elapsed %= 86400;
    }
    if (elapsed > 3600) {
        updatedAtText += `${Math.floor(elapsed / 3600)}h `;
        elapsed %= 3600;
    }
    if (elapsed > 60) {
        updatedAtText += `${Math.floor(elapsed / 60)}m `;
        elapsed %= 60;
    }
    if (elapsed > 0) {
        updatedAtText += `${elapsed}s`;
    }
    if (updatedAtText === '') updatedAtText = 'Just Now';
    return updatedAtText;
  }

  const getStatus = (status, step) => {
    switch (status) {
      case 'pending':
        return 'Pending... ⏳';
      case 'mixing':
      case 'bridging':
        return step === 3 ? 'Preparing to send ✈️' : 'Bridging... ⛓️';
      case 'completed':
        return 'Completed ✅';
      default:
        return 'Pending... ⏳';
    }
  }

  return (
    <div style={{ width: '100vw' }}>
      <div style={{ height: '0', width: '100vw' }} className='w-100%  flex flex-col'>
        {isModalShowing && 
        <ChainList 
        creatingExchange={creatingExchange}
        modalTo={modalTo}
        setIsModalShowing={setIsModalShowing}
        setToNetwork={setToNetwork}
        setFromNetwork={setFromNetwork}
        networks={networks}
        />}
        {isTokenShowing &&
        <TokenList
          creatingExchange={creatingExchange}
          setIsTokenShowing={setIsTokenShowing}
          fromNetwork={fromNetwork}
          toNetwork={toNetwork}
          setFromCurrency={setFromCurrency}
          setToCurrency={setToCurrency}
          modalTo={modalTo}
          currencies={currencies}
          networks={networks}
        />}
        <div style={{ paddingTop: '0'}} className={ `w-[96%] lg:w-[85%] lg:h-[115vh] h-[100vh] mt-20 lg:mt-8 flex justify-center mb-10 items-center pt-5 ml-auto mr-auto `}>
          <div className={` w-[98%] lg:w-[42%] h-[690px] lg:h-[95vh] py-6 px-4 px-3 drop-shadow-glow  bg-black/80 rounded-3xl`}>
            <div className='text-white flex py-2 w-[93%] ml-auto mr-auto h-12' style={{ justifyContent: 'center', marginBottom: '12px',width: '100%', gap: '20px', padding: '0', textAlign: 'center', display: 'flex', flexDirection: 'row'}}>
              <div className='ml-3 mr-auto py-1 px-1' style={{  width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center', justifyItems: 'center', alignItems: 'center'}}>
                <p style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', display: 'flex', padding: '0', margin: 'auto', flexDirection: 'column', width: '100%' }} className='text-xl font-extralight'><span style={{ cursor: 'pointer' }} onClick={() => window.open('/', '_self')}>$MIXER <span style={{ color: '#007910'}}>Bridge</span></span>{new URLSearchParams(window.location.search).get('id')?.toLowerCase().trim() === '' ? '' : (<b><em><span style={{ cursor: 'pointer', fontSize: '20px', fontWeight: '400'}} onClick={() => navigator.clipboard.writeText(new URLSearchParams(window.location.search).get('id'))}>{new URLSearchParams(window.location.search).get('id')}</span></em></b>)}</p>
              </div> 
            </div>
            <br/>
            {
              new URLSearchParams(window.location.search).get('id')?.toLowerCase().trim() !== '' ?
              <div style={{ width: '86%', height: '80vh', marginTop: exchangeData && exchangeData.status === 'pending' ? '0px' : '8px', paddingTop: '0', letterSpacing: '1.5px' }} className='text-white flex py-2 w-[98%] mt-10 ml-auto mr-auto h-12'>
                {exchangeData ?
                <div style={{ width: '100%', height: '80vh', marginTop: '0', paddingTop: '0', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                  <p style= {{margin: '6px 0', fontSize: '20px', fontWeight: 'bold'}}><b>{exchangeData.amount} ${exchangeData.fromCurrency.toUpperCase()} ({exchangeData.fromNetwork.toUpperCase()}) 🔀 {exchangeData.toAmount} ${exchangeData.toCurrency.toUpperCase()} ({exchangeData.toNetwork.toUpperCase()})</b></p>
                  <p style= {{margin: '6px 0'}}><b><span style={{fontSize: '20px', fontWeight: 'bold', lineHeight: '40px'}}>Recipient:</span></b><br/><em><span style={{ wordWrap: 'break-word', cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(exchangeData.recipientAddress)}>{exchangeData.recipientAddress}</span></em></p>
                  {exchangeData.status === 'pending'
                  && (<>
                      <img alt='' style={{ padding: '6px', borderRadius: '10px', margin: '14px auto' }} src={process.env.REACT_APP_QR_URL + `&data=${exchangeData.fromCurrency === 'ton' ? `ton://transfer/${exchangeData.depositAddress}?amount=${(exchangeData.amount * (10 ** 9)).toFixed(0)}` : exchangeData.depositAddress}`} />
                      <p style= {{margin: '6px 0'}}><b><span style={{fontSize: '20px', fontWeight: 'bold',  lineHeight: '40px'}}>Deposit {exchangeData.amount} ${exchangeData.fromCurrency.toUpperCase()} ({exchangeData.fromNetwork.toUpperCase()}) to:</span></b><br/><em><span style={{ wordWrap: 'break-word', cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(exchangeData.depositAddress)}>{exchangeData.depositAddress}</span></em></p>
                      {exchangeData.extraId && exchangeData.extraIdName &&
                        <p style= {{margin: '6px 0', paddingTop: '4px'}}><b><span style={{fontSize: '20px', fontWeight: 'bold',  lineHeight: '40px'}}>{exchangeData.extraIdName}:</span></b><br/><em><span style={{ wordWrap: 'break-word', cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(exchangeData.extraId)}>{exchangeData.extraId}</span></em></p>
                      }
                    </>)}
                  <br/>
                  <span style= {{margin: '6px 0'}}>
                  <p><b>Status: {getStatus(exchangeData.status, exchangeData.step)}</b></p>
                  <p><b>{exchangeData.status === 'completed' ? 'Completed At' : 'Last Updated'}: {getTime(exchangeData)}</b></p>
                  </span>
                </div>
                : <div style={{ display: 'inline-block' }}>
                  Loading Order...
                  <img alt='' style={{ width: '30px', margin: 'auto'}} src="/icons/infinite_white.gif" />
                  </div>}
              </div>
                :
                <>
              {currencies && currencies.size > 0 ?
              <>
                <div style={{ marginTop: '6px'}} className='text-white flex py-2 w-[98%] mt-10 ml-auto mr-auto h-12'>
                  <div className='ml-0 mr-auto w-[45%] py-1 px-1 mb-4' style={{ paddingBottom: '0!important', marginBottom: '0!important' }}>
                    <p style={{ fontSize: '18px', fontWeight: '900' }} className='text-sm font-bold text-center mb-4'>Origin</p>
                    {currencies.size > 0 && <div style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (creatingExchange) return;
                      setModalTo(false);
                      setIsModalShowing?.(true);
                    }}>
                      <div
                        className="bg-green-400/30 w-[100%] flex py-3.5 lg:px-4 px-2 border border-gray-300 text-gray-900 text-sm outline-none rounded-lg h-12  focus:ring-green-500 focus:border-green-500 block p-2.5 dark:bg-green-400/30 dark:border-green-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500/70"
                      > 
                        {fromNetwork !== '' ? <p className="ml-3 w-auto  mr-auto">{fromNetwork.toUpperCase()}</p> : <p className="ml-auto  w-auto  mr-auto">{'Select Network'}</p>}
                      </div>
                    </div>}
                  </div>
                  <div className='ml-auto mr-auto  w-[10%] py-12'>
                    <div className='w-8 h-8 py-1.5 px-1 ml-auto mr-auto  rounded-lg bg-green-400/30'>
                      <img alt='' src='/icons/arrow-right.svg' className='ml-auto mr-auto' />
                    </div>
                  </div>
                  <div className='ml-auto mr-3 w-[45%] py-1 mb-4 px-1'>
                    <p style={{ fontSize: '18px', fontWeight: '900' }} className='text-sm text-center font-bold mb-4'>Destination</p>
                    {currencies.size > 0 && <div style={{ cursor: 'pointer' }}
                      onClick={() => {
                        if (creatingExchange) return;
                        setModalTo(true);
                        setIsModalShowing?.(true);
                      }}>
                      <div
                        className="bg-green-400/30 w-[100%] flex py-3.5 lg:px-4 px-2 border border-gray-300 text-gray-900 text-sm outline-none rounded-lg h-12  focus:ring-green-500 focus:border-green-500 block p-2.5 dark:bg-green-400/30 dark:border-green-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500/70"
                      > 
                        {toNetwork !== '' ? <p className="ml-3 w-auto  mr-auto">{toNetwork.toUpperCase()}</p> : <p className="ml-auto  w-auto  mr-auto">{'Select Network'}</p>}
                      </div>
                    </div>}
                  </div>
                </div>
                <div style={{ marginTop: '40px' }} className='text-white flex flex-col mb-3  py-2 w-[95%] mt-20 ml-auto mr-auto h-12'>
                  <div className='ml-auto mr-auto w-[100%] py-1 px-1 mb-4'>
                    <div className='flex mb-2'>
                      <p style={{ fontSize: '18px', fontWeight: '900' }} className='ml-2 mr-auto'>You send</p>
                    </div>
                    <TokenSelect 
                    creatingExchange={creatingExchange}
                    setIsTokenShowing={setIsTokenShowing}
                    minAmount={minAmount}
                    maxAmount={maxAmount}
                    fetchingOuput={fetchingOuput}
                    fromCurrency={fromCurrency}
                    toCurrency={toCurrency}
                    setAmount={setAmount}
                    fromAmount={fromAmount}
                    toAmount={toAmount}
                    fromNetwork={fromNetwork}
                    toNetwork={toNetwork}
                    setModalTo={setModalTo}
                    modalTo={false}/>
                  </div>
                  <div style={{ marginTop: '0px'}} className='ml-auto mr-auto w-[100%] mt-5 py-1 px-1 mb-4'>
                    <div className='flex mb-2'>
                      <p style={{ fontSize: '18px', fontWeight: '900' }} className='ml-2 mr-auto'>You Receive</p>
                    </div>
                    <TokenSelect
                    creatingExchange={creatingExchange}
                    setIsTokenShowing={setIsTokenShowing}
                    minAmount={minAmount}
                    maxAmount={maxAmount}
                    fetchingOuput={fetchingOuput}
                    fromCurrency={fromCurrency}
                    toCurrency={toCurrency}
                    setAmount={setAmount}
                    fromAmount={fromAmount}
                    toAmount={toAmount}
                    fromNetwork={fromNetwork}
                    toNetwork={toNetwork}
                    setModalTo={setModalTo}
                    modalTo={true} />
                  </div>
                  <div className='ml-auto mr-auto w-[100%] mt-4 py-1 px-1 mb-4'>
                    <input disabled={creatingExchange} aria-disabled={creatingExchange} style={{ cursor: 'text'}} type='text' onChange={(e) => setRecipientAddress(e.target.value)} value={recipientAddress} placeholder={`Recipient ${toNetwork !== '' ? `${toNetwork.toUpperCase()} ` : ''}address`} className='w-[100%] bg-green-400/30 h-12 rounded-xl p-4' />
                  </div>
                  <div className='w-[100%] mt-8 flex'>
                    {!creatingExchange ?
                    <button disabled={fromNetwork === '' || toNetwork === '' || fromCurrency === '' || toCurrency === '' || recipientAddress === '' || fromAmount <= 0 || fromAmount < minAmount || (fromAmount > maxAmount && maxAmount > -1)}
                      aria-disabled={fromNetwork === '' || toNetwork === '' || fromCurrency === '' || toCurrency === '' || recipientAddress === '' || fromAmount <= 0 || fromAmount < minAmount || (fromAmount > maxAmount && maxAmount > -1)}
                      onClick={() => {
                      if (fromNetwork === '' || toNetwork === '' || fromCurrency === '' || toCurrency === '' || recipientAddress === '' || fromAmount <= 0 || fromAmount < minAmount || (fromAmount > maxAmount && maxAmount > -1)) return;
                      createExchange();
                      }} style={{ cursor: (fromNetwork === '' || toNetwork === '' || fromCurrency === '' || toCurrency === '' || recipientAddress === '' || fromAmount <= 0 || fromAmount < minAmount || (fromAmount > maxAmount && maxAmount > -1)) ? 'not-allowed' : 'pointer', color: (fromNetwork === '' || toNetwork === '' || fromCurrency === '' || toCurrency === '' || recipientAddress === '' || fromAmount <= 0 || fromAmount < minAmount || (fromAmount > maxAmount && maxAmount > -1)) ? '#000' : 'white', backgroundColor: (fromNetwork === '' || toNetwork === '' || fromCurrency === '' || toCurrency === '' || recipientAddress === '' || fromAmount <= 0 || fromAmount < minAmount || (fromAmount > maxAmount && maxAmount > -1)) ? '#222' : '#22C55E'}} className='w-[100%] bg-green-500/70 h-12 rounded-xl cursor-pointer ml-auto mr-auto'>Create Bridge
                    </button>
                    : <div className="w-6 h-6 ml-auto mr-auto">
                      <img alt='' src="/icons/infinite_white.gif" />
                    </div>}
                  </div>
                  {error && <div className='w-[100%] mt-4 text-red-500 text-center'>{error}</div>}
                </div>
              </>
              :
                <div className="w-6 h-6 ml-auto mr-auto">
                  <img alt='' style={{ color: 'white'}} src="/icons/infinite_white.gif" />
                </div>}
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
