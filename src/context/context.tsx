"use client";
import {
  ReactNode,
  useState,
  useContext,
  createContext,
  useEffect,
} from "react";

export const BridgeContext = createContext<any>({
 
});

type Props = {
  children: ReactNode;
};

let requestTimer: any = null;

export function BridgeContextProvider({ children }: Props) {
  const [exchangeData, setExchangeData] = useState<any>(null);
  const [creatingExchange, setCreatingExchange] = useState(false);
  const [isModalShowing, setIsModalShowing] = useState(false);
  const [isModal2Showing, setIsModal2Showing] = useState(false);
  const [isTokenShowing, setIsTokenShowing] = useState(false);
  const [isNFTList, setIsNFTList] = useState(false);
  const [isApproveModal, setIsApproveModal] = useState(false);
  const setFromNetwork = (network: string) => {
    if (network !== fromNetwork) {
      setAmount(0, false);
      setToAmount(0);
      setMinAmount(0);
      setMaxAmount(0);
      setFromCurrency('');
    }
    _setFromNetwork(network);
  }
  const [fromNetwork, _setFromNetwork] = useState('');
  const setToNetwork = (network: string) => {
    if (network !== toNetwork) {
      setToAmount(0);
      setMinAmount(0);
      setMaxAmount(0);
      setToCurrency('');
    }
    _setToNetwork(network);
  }
  const [toNetwork, _setToNetwork] = useState('');
  const setFromCurrency = async (currency: string) => {

    const difference = currency !== fromCurrency;

    _setFromCurrency(currency);

    if (toCurrency !== '' && currency !== '') {
      if (Number(fromAmount) > 0) setFetchingOuput(true);
        
      fetch(`https://api.changenow.io/v2/exchange/min-amount?fromCurrency=${currency}&toCurrency=${toCurrency}&fromNetwork=${fromNetwork}&toNetwork=${toNetwork}&flow=standard`, {
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

        let currentFromAmount = (window.document.getElementById('input-from') as HTMLInputElement)?.value ? Number((window.document.getElementById('input-from') as HTMLInputElement)?.value) : 0;
        console.log(currentFromAmount);
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
  const [fromCurrency, _setFromCurrency] = useState('');
  const setToCurrency = async (currency: string) => {
    const difference = currency !== toCurrency;

    _setToCurrency(currency);

    if (fromCurrency !== '' && currency !== '') {
      if (Number(fromAmount) > 0) setFetchingOuput(true);
      fetch(`https://api.changenow.io/v2/exchange/min-amount?toCurrency=${currency}&fromCurrency=${fromCurrency}&fromNetwork=${fromNetwork}&toNetwork=${toNetwork}&flow=standard`, {
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

        let currentFromAmount = (window.document.getElementById('input-from') as HTMLInputElement)?.value ? Number((window.document.getElementById('input-from') as HTMLInputElement)?.value) : 0;
        console.log(currentFromAmount);
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
  const [toCurrency, _setToCurrency] = useState('');
  const [claimAddress, setClaimAddress] = useState('')
  const [destinationChainID, setDestinationChainID] = useState(0)
  const [selectedToken, setSelectedToken] = useState("Select Token");
  const [selectedNFT, setSelectedNFT] = useState('Select Collection');
  const [selectedNFTLogo, setSelectedNFTLogo] = useState('/icons/coin.svg');
  const [selectedTokenLogo, setSelectedTokenLogo] = useState("/icons/coin.svg");
  const [expandDetails, setExpandDetails] = useState(false);
  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(0);
  const setAmount = async (amount: number, modalTo: boolean, min: number = minAmount, max: number = maxAmount, from: string = fromCurrency, to: string = toCurrency) => {
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
    if (requestTimer != null) {
      clearTimeout(requestTimer);
    }
    requestTimer = setTimeout(() => {
      fetch(`https://api.changenow.io/v2/exchange/estimated-amount?fromCurrency=${from}&toCurrency=${to}&${modalTo ? `toAmount` : `fromAmount`}=${amount}&fromNetwork=${fromNetwork}&toNetwork=${toNetwork}&flow=standard`, {
        headers: {
          [`x-changenow-api-key`]: '9e27b09a64a0a1251c512396f77b7d41484804d2bc80bcf16b3aff8894679e13'
        }
      }).then(async (res) => {
        try {
          const response = await res.json();
          const estimatedAmount = Number(response.toAmount);
          console.log(estimatedAmount);
          setToAmount(estimatedAmount);
        } catch (e) {
          console.error(e);
        }
      }).catch((error) => {
        console.error(error);
      }).finally(() => {
        setFetchingOuput(false);
      });
    }, 800);
  }
  const [toAmount, setToAmount] = useState(0);
  const [fromAmount, setFromAmount] = useState(0);
  const [faucetAddress, setFaucetAddress] = useState('');
  const [isSettingModal, setIsSettingModal] = useState(false);
  const [currencies, setCurrencies] = useState(new Map());
  const [modalTo, setModalTo] = useState(false);
  const [fetchingOuput, setFetchingOuput] = useState(false);
  const setRecipientAddress = (address: string) => {
    // if (address !== recipientAddress) {
    //   setError("");
    // }
    _setRecipientAddress(address);
  }
  const [recipientAddress, _setRecipientAddress] = useState('');

  const [selectedTab, setSelectedTab] = useState("presale");
  const [error, setError] = useState("");

  const value = {
        isModalShowing,
        isModal2Showing,
        isTokenShowing,
        isNFTList,
        fromNetwork,
        toNetwork,
        fromCurrency,
        toCurrency,
        destinationChainID,
        selectedTokenLogo,
        selectedToken,
        selectedNFT,
        selectedNFTLogo,
        faucetAddress,
        expandDetails,
        claimAddress,
        isApproveModal,
        toAmount,
        fromAmount,
        isSettingModal,
        currencies,
        modalTo,
        minAmount,
        maxAmount,
        fetchingOuput,
        recipientAddress,
        creatingExchange,
        exchangeData,
        error,

        setIsSettingModal,
        setIsModalShowing,
        setIsModal2Showing,
        setExpandDetails,
        setIsTokenShowing,
        setIsNFTList,
        setFromNetwork,
        setToNetwork,
        setFromCurrency,
        setToCurrency,
        setSelectedTokenLogo,
        setDestinationChainID,
        setSelectedToken,
        setSelectedNFT,
        setFaucetAddress,
        setSelectedNFTLogo,
        setClaimAddress,
        setIsApproveModal,
        setAmount,
        setCurrencies,
        setModalTo,
        setRecipientAddress,
        setCreatingExchange,
        setExchangeData,
        setError,
  };

    return (
    <BridgeContext.Provider value={value}>
      {children}
    </BridgeContext.Provider>
  );
}

export const GlobalContext = () => useContext(BridgeContext);
