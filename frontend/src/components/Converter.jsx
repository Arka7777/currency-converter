// src/components/Converter.jsx
import React, { useState, useEffect } from "react";
import CurrencySelector from "./CurrencySelector";
import HistoricalChart from "./HistoricalChart";
import FavoritePairs from "./FavoritePairs";
import RateAlerts from "./RateAlerts";
import CurrencyInfo from "./CurrencyInfo";
import ExportHistory from "./ExportHistory";
// import ThemeToggle from "./ThemeToggle";

// ✅ Only currencies supported by Frankfurter (historical API)
const countryList = {
  AUD: "AU",
  BGN: "BG",
  BRL: "BR",
  CAD: "CA",
  CHF: "CH",
  CNY: "CN",
  CZK: "CZ",
  DKK: "DK",
  EUR: "FR",
  GBP: "GB",
  HKD: "HK",
  HUF: "HU",
  IDR: "ID",
  ILS: "IL",
  INR: "IN",
  ISK: "IS",
  JPY: "JP",
  KRW: "KR",
  MXN: "MX",
  MYR: "MY",
  NOK: "NO",
  NZD: "NZ",
  PHP: "PH",
  PLN: "PL",
  RON: "RO",
  SEK: "SE",
  SGD: "SG",
  THB: "TH",
  TRY: "TR",
  USD: "US",
  ZAR: "ZA",
};

const apiKey = "99a0aec004527b1a155623da";

export default function CurrencyConverter() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [amount, setAmount] = useState(1);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled in localStorage
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (amount > 0) {
      getExchangeRate();
    }
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    if (amount > 0 && !error) {
      const timer = setTimeout(() => {
        getExchangeRate();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [amount]);

  const getExchangeRate = async () => {
    if (error && amount <= 0) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`
      );
      const data = await res.json();
      
      if (data.result === "error") {
        throw new Error(data["error-type"]);
      }
      
      const rate = data.conversion_rates[toCurrency];
      const converted = (amount * rate).toFixed(2);
      setExchangeRate(converted);
      setLastUpdated(new Date().toLocaleTimeString());

      // ✅ Update history (keep max 5)
      if (countryList[fromCurrency] && countryList[toCurrency]) {
        setHistory((prev) => {
          const newEntry = { 
            fromCurrency, 
            toCurrency, 
            amount, 
            result: converted,
            rate: rate,
            timestamp: new Date().toLocaleString()
          };
          
          // Avoid duplicates
          const updated = [newEntry, ...prev.filter(
            (item) => !(item.fromCurrency === fromCurrency && 
                       item.toCurrency === toCurrency && 
                       item.amount === amount)
          )];
          
          return updated.slice(0, 5);
        });
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeRate(null);
      setError("Failed to fetch exchange rate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setRotation(rotation + 180);
  };

  const handleHistoryClick = (item) => {
    setFromCurrency(item.fromCurrency);
    setToCurrency(item.toCurrency);
    setAmount(item.amount);
    setExchangeRate(item.result);
  };

  const handleFavoriteSelect = (from, to) => {
    setFromCurrency(from);
    setToCurrency(to);
  };

  // const toggleDarkMode = () => {
  //   const newDarkMode = !darkMode;
  //   setDarkMode(newDarkMode);
  //   localStorage.setItem("darkMode", newDarkMode);
    
  //   if (newDarkMode) {
  //     document.documentElement.classList.add("dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //   }
  // };

  const formatCurrency = (value, currencyCode) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-black">💱 Currency Converter</h1>
        {/*  <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
          aria-label="Toggle dark mode"
        > 
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button> */}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Converter */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          {/* Currency selectors */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From
              </label>
              <div className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                <img
                  src={`https://flagsapi.com/${countryList[fromCurrency]}/flat/64.png`}
                  alt="flag"
                  className="w-6 h-6 rounded-sm"
                />
                <CurrencySelector
                  currencies={Object.keys(countryList)}
                  selected={fromCurrency}
                  onChange={setFromCurrency}
                  ariaLabel="Select source currency"
                />
              </div>
            </div>

            <button
              onClick={swapCurrencies}
              className="mt-6 p-3 bg-blue-100 dark:bg-blue-900 rounded-full shadow-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
              style={{ transform: `rotate(${rotation}deg)`, transition: "transform 0.5s ease" }}
              aria-label="Swap currencies"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>

            <div className="flex-1">
              <label className="block text-sm font-medium text-white">
                To
              </label>
              <div className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                <img
                  src={`https://flagsapi.com/${countryList[toCurrency]}/flat/64.png`}
                  alt="flag"
                  className="w-6 h-6 rounded-sm"
                />
                <CurrencySelector
                  currencies={Object.keys(countryList)}
                  selected={toCurrency}
                  onChange={setToCurrency}
                  ariaLabel="Select target currency"
                />
              </div>
            </div>
          </div>

          {/* Amount input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 ">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                setAmount(value);

                if (!value) setError("Please enter an amount");
                else if (value <= 0) setError("Amount must be greater than 0");
                else setError("");
              }}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter amount"
              min="0"
              step="any"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={getExchangeRate}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 shadow-md transition-colors duration-200 flex items-center justify-center gap-2"
            disabled={!!error || loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Rate
              </>
            )}
          </button>

          {/* Result Display */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Exchange Rate:</span>
              {loading ? (
                <div className="animate-pulse h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
              ) : exchangeRate ? (
                <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  1 {fromCurrency} = {(exchangeRate / amount).toFixed(4)} {toCurrency}
                </span>
              ) : null}
            </div>
            
            <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Converted Amount:</span>
                {loading ? (
                  <div className="animate-pulse h-8 w-40 bg-gray-300 dark:bg-gray-600 rounded"></div>
                ) : exchangeRate ? (
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(exchangeRate, toCurrency)}
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">-</span>
                )}
              </div>
            </div>
            
            {lastUpdated && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
                Last updated: {lastUpdated}
              </div>
            )}
          </div>

          {/* Currency Information */}
          <CurrencyInfo currencyCode={fromCurrency} />
          <CurrencyInfo currencyCode={toCurrency} />


          {/* ✅ History Section */}
          {history.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold dark:text-white">Recent Conversions</h3>
                <ExportHistory history={history} />
              </div>
              <div className="space-y-2">
                {history.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    className="cursor-pointer p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-colors duration-150"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://flagsapi.com/${countryList[item.fromCurrency] || "US"}/flat/24.png`}
                          alt={item.fromCurrency}
                          className="w-5 h-5 rounded-sm"
                        />
                        <span className="font-medium dark:text-white">{item.amount} {item.fromCurrency}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <img
                          src={`https://flagsapi.com/${countryList[item.toCurrency] || "US"}/flat/24.png`}
                          alt={item.toCurrency}
                          className="w-5 h-5 rounded-sm"
                        />
                        <span className="font-medium dark:text-white">{item.result} {item.toCurrency}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                        {item.timestamp}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                      <span>Rate: {item.rate}</span>
                      <span className="text-blue-500 dark:text-blue-400">Click to use</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Pairs */}
          <FavoritePairs 
            onSelectPair={handleFavoriteSelect} 
            currentFrom={fromCurrency} 
            currentTo={toCurrency} 
          />

          {/* Rate Alerts */}
          <RateAlerts 
            fromCurrency={fromCurrency} 
            toCurrency={toCurrency} 
            currentRate={exchangeRate / amount} 
          />
        </div>

        {/* Right: Graph */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
            📈 Exchange Rate History
          </h2>
          
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded">
              {fromCurrency}
            </span>
            <span className="text-gray-400">→</span>
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2.5 py-0.5 rounded">
              {toCurrency}
            </span>
          </div>
          
          {fromCurrency && toCurrency ? (
            <HistoricalChart base={fromCurrency} target={toCurrency} />
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="mt-2">Select currencies to view historical data</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}