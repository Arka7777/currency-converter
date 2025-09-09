import React, { useState, useEffect } from "react";
import CurrencySelector from "./CurrencySelector";
import HistoricalChart from "./HistoricalChart";

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

  useEffect(() => {
    if (!error && amount > 0) {
      getExchangeRate();
    }
  }, [fromCurrency, toCurrency]);

  const getExchangeRate = async () => {
    if (error) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`
      );
      const data = await res.json();
      const rate = data.conversion_rates[toCurrency];
      const converted = (amount * rate).toFixed(2);
      setExchangeRate(converted);

      // ✅ Update history (keep max 5)
      if (countryList[fromCurrency] && countryList[toCurrency]) {
        setHistory((prev) => {
          const newEntry = { fromCurrency, toCurrency, amount, result: converted };
          const updated = [newEntry, ...prev.filter(
            (item) => !(item.fromCurrency === fromCurrency && item.toCurrency === toCurrency && item.amount === amount)
          )];
          return updated.slice(0, 5);
        });
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeRate(null);
      setError("Failed to fetch exchange rate.");
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setRotation(rotation === 0 ? 180 : 0);
  };

  const handleHistoryClick = (item) => {
    setFromCurrency(item.fromCurrency);
    setToCurrency(item.toCurrency);
    setAmount(item.amount);
    setExchangeRate(item.result);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Converter */}
        <div className="p-6 bg-white rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Currency Converter
          </h2>

          {/* Currency selectors */}
          <div className="flex items-center gap-4 mb-4">
            <div className="dropdown flex items-center gap-2">
              <img
                src={`https://flagsapi.com/${countryList[fromCurrency]}/flat/64.png`}
                alt="flag"
                className="w-8 h-8"
              />
              <CurrencySelector
                currencies={Object.keys(countryList)}
                selected={fromCurrency}
                onChange={setFromCurrency}
              />
            </div>
            <button
              onClick={swapCurrencies}
              className="p-2 bg-gray-200 rounded-full shadow-md hover:bg-gray-300"
              style={{ transform: `rotate(${rotation}deg)`, transition: "transform 0.5s ease" }}
            >
              🔄
            </button>
            <div className="dropdown flex items-center gap-2">
              <img
                src={`https://flagsapi.com/${countryList[toCurrency]}/flat/64.png`}
                alt="flag"
                className="w-8 h-8"
              />
              <CurrencySelector
                currencies={Object.keys(countryList)}
                selected={toCurrency}
                onChange={setToCurrency}
              />
            </div>
          </div>

          {/* Amount input */}
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              setAmount(value);

              if (!value) setError("Please enter a number");
              else if (value <= 0) setError("Invalid amount");
              else setError("");
            }}
            className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
          />

          {error && <p className="text-red-600 text-sm font-semibold mb-3 text-center">{error}</p>}

          <button
            onClick={getExchangeRate}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 shadow-md"
            disabled={!!error}
          >
            Get Exchange Rate
          </button>

          <p className="mt-4 text-lg font-semibold text-center text-gray-700">
            {loading ? (
              <span className="animate-spin inline-block">🔄</span>
            ) : exchangeRate ? (
              `${amount} ${fromCurrency} = ${exchangeRate} ${toCurrency}`
            ) : (
              !error && "Enter amount and click Get Exchange Rate"
            )}
          </p>

          {/* ✅ History Section */}
          {history.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Last 5 Conversions</h3>
              <ul className="space-y-2">
                {history.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    className="cursor-pointer p-2 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://flagsapi.com/${countryList[item.fromCurrency] || "US"}/flat/24.png`}
                        alt={item.fromCurrency}
                        className="w-6 h-6"
                      />
                      <span>{item.amount} {item.fromCurrency} → {item.result} {item.toCurrency}</span>
                      <img
                        src={`https://flagsapi.com/${countryList[item.toCurrency] || "US"}/flat/24.png`}
                        alt={item.toCurrency}
                        className="w-6 h-6 ml-2"
                      />
                    </div>
                    <span className="text-gray-500 text-sm">Click to use</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: Graph */}
        <div className="p-6 bg-white rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Past 30 Days Fluctuations
          </h2>
          {exchangeRate && !error ? (
            <HistoricalChart base={fromCurrency} target={toCurrency} />
          ) : (
            <p className="text-center text-gray-500">
              Select currencies and convert to view historical data
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
