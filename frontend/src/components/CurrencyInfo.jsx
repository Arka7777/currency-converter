// src/components/CurrencyInfo.jsx
import React, { useState, useEffect } from "react";

export default function CurrencyInfo({ currencyCode }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currencyCode) return;
    
    const fetchCurrencyInfo = async () => {
      setLoading(true);
      try {
        // Using a free API for currency information
        const response = await fetch(`https://restcountries.com/v3.1/currency/${currencyCode}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          setInfo({
            countries: data.map(country => country.name.common),
            name: data[0].currencies[currencyCode]?.name || ""
          });
        }
      } catch (error) {
        console.error("Error fetching currency info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencyInfo();
  }, [currencyCode]);

  if (!currencyCode) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">About {currencyCode}</h3>
      
      {loading ? (
        <p className="text-gray-500">Loading currency information...</p>
      ) : info ? (
        <div>
          <p><strong>Name:</strong> {info.name}</p>
          <p><strong>Used in:</strong> {info.countries.slice(0, 5).join(", ")}
            {info.countries.length > 5 && ` and ${info.countries.length - 5} more countries`}
          </p>
        </div>
      ) : (
        <p className="text-gray-500">No information available for {currencyCode}.</p>
      )}
    </div>
  );
}