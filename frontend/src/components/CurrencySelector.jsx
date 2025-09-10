// CurrencySelector.jsx
import React from "react";

export default function CurrencySelector({ currencies = [], selected = "", onChange, ariaLabel }) {
  return (
    <select
      aria-label={ariaLabel}
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 p-2 border-none bg-transparent focus:outline-none focus:ring-0"
    >
      {currencies.length === 0 ? (
        <option value="">Loading...</option>
      ) : (
        currencies.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))
      )}
    </select>
  );
}