// src/components/ExportHistory.jsx
import React from "react";

export default function ExportHistory({ history }) {
  const exportToCSV = () => {
    if (history.length === 0) return;
    
    const headers = "Date,From Currency,To Currency,Amount,Converted Amount,Rate\n";
    const csvContent = history.map(item => 
      `"${item.timestamp}","${item.fromCurrency}","${item.toCurrency}","${item.amount}","${item.result}","${item.rate}"`
    ).join("\n");
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `currency-conversions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (history.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        onClick={exportToCSV}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export History as CSV
      </button>
    </div>
  );
}