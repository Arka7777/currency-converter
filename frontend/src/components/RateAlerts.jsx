// src/components/RateAlerts.jsx
import React, { useState, useEffect } from "react";

export default function RateAlerts({ fromCurrency, toCurrency, currentRate }) {
  const [alerts, setAlerts] = useState([]);
  const [targetRate, setTargetRate] = useState("");
  const [alertType, setAlertType] = useState("above");

  useEffect(() => {
    const saved = localStorage.getItem("currencyAlerts");
    if (saved) {
      setAlerts(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (currentRate && alerts.length > 0) {
      alerts.forEach(alert => {
        if (
          alert.from === fromCurrency && 
          alert.to === toCurrency &&
          (
            (alert.type === "above" && currentRate >= alert.targetRate) ||
            (alert.type === "below" && currentRate <= alert.targetRate)
          )
        ) {
          // Show notification (in a real app, you'd use browser notifications)
          alert(`Alert: ${fromCurrency}/${toCurrency} rate is ${alert.type === "above" ? "above" : "below"} ${alert.targetRate}. Current rate: ${currentRate}`);
        }
      });
    }
  }, [currentRate, fromCurrency, toCurrency, alerts]);

  const addAlert = () => {
    if (!targetRate || isNaN(targetRate) || targetRate <= 0) return;
    
    const newAlert = {
      id: Date.now(),
      from: fromCurrency,
      to: toCurrency,
      targetRate: parseFloat(targetRate),
      type: alertType,
      createdAt: new Date().toISOString()
    };
    
    const updatedAlerts = [...alerts, newAlert];
    setAlerts(updatedAlerts);
    localStorage.setItem("currencyAlerts", JSON.stringify(updatedAlerts));
    setTargetRate("");
  };

  const removeAlert = (id) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem("currencyAlerts", JSON.stringify(updatedAlerts));
  };

  const pairAlerts = alerts.filter(alert => 
    alert.from === fromCurrency && alert.to === toCurrency
  );

  return (
    <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Rate Alerts</h3>
      
      <div className="flex gap-2 mb-3">
        <select
          value={alertType}
          onChange={(e) => setAlertType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
        <input
          type="number"
          value={targetRate}
          onChange={(e) => setTargetRate(e.target.value)}
          placeholder="Target rate"
          className="flex-1 p-2 border rounded"
          step="0.0001"
        />
        <button
          onClick={addAlert}
          className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
        >
          Set Alert
        </button>
      </div>
      
      {pairAlerts.length > 0 ? (
        <div className="space-y-2">
          {pairAlerts.map(alert => (
            <div key={alert.id} className="flex justify-between items-center p-2 bg-white rounded">
              <span>
                Alert when rate is <strong>{alert.type}</strong> {alert.targetRate}
              </span>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No alerts set for this pair.</p>
      )}
    </div>
  );
}