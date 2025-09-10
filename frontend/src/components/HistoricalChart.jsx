// HistoricalChart.jsx
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

export default function HistoricalChart({ base, target }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!base || !target) return;

    const fetchHistoricalData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const today = new Date().toISOString().split("T")[0];
        const past = new Date();
        past.setDate(past.getDate() - 30);
        const pastDate = past.toISOString().split("T")[0];

        const response = await fetch(
          `https://api.frankfurter.app/${pastDate}..${today}?from=${base}&to=${target}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch historical data');
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        const formatted = Object.entries(result.rates).map(([date, val]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: date,
          rate: val[target],
        }));
        
        setData(formatted);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Could not load historical data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [base, target]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-lg border border-gray-200">
          <p className="text-gray-700 font-medium">{label}</p>
          <p className="text-blue-600 font-bold">
            {payload[0].value} {target}
          </p>
          <p className="text-gray-500 text-sm">1 {base} = {payload[0].value} {target}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-500">Loading historical data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2">No historical data available</p>
        </div>
      </div>
    );
  }

  // Calculate min, max and average for display
  const rates = data.map(item => item.rate);
  const minRate = Math.min(...rates).toFixed(4);
  const maxRate = Math.max(...rates).toFixed(4);
  const avgRate = (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(4);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-sm text-blue-700">Lowest</div>
          <div className="font-bold text-blue-900">{minRate}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-sm text-green-700">Average</div>
          <div className="font-bold text-green-900">{avgRate}</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg text-center">
          <div className="text-sm text-red-700">Highest</div>
          <div className="font-bold text-red-900">{maxRate}</div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorRate)"
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        Fluctuations of {base} to {target} over the past 30 days
      </div>
    </div>
  );
}