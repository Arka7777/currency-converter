// src/components/HistoricalChart.jsx
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

  useEffect(() => {
    if (!base || !target) return;

    const today = new Date().toISOString().split("T")[0];
    const past = new Date();
    past.setDate(past.getDate() - 30);
    const pastDate = past.toISOString().split("T")[0];

    fetch(
      `https://api.frankfurter.app/${pastDate}..${today}?from=${base}&to=${target}`
    )
      .then((res) => res.json())
      .then((res) => {
        const formatted = Object.entries(res.rates).map(([date, val]) => ({
          date,
          rate: val[target],
        }));
        setData(formatted);
      })
      .catch((err) => console.error("Error fetching history:", err));
  }, [base, target]);

  if (data.length === 0) return null;

  return (
    <div className="mt-6 p-6 bg-white rounded-2xl shadow-xl">
      <h3 className="text-xl font-bold mb-4 text-center text-blue-700">
        📊 {base} → {target} (Last 30 Days)
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          {/* Gradient under the line */}
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              fontSize: "14px",
            }}
          />

          {/* Animated area */}
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#2563eb"
            strokeWidth={3}
            fill="url(#colorRate)"
            animationDuration={1500}
            animationEasing="ease-out"
          />

          {/* Animated line with hover dots */}
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#1e40af"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
