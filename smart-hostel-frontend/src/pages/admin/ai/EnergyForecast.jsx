// src/pages/admin/ai/EnergyForecast.jsx
import { useState, useEffect } from "react";
import api from "../../../api/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

export default function EnergyForecast() {
  const [analytics, setAnalytics] = useState(null);
  const [trend, setTrend] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, trendRes, forecastRes] = await Promise.allSettled([
        api.get("/api/energy/admin/analytics"),
        api.get("/api/energy/admin/trend?months=6"),
        api.get("/api/energy/admin/forecast"),
      ]);
      if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value.data);
      if (trendRes.status === "fulfilled") setTrend(trendRes.value.data);
      if (forecastRes.status === "fulfilled") setForecast(forecastRes.value.data);
    } catch (err) {
      console.error("Failed to fetch energy data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading energy data...</span>
      </div>
    );
  }

  const chartLabels = trend.map((t) => t.month);
  const blocks = ["A", "B", "C", "D"];
  const blockColors = {
    A: { border: "#3b82f6", bg: "rgba(59,130,246,0.2)" },
    B: { border: "#22c55e", bg: "rgba(34,197,94,0.2)" },
    C: { border: "#eab308", bg: "rgba(234,179,8,0.2)" },
    D: { border: "#ec4899", bg: "rgba(236,72,153,0.2)" },
  };

  const lineDatasets = blocks
    .filter((b) => trend.some((t) => t[b] !== undefined))
    .map((b) => ({
      label: `Block ${b}`,
      data: trend.map((t) => t[b] || 0),
      borderColor: blockColors[b]?.border || "#94a3b8",
      backgroundColor: blockColors[b]?.bg || "rgba(148,163,184,0.2)",
      tension: 0.3,
    }));

  const totalDataset = {
    label: "Total kWh",
    data: trend.map((t) => t.total || 0),
    backgroundColor: "rgba(34,197,94,0.4)",
    borderColor: "#22c55e",
    borderWidth: 1,
  };

  // Light theme chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#374151" } },
    },
    scales: {
      x: { ticks: { color: "#6b7280" }, grid: { color: "rgba(156,163,175,0.2)" } },
      y: { ticks: { color: "#6b7280" }, grid: { color: "rgba(156,163,175,0.2)" } },
    },
  };

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Energy Usage Forecast (AI Prediction)</h2>
        <p className="text-gray-500">Energy consumption trends and AI-powered forecasting.</p>
      </div>

      {/* Analytics Cards */}
      {analytics && analytics.totalRecords > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Consumption" value={`${analytics.totalConsumption} kWh`} color="text-emerald-600" />
          <StatCard label="Total Cost" value={`LKR ${Number(analytics.totalCost || 0).toLocaleString()}`} color="text-amber-600" />
          <StatCard label="Highest Block" value={`Block ${analytics.highestBlock}`} color="text-red-500" />
          <StatCard label="Lowest Block" value={`Block ${analytics.lowestBlock}`} color="text-blue-600" />
        </div>
      )}

      {/* Line Chart */}
      {trend.length > 0 ? (
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Monthly Consumption by Block</h3>
          <Line data={{ labels: chartLabels, datasets: lineDatasets }} options={chartOptions} height={100} />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm text-center">
          <p className="text-gray-400">No energy data available. Upload data in the Energy Data Upload page.</p>
        </div>
      )}

      {/* Bar Chart */}
      {trend.length > 0 && (
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Total Monthly Consumption</h3>
          <Bar data={{ labels: chartLabels, datasets: [totalDataset] }} options={chartOptions} height={80} />
        </div>
      )}

      {/* AI Forecast */}
      {forecast && !forecast.message && (
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">AI Forecast — {forecast.forecastMonth}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <p className="text-xs text-gray-500">Predicted Total</p>
              <p className="text-xl font-bold text-emerald-600">{forecast.totalForecast} kWh</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
              <p className="text-xs text-gray-500">Method</p>
              <p className="text-sm text-gray-700">{forecast.method}</p>
            </div>
          </div>

          {forecast.forecastByBlock && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase font-semibold">Forecast by Block</p>
              {Object.entries(forecast.forecastByBlock).map(([block, value]) => (
                <div key={block} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-4 py-2">
                  <span className="text-gray-700 text-sm">Block {block}</span>
                  <span className="text-emerald-600 font-semibold">{value} kWh</span>
                </div>
              ))}
            </div>
          )}

          {forecast.note && (
            <p className="mt-4 text-xs text-gray-400 italic">{forecast.note}</p>
          )}
        </div>
      )}

      {forecast && forecast.message && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-amber-700 text-sm">
          ℹ️ {forecast.message}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-lg font-semibold ${color}`}>{value}</p>
    </div>
  );
}