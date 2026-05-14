// src/pages/students/StudentMyOrders.jsx
import { useState, useEffect } from "react";
import api from "../../api/api";

export default function StudentMyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/canteen/orders/my");
      setOrders(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = (status) => {
    if (status === "CONFIRMED")
      return "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40";
    if (status === "CANCELLED")
      return "bg-rose-600/20 text-rose-300 border border-rose-500/40";
    return "bg-amber-600/20 text-amber-300 border border-amber-500/40";
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white">My Orders</h2>
        <p className="text-sm text-slate-400 mt-1">
          View your meal reservation history and status.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-slate-400 text-sm">Loading orders...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && orders.length === 0 && (
        <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-10 text-center">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-slate-300 font-medium">No orders yet.</p>
          <p className="text-slate-500 text-sm mt-1">
            Place a meal order to see it here.
          </p>
        </div>
      )}

      {/* Orders Table */}
      {!loading && !error && orders.length > 0 && (
        <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-800/60 text-left text-xs font-semibold text-slate-400 uppercase">
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Meal Type</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time Slot</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Special Notes</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-300">#{o.id}</td>
                    <td className="px-4 py-3 text-slate-200 font-medium">
                      {o.mealType}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{o.orderDate}</td>
                    <td className="px-4 py-3 text-slate-300">{o.timeSlot}</td>
                    <td className="px-4 py-3 text-slate-300">{o.quantity}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {o.specialNotes || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusStyle(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}