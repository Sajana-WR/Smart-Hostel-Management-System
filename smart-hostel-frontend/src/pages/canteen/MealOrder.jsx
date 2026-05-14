// src/pages/canteen/MealOrder.jsx
import { useState, useEffect, useMemo } from "react";
import api from "../../api/api";

export default function MealOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/canteen/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/api/canteen/admin/orders/${id}/status?status=${status}`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === "All" || o.status?.toUpperCase() === statusFilter.toUpperCase();
      const matchesSearch =
        !search.trim() ||
        (o.student?.fullName && o.student.fullName.toLowerCase().includes(search.toLowerCase())) ||
        (o.mealType && o.mealType.toLowerCase().includes(search.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, search, orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Meal Orders & Reservations</h1>
        <p className="text-sm text-gray-500">Manage online meal reservations made by students. ({orders.length} total)</p>
      </div>

      {/* Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white text-gray-800 border border-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search by student or meal type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white text-gray-800 border border-gray-300 text-sm rounded-lg px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Meal Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time Slot</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">#{o.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{o.student?.fullName || "Unknown"}</div>
                    <div className="text-xs text-gray-400">{o.student?.email || ""}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.mealType}</td>
                  <td className="px-4 py-3 text-gray-600">{o.orderDate}</td>
                  <td className="px-4 py-3 text-gray-600">{o.timeSlot}</td>
                  <td className="px-4 py-3 text-gray-600">{o.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      o.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : o.status === "CANCELLED" ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {o.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(o.id, "CONFIRMED")}
                          className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(o.id, "CANCELLED")}
                          className="text-xs px-2 py-1 rounded border border-red-300 text-red-500 hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {o.status !== "PENDING" && <span className="text-xs text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-400" colSpan={8}>No meal orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}