// src/pages/admin/payments/PaymentList.jsx
import { useState, useEffect, useMemo } from "react";
import api from "../../../api/api";

const statusColors = {
  PAID: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  PENDING: "bg-amber-100 text-amber-700 border border-amber-200",
  FAILED: "bg-red-100 text-red-700 border border-red-200",
};

export default function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/payments/admin/all");
      setPayments(res.data);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!window.confirm("Verify this payment?")) return;
    try {
      await api.put(`/api/payments/admin/${id}/verify`);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to verify payment.");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this payment?")) return;
    try {
      await api.put(`/api/payments/admin/${id}/reject`);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject payment.");
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      const matchesMethod = methodFilter === "All" || (p.method && p.method.toUpperCase().includes(methodFilter.toUpperCase()));
      const matchesSearch =
        !search.trim() ||
        (p.studentName && p.studentName.toLowerCase().includes(search.toLowerCase())) ||
        (p.studentEmail && p.studentEmail.toLowerCase().includes(search.toLowerCase())) ||
        (p.roomCode && p.roomCode.toLowerCase().includes(search.toLowerCase())) ||
        String(p.id).includes(search);
      return matchesStatus && matchesMethod && matchesSearch;
    });
  }, [statusFilter, methodFilter, search, payments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading payments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Payment List</h1>
          <p className="text-gray-500 text-sm">View and manage all hostel fee payments. ({payments.length} total)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row md:items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Search</label>
          <input
            type="text"
            placeholder="Search by student name, email or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>All</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Method</label>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>All</option>
            <option>CARD</option>
            <option>CASH</option>
            <option>BANK</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Room</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount (LKR)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800 font-medium">{p.id}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-800 font-medium">{p.studentName || "—"}</div>
                    <div className="text-xs text-gray-400">{p.studentEmail || ""}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.roomCode || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{p.monthYear}</td>
                  <td className="px-4 py-3 text-right text-gray-800 font-semibold">
                    {Number(p.amount).toLocaleString("en-LK")}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.method}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-medium ${statusColors[p.status] || statusColors.PENDING}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {p.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleVerify(p.id)}
                            className="px-2 py-1 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            className="px-2 py-1 text-xs rounded-md border border-red-300 text-red-500 hover:bg-red-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {p.status !== "PENDING" && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No payments found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}