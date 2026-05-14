// src/pages/admin/payments/PaymentHistory.jsx
import { useState, useEffect, useMemo } from "react";
import api from "../../../api/api";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentFilter, setStudentFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("All");

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

  const years = useMemo(() => {
    const unique = [...new Set(payments.map((p) => p.monthYear?.substring(0, 4)).filter(Boolean))];
    return unique.sort().reverse();
  }, [payments]);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchesStudent =
        !studentFilter.trim() ||
        (p.studentName && p.studentName.toLowerCase().includes(studentFilter.toLowerCase())) ||
        (p.studentEmail && p.studentEmail.toLowerCase().includes(studentFilter.toLowerCase())) ||
        String(p.id).includes(studentFilter);
      const matchesYear = yearFilter === "All" || (p.monthYear && p.monthYear.startsWith(yearFilter));
      return matchesStudent && matchesYear;
    });
  }, [studentFilter, yearFilter, payments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading payment history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Payment History</h1>
        <p className="text-gray-500 text-sm">View historical payment records by student. ({payments.length} total)</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Student</label>
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Year</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>All</option>
            {years.map((y) => (<option key={y} value={y}>{y}</option>))}
          </select>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
          Timeline ({filtered.length} records)
        </div>

        <div className="divide-y divide-gray-100">
          {filtered.map((p) => (
            <div key={p.id} className="px-4 py-4 flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`h-3 w-3 rounded-full shadow-sm ${
                  p.status === "PAID" ? "bg-emerald-500" :
                  p.status === "FAILED" ? "bg-red-500" : "bg-amber-500"
                }`} />
                <div className="flex-1 w-px bg-gray-200" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {p.monthYear} – LKR {Number(p.amount).toLocaleString("en-LK")}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {p.studentName || "Unknown"} • Room {p.roomCode || "—"}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex px-2 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    {p.method}
                  </span>
                  <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-medium ${
                    p.status === "PAID"
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : p.status === "FAILED"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No payment history found for this student / year.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}