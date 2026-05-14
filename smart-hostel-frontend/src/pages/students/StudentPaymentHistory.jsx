// src/pages/students/StudentPaymentHistory.jsx
import { useEffect, useState } from "react";
import api from "../../api/api";

function formatMonth(monthYear) {
  // monthYear = "2026-02"
  if (!monthYear) return "-";
  const [y, m] = monthYear.split("-");
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const idx = Number(m) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx > 11) return monthYear;
  return `${months[idx]} ${y}`;
}

function formatLKR(amount) {
  if (amount == null) return "-";
  // amount may come as number or string ("18500.00")
  const n = Number(amount);
  if (Number.isNaN(n)) return `Rs. ${amount}`;
  return `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dt) {
  // dt may be "2026-02-27T12:34:56"
  if (!dt) return "-";
  return String(dt).slice(0, 10); // YYYY-MM-DD
}

export default function StudentPaymentHistory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);

  const userId = localStorage.getItem("userId");

  const load = async () => {
    if (!userId) {
      setError("User ID not found. Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/api/payments/my/${userId}`);
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load payment history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold text-white">My Payment History</h2>
        <p className="text-slate-400 text-sm mt-1">
          View all your previous hostel fee payments.
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="bg-[#0d1733]/70 rounded-xl shadow-lg border border-slate-800 p-6">
          <p className="text-slate-300 text-sm">Loading payments...</p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="bg-[#0d1733]/70 rounded-xl shadow-lg border border-slate-800 p-6 space-y-3">
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && payments.length === 0 && (
        <div className="bg-[#0d1733]/70 rounded-xl shadow-lg border border-slate-800 p-6">
          <p className="text-slate-200 font-medium">No payments yet.</p>
          <p className="text-slate-400 text-sm mt-1">
            Once you make a payment, it will appear here.
          </p>
        </div>
      )}

      {/* TABLE */}
      {!loading && !error && payments.length > 0 && (
        <div className="bg-[#0d1733]/70 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
          {/* TOP BAR */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-300">
              Total {payments.length} payments
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left">Month</th>
                  <th className="px-6 py-3 text-left">Payment ID</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Paid On</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {payments.map((p) => {
                  const status = (p.status || "PAID").toUpperCase();

                  const badgeClass =
                    status === "PAID"
                      ? "bg-green-600 text-white"
                      : status === "PENDING"
                      ? "bg-yellow-600 text-white"
                      : "bg-red-600 text-white";

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-6 py-3 text-slate-200">
                        {formatMonth(p.monthYear)}
                      </td>

                      <td className="px-6 py-3 text-slate-400">
                        {p.id}
                      </td>

                      <td className="px-6 py-3 font-medium text-slate-100">
                        {formatLKR(p.amount)}
                      </td>

                      <td className="px-6 py-3 text-slate-300">
                        {formatDate(p.createdAt)}
                      </td>

                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${badgeClass}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}