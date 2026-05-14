// src/pages/admin/payments/FinancialReports.jsx
import { useState, useEffect, useMemo } from "react";
import api from "../../../api/api";

export default function FinancialReports() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes] = await Promise.allSettled([
        api.get("/api/payments/admin/all"),
      ]);
      if (paymentsRes.status === "fulfilled") setPayments(paymentsRes.value.data);
    } catch (err) {
      console.error("Failed to fetch financial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const totalCollected = payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalFailed = payments.filter((p) => p.status === "FAILED").reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const pendingAmount = payments.filter((p) => p.status === "PENDING").reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const months = {};
    payments.forEach((p) => {
      if (!months[p.monthYear]) months[p.monthYear] = 0;
      if (p.status === "PAID") months[p.monthYear] += Number(p.amount || 0);
    });

    const monthEntries = Object.entries(months)
      .map(([month, value]) => ({ month, value }))
      .sort((a, b) => b.month.localeCompare(a.month));

    const maxValue = monthEntries.length > 0 ? Math.max(...monthEntries.map((m) => m.value)) : 0;

    return { totalCollected, totalFailed, pendingAmount, monthEntries, maxValue };
  }, [payments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading financial reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Financial Reports</h1>
        <p className="text-gray-500 text-sm">
          Overview of hostel revenue, pending dues and monthly collections. ({payments.length} payments)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Collected"
          value={`LKR ${summary.totalCollected.toLocaleString("en-LK")}`}
          badge={`${payments.filter(p => p.status === "PAID").length} paid`}
          badgeColor="bg-emerald-100 text-emerald-700 border border-emerald-200"
        />
        <SummaryCard
          title="Pending Amount"
          value={`LKR ${summary.pendingAmount.toLocaleString("en-LK")}`}
          badge={`${payments.filter(p => p.status === "PENDING").length} pending`}
          badgeColor="bg-amber-100 text-amber-700 border border-amber-200"
        />
        <SummaryCard
          title="Failed Amount"
          value={`LKR ${summary.totalFailed.toLocaleString("en-LK")}`}
          badge={`${payments.filter(p => p.status === "FAILED").length} failed`}
          badgeColor="bg-red-100 text-red-700 border border-red-200"
        />
      </div>

      {/* Monthly Collection Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800">Monthly Collections</h2>
          <span className="text-xs text-gray-400">Based on paid payments</span>
        </div>
        {summary.monthEntries.length === 0 ? (
          <p className="text-sm text-gray-400">No payment data available yet.</p>
        ) : (
          <div className="space-y-3">
            {summary.monthEntries.map((m) => {
              const widthPercent = summary.maxValue > 0 ? Math.round((m.value / summary.maxValue) * 100) : 0;
              return (
                <div key={m.month}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-700">{m.month}</span>
                    <span className="text-gray-500">LKR {m.value.toLocaleString("en-LK")}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${widthPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Breakdown Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Payment Breakdown</h2>
          <span className="text-xs text-gray-400">All payment records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Room</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Month</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-800 font-medium">#{p.id}</td>
                  <td className="px-4 py-2">
                    <div className="text-gray-800">{p.studentName || "—"}</div>
                    <div className="text-xs text-gray-400">{p.studentEmail || ""}</div>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{p.roomCode || "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{p.monthYear}</td>
                  <td className="px-4 py-2 text-right text-gray-800">LKR {Number(p.amount).toLocaleString("en-LK")}</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{p.method}</td>
                  <td className="px-4 py-2 text-xs">
                    <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-medium ${
                      p.status === "PAID" ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : p.status === "FAILED" ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">No payment data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, badge, badgeColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase">{title}</p>
        <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-medium ${badgeColor}`}>{badge}</span>
      </div>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  );
}