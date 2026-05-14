// src/pages/admin/payments/PaymentVerification.jsx
import { useState, useEffect } from "react";
import api from "../../../api/api";

export default function PaymentVerification() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/payments/admin/by-status?status=PENDING");
      setPayments(res.data);
    } catch (err) {
      console.error("Failed to fetch pending payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedPayment = payments.find((p) => p.id === selectedId);

  const handleVerify = async () => {
    if (!selectedId) return;
    if (!window.confirm("Approve this payment?")) return;
    try {
      setActionLoading(true);
      await api.put(`/api/payments/admin/${selectedId}/verify`);
      setMessage({ type: "success", text: "Payment verified successfully!" });
      setSelectedId(null);
      fetchPending();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to verify." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedId) return;
    if (!window.confirm("Reject this payment?")) return;
    try {
      setActionLoading(true);
      await api.put(`/api/payments/admin/${selectedId}/reject`);
      setMessage({ type: "success", text: "Payment rejected." });
      setSelectedId(null);
      fetchPending();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to reject." });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading pending payments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Payment Verification</h1>
        <p className="text-gray-500 text-sm">
          Review and approve hostel fee payments that require manual verification.
        </p>
      </div>

      {message && (
        <div className={`rounded-xl p-4 text-sm ${
          message.type === "success"
            ? "bg-emerald-50 border border-emerald-300 text-emerald-700"
            : "bg-red-50 border border-red-300 text-red-700"
        }`}>
          {message.type === "success" ? "✅" : "❌"} {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Pending List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Pending Payments</h2>
            <span className="text-xs text-gray-400">{payments.length} to verify</span>
          </div>

          <div className="divide-y divide-gray-100">
            {payments.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedId(p.id); setMessage(null); }}
                className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition ${
                  selectedId === p.id ? "bg-emerald-50" : "hover:bg-gray-50"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {p.studentName || "Unknown"} – LKR {Number(p.amount).toLocaleString("en-LK")}
                  </div>
                  <div className="text-xs text-gray-400">
                    Room {p.roomCode || "—"} • {p.monthYear} • {p.method}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                </div>
              </button>
            ))}

            {payments.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No pending payments to verify. 🎉
              </div>
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Payment Details</h2>

          {!selectedPayment && (
            <p className="text-sm text-gray-400">
              Select a payment from the list to review details and verify.
            </p>
          )}

          {selectedPayment && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Student</p>
                <p className="font-semibold text-gray-800">{selectedPayment.studentName}</p>
                <p className="text-xs text-gray-400">{selectedPayment.studentEmail}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Amount</p>
                  <p className="font-semibold text-gray-800">LKR {Number(selectedPayment.amount).toLocaleString("en-LK")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Month</p>
                  <p className="font-semibold text-gray-800">{selectedPayment.monthYear}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Room</p>
                  <p className="text-gray-600">{selectedPayment.roomCode || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Method</p>
                  <p className="text-gray-600">{selectedPayment.method}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Date</p>
                  <p className="text-gray-600">
                    {selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Payment ID</p>
                  <p className="text-gray-600">#{selectedPayment.id}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-3 py-2 text-xs rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                >
                  {actionLoading ? "..." : "Reject Payment"}
                </button>
                <button
                  onClick={handleVerify}
                  disabled={actionLoading}
                  className="px-3 py-2 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? "Verifying..." : "Approve & Verify"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}