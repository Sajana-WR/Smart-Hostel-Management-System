// src/pages/admin/complaints/ComplaintView.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../../api/api";

export default function ComplaintView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        // ✅ FIXED: correct endpoint
        const res = await api.get(`/api/complaints/${id}`);
        setComplaint(res.data);
        setStatus(res.data.status || "PENDING");
      } catch (err) {
        setError("Complaint not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await api.put(`/api/complaints/admin/update/${id}`, { status });
      setSuccessMsg("Status updated successfully!");
      setComplaint((prev) => ({ ...prev, status }));
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to update status.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading complaint...</span>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="space-y-4">
        <p className="text-red-400">{error || "Complaint not found."}</p>
        <Link to="/admin/complaints" className="text-sm text-emerald-600 hover:underline">
          ← Back to Complaint List
        </Link>
      </div>
    );
  }

  const statusColor =
    complaint.status === "RESOLVED" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : complaint.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700 border-amber-200"
    : complaint.status === "REJECTED" ? "bg-gray-100 text-gray-600 border-gray-200"
    : "bg-red-100 text-red-700 border-red-200";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Complaint #{complaint.id}</h1>
          <p className="text-sm text-gray-500 mt-1">View details and update the complaint status.</p>
        </div>
        <Link to="/admin/complaints" className="text-sm text-gray-400 hover:text-gray-600">
          ← Back to Complaint List
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Complaint Details */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Complaint Details</h2>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
              {complaint.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <DetailField label="Student"      value={complaint.userName || "—"} />
            <DetailField label="Room"         value={complaint.roomCode || "—"} />
            <DetailField label="Category"     value={complaint.category || "—"} />
            <DetailField label="Submitted On" value={complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : "—"} />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Subject</p>
            <p className="text-sm text-gray-800 font-medium">{complaint.subject}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Description</p>
            <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-4 leading-relaxed">
              {complaint.description || "No description provided."}
            </p>
          </div>

          {complaint.adminResponse && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Admin Response</p>
              <p className="text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg p-4 leading-relaxed">
                {complaint.adminResponse}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT — Update Status */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Update Status</h2>

          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-3 py-2 text-sm">
              ✅ {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              ❌ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "Save Status"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/complaints")}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition"
            >
              ← Back to List
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase">{label}</p>
      <p className="mt-1 text-sm text-gray-800">{value}</p>
    </div>
  );
}