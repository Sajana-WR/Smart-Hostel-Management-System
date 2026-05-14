// src/pages/admin/students/AdminPendingApprovals.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminPendingApprovals() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING"); // PENDING | APPROVED | REJECTED | ALL
  const [actionLoading, setActionLoading] = useState(null); // id being actioned

  async function fetchStudents() {
    setLoading(true);
    try {
      const endpoint =
        filter === "ALL"
          ? `${API_BASE}/api/admin/approvals/all`
          : `${API_BASE}/api/admin/approvals/pending`;

      const res = await axios.get(endpoint, { headers: getAuthHeaders() });

      // If not ALL mode, show only the selected status from pending list
      let data = res.data;
      if (filter !== "ALL" && filter !== "PENDING") {
        // fetch all and filter client side
        const allRes = await axios.get(`${API_BASE}/api/admin/approvals/all`, {
          headers: getAuthHeaders(),
        });
        data = allRes.data.filter((s) => s.status === filter);
      }

      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, [filter]);

  async function handleApprove(id) {
    setActionLoading(id + "-approve");
    try {
      await axios.put(
        `${API_BASE}/api/admin/approvals/${id}/approve`,
        {},
        { headers: getAuthHeaders() }
      );
      fetchStudents();
    } catch (err) {
      alert("Failed to approve student.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id) {
    if (!window.confirm("Are you sure you want to reject this student?")) return;
    setActionLoading(id + "-reject");
    try {
      await axios.put(
        `${API_BASE}/api/admin/approvals/${id}/reject`,
        {},
        { headers: getAuthHeaders() }
      );
      fetchStudents();
    } catch (err) {
      alert("Failed to reject student.");
    } finally {
      setActionLoading(null);
    }
  }

  const statusBadge = (status) => {
    const styles = {
      PENDING:  "bg-amber-500/20 text-amber-400",
      APPROVED: "bg-green-500/20 text-green-400",
      REJECTED: "bg-red-500/20 text-red-400",
    };
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || "bg-slate-700 text-slate-400"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Student Approvals</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Review and approve new student registration requests
          </p>
        </div>
        <button
          onClick={fetchStudents}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
        >
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["PENDING", "APPROVED", "REJECTED", "ALL"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === tab
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm animate-pulse">
            Loading...
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No students found for this filter.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Room Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5 font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                        {s.fullName?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                      {s.fullName}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">@{s.username}</td>
                  <td className="px-5 py-3.5 text-slate-500">{s.email}</td>
                  <td className="px-5 py-3.5">
                    {s.roomTypePreference ? (
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        s.roomTypePreference === "SINGLE"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}>
                        {s.roomTypePreference}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not specified</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {s.createdAt
                      ? new Date(s.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-5 py-3.5">{statusBadge(s.status)}</td>
                  <td className="px-5 py-3.5">
                    {s.status === "PENDING" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(s.id)}
                          disabled={!!actionLoading}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50"
                        >
                          {actionLoading === s.id + "-approve" ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(s.id)}
                          disabled={!!actionLoading}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-200 transition disabled:opacity-50"
                        >
                          {actionLoading === s.id + "-reject" ? "..." : "Reject"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}