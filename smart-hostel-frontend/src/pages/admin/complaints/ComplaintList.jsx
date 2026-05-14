// src/pages/admin/complaints/ComplaintList.jsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/api";

export default function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/complaints/admin/all");
      setComplaints(res.data);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    return [...new Set(complaints.map((c) => c.category).filter(Boolean))].sort();
  }, [complaints]);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        !search.trim() ||
        (c.userName && c.userName.toLowerCase().includes(search.toLowerCase())) ||
        (c.roomCode && c.roomCode.toLowerCase().includes(search.toLowerCase())) ||
        (c.subject && c.subject.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, categoryFilter, statusFilter, complaints]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/api/complaints/admin/update/${id}`, { status });
      fetchComplaints();
    } catch (err) {
      alert("Failed to update complaint status.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading complaints...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Complaint Management</h1>
          <p className="text-sm text-gray-500">View and manage all student complaints. ({complaints.length} total)</p>
        </div>
        <Link
          to="/admin/complaints/analytics"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
        >
          View Analytics
        </Link>
      </div>

      {/* Filters + Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white text-gray-800 border border-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white text-gray-800 border border-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search by student, room or subject..."
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
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{c.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{c.userName}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{c.subject}</td>
                  <td className="px-4 py-3 text-gray-600">{c.category}</td>
                  <td className="px-4 py-3 text-gray-600">{c.roomCode || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      c.status === "RESOLVED" ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : c.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : c.status === "REJECTED" ? "bg-gray-100 text-gray-600 border border-gray-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {/* ✅ FIXED: correct route path */}
                    <Link
                      to={`/admin/complaints/view/${c.id}`}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      View
                    </Link>
                    {c.status === "PENDING" && (
                      <>
                        <button onClick={() => handleUpdateStatus(c.id, "IN_PROGRESS")} className="text-xs text-amber-600 hover:text-amber-700">Start</button>
                        <button onClick={() => handleUpdateStatus(c.id, "RESOLVED")} className="text-xs text-blue-600 hover:text-blue-700">Resolve</button>
                      </>
                    )}
                    {c.status === "IN_PROGRESS" && (
                      <button onClick={() => handleUpdateStatus(c.id, "RESOLVED")} className="text-xs text-blue-600 hover:text-blue-700">Resolve</button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-400">No complaints found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}