// src/pages/admin/students/StudentSearch.jsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/api";

export default function StudentSearch() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/students/admin/all");
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesQuery =
        !query.trim() ||
        s.fullName?.toLowerCase().includes(query.toLowerCase()) ||
        s.email?.toLowerCase().includes(query.toLowerCase()) ||
        s.username?.toLowerCase().includes(query.toLowerCase()) ||
        String(s.id).includes(query);

      const studentStatus = s.surveyCompleted ? "Active" : "Pending";
      const matchesStatus = status === "All" || studentStatus === status;

      return matchesQuery && matchesStatus;
    });
  }, [query, status, students]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading students...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Search & Filter Students</h2>
        <Link to="/admin/students" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to list
        </Link>
      </div>

      {/* Search Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Search</label>
            <input
              type="text"
              placeholder="Type name, email or username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option>All</option>
              <option>Active</option>
              <option>Pending</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-800">{filtered.length}</span> result(s)
        </p>

        <div className="border-t border-gray-100 pt-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400">No students found.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <li
                  key={s.id}
                  className="py-3 flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg px-2 transition"
                >
                  <div>
                    <p className="font-medium text-gray-800">{s.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {s.email} • {s.username} • {s.degree || "No degree"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        s.surveyCompleted
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {s.surveyCompleted ? "Active" : "Pending"}
                    </span>
                    {/* ✅ FIXED: correct route path */}
                    <Link
                      to={`/admin/students/view/${s.id}`}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}