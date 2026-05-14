// src/pages/admin/students/StudentList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/api";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => { filterStudents(); }, [search, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/students/admin/all");
      setStudents(res.data);
      setFiltered(res.data);
    } catch (err) {
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!search.trim()) { setFiltered(students); return; }
    const keyword = search.toLowerCase();
    setFiltered(students.filter((s) =>
      s.fullName?.toLowerCase().includes(keyword) ||
      s.email?.toLowerCase().includes(keyword) ||
      s.username?.toLowerCase().includes(keyword) ||
      String(s.id).includes(keyword)
    ));
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/api/students/admin/${id}`);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete student.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading students...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-red-500">{error}</p>
        <button onClick={fetchStudents} className="mt-3 text-sm text-emerald-600 hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Student List</h2>
          <p className="text-sm text-gray-500">Overview of all hostel students. ({filtered.length} total)</p>
        </div>
        <Link
          to="/admin/students/add"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm"
        >
          + Add Student
        </Link>
      </div>

      {/* Search bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by name, email or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Degree</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-400">
                  {search ? "No students match your search." : "No students found."}
                </td>
              </tr>
            ) : (
              filtered.map((s, index) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{index + 1}</td>
                  <td className="px-4 py-3 text-gray-700">{s.fullName}</td>
                  <td className="px-4 py-3 text-gray-500">{s.email}</td>
                  <td className="px-4 py-3 text-gray-500">{s.username}</td>
                  <td className="px-4 py-3 text-gray-700">{s.degree || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      s.surveyCompleted
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}>
                      {s.surveyCompleted ? "Active" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {/* ✅ FIXED: correct route paths matching App.jsx */}
                    <Link
                      to={`/admin/students/view/${s.id}`}
                      className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      View
                    </Link>
                    <Link
                      to={`/admin/students/edit/${s.id}`}
                      className="text-xs px-2 py-1 rounded border border-emerald-400 text-emerald-600 hover:bg-emerald-50"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id, s.fullName)}
                      className="text-xs px-2 py-1 rounded border border-red-400 text-red-500 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}