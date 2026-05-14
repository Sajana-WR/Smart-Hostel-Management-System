// src/pages/admin/ai/RoommateResult.jsx
import { useState, useEffect } from "react";
import api from "../../../api/api";

export default function RoommateResult() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [matches, setMatches] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const res = await api.get("/api/students/admin/all");
      setStudents(res.data.filter((s) => s.surveyCompleted));
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchMatches = async () => {
    if (!selectedStudent) return;
    setError(null); setInfo(null); setMatches([]); setPreferences(null);
    try {
      setLoading(true);
      const res = await api.get(`/api/matching/roommates/${selectedStudent}`);
      const data = res.data;
      setMatches(data.matches || []);
      setPreferences(data.preferences || null);
      if (data.message) setInfo(data.message);
      if (data.matches?.length === 0 && !data.message) setInfo("No matching candidates found for this student.");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch matches. Is the AI service running?";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedStudentData = students.find((s) => String(s.id) === String(selectedStudent));

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Roommate Matching – Results</h2>
        <p className="text-gray-500">Select a student to see their AI-powered roommate compatibility scores.</p>
      </div>

      {/* Student Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Select Student</label>
            {studentsLoading ? (
              <p className="text-sm text-gray-400">Loading students...</p>
            ) : (
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Choose a student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-gray-400 mt-1">{students.length} student(s) with completed surveys</p>
          </div>
          <button
            onClick={fetchMatches}
            disabled={!selectedStudent || loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              !selectedStudent || loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {loading ? "Finding Matches..." : "Find Matches"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-700 text-sm">❌ {error}</div>
      )}

      {/* Info */}
      {info && !error && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-amber-700 text-sm">ℹ️ {info}</div>
      )}

      {/* Preferences */}
      {preferences && selectedStudentData && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            {selectedStudentData.fullName}'s Preferences
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {Object.entries(preferences).map(([key, value]) => (
              <div key={key} className="bg-gray-50 border border-gray-100 rounded-lg p-2">
                <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                <p className="text-gray-800 font-medium mt-0.5">{value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Results */}
      {matches.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-800">Top Matches ({matches.length} found)</h3>

          {matches.map((m, i) => (
            <div key={m.userId || i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-800 font-medium">{m.fullName}</p>
                  <p className="text-xs text-gray-400">@{m.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  {m.allocated && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      Has Room
                    </span>
                  )}
                  <span className={`font-bold text-lg ${
                    m.score >= 80 ? "text-emerald-600" :
                    m.score >= 60 ? "text-amber-500" : "text-red-500"
                  }`}>{m.score}%</span>
                </div>
              </div>

              <div className="w-full h-3 bg-gray-100 rounded-full">
                <div
                  className={`h-3 rounded-full transition-all ${
                    m.score >= 80 ? "bg-emerald-500" :
                    m.score >= 60 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${m.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}