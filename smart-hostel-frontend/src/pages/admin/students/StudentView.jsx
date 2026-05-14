// src/pages/admin/students/StudentView.jsx
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../../api/api";

export default function StudentView() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/students/admin/${id}`);
        setStudent(res.data);
      } catch (err) {
        setError("Student not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading student...</span>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-4">
        <p className="text-red-400">{error || "Student not found."}</p>
        <Link to="/admin/students" className="text-sm text-emerald-600 hover:underline">
          ← Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Student Profile</h2>
        <div className="space-x-2">
          <Link
            to={`/admin/students/edit/${student.id}`}
            className="px-3 py-2 rounded-lg border border-emerald-500 text-sm text-emerald-600 hover:bg-emerald-50"
          >
            Edit
          </Link>
          <Link to="/admin/students" className="text-sm text-gray-400 hover:text-gray-600">
            ← Back to list
          </Link>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex gap-6 items-start">

          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-emerald-100 border border-emerald-300
                          text-emerald-700 flex items-center justify-center text-3xl font-bold shadow">
            {student.fullName?.charAt(0).toUpperCase()}
          </div>

          {/* Info Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <ProfileField label="Full Name"  value={student.fullName} />
            <ProfileField label="Student ID" value={`#${student.id}`} />
            <ProfileField label="Email"      value={student.email} />
            <ProfileField label="Username"   value={student.username} />
            <ProfileField label="Degree"     value={student.degree || "—"} />
            <ProfileField label="Phone"      value={student.phone || "—"} />
            <ProfileField label="Hometown"   value={student.hometown || "—"} />
            <ProfileField label="School"     value={student.school || "—"} />
            <ProfileField label="Status"     value={student.surveyCompleted ? "Active" : "Pending"} />
            <ProfileField label="Role"       value={student.role || "STUDENT"} />
          </div>
        </div>
      </div>

      {/* Survey Info */}
      {student.surveyCompleted && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Roommate Survey Info</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <ProfileField label="Study Time"    value={student.preferredStudyTime || "—"} />
            <ProfileField label="Sleep Time"    value={student.typicalSleepTime || "—"} />
            <ProfileField label="Wake Up Time"  value={student.wakeUpTime || "—"} />
            <ProfileField label="Cleanliness"   value={student.cleanlinessPreference || "—"} />
            <ProfileField label="Noise"         value={student.noiseTolerance || "—"} />
            <ProfileField label="Personality"   value={student.personalityType || "—"} />
            <ProfileField label="Smoking"       value={student.smokingPreference ? "Yes" : "No"} />
            <ProfileField label="Guests"        value={student.guestFrequency || "—"} />
            <ProfileField label="Sharing"       value={student.sharingPreference || "—"} />
          </div>
        </div>
      )}

    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm text-gray-800">{value}</p>
    </div>
  );
}