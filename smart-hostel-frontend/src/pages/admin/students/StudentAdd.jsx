// src/pages/admin/students/StudentAdd.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api/api";

export default function StudentAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    degree: "",
    hometown: "",
    school: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim()) return setError("Full name is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (!form.username.trim()) return setError("Username is required.");
    if (!form.password || form.password.length < 6) return setError("Password must be at least 6 characters.");

    try {
      setLoading(true);
      await api.post("/api/auth/register", {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/students");
      }, 1500);

    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || "Failed to add student. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Add New Student</h2>
        <Link to="/admin/students" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to list
        </Link>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-700 text-sm">
          ✅ Student added successfully! Redirecting to student list...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-700 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} placeholder="e.g. Kamal Perera" required />
          <Field label="Username" name="username" value={form.username} onChange={handleChange} placeholder="e.g. kamal123" required />
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="e.g. kamal@gmail.com" required />
          <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
          <Field label="Degree / Course" name="degree" value={form.degree} onChange={handleChange} placeholder="e.g. BSc Computer Science" />
          <Field label="Hometown" name="hometown" value={form.hometown} onChange={handleChange} placeholder="e.g. Colombo" />
          <Field label="School" name="school" value={form.school} onChange={handleChange} placeholder="e.g. NSBM Green University" />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
          <Link
            to="/admin/students"
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || success}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm transition
              ${loading || success ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {loading ? "Saving..." : success ? "Saved ✓" : "Save Student"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, placeholder, required }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800
          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}