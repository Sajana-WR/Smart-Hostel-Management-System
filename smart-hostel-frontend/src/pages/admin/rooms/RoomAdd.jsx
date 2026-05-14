// src/pages/admin/rooms/RoomAdd.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api/api";

export default function RoomAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    roomCode: "",
    block: "A",
    floor: "",
    capacity: "2",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.roomCode.trim()) return setError("Room code is required.");
    if (!form.floor) return setError("Floor is required.");

    try {
      setLoading(true);
      await api.post("/api/rooms/admin/add", {
        roomCode: form.roomCode.trim(),
        block: form.block,
        floor: parseInt(form.floor),
        capacity: parseInt(form.capacity) || 2,
      });

      setSuccess(true);
      setTimeout(() => navigate("/admin/rooms"), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add room.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Add New Room</h1>
          <p className="text-sm text-gray-500 mt-1">Define room details and capacity.</p>
        </div>
        <Link to="/admin/rooms" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to list
        </Link>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-700 text-sm">
          ✅ Room added successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-700 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-4xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <FormField label="Room Code" required>
              <input
                type="text"
                name="roomCode"
                value={form.roomCode}
                onChange={handleChange}
                placeholder="e.g. A-301"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </FormField>

            <FormField label="Block" required>
              <select
                name="block"
                value={form.block}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="A">Block A</option>
                <option value="B">Block B</option>
                <option value="C">Block C</option>
                <option value="D">Block D</option>
              </select>
            </FormField>

            <FormField label="Floor" required>
              <input
                type="number"
                name="floor"
                value={form.floor}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 3"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </FormField>

            <FormField label="Capacity (beds)">
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                min="1"
                max="4"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </FormField>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Link
              to="/admin/rooms"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || success}
              className={`px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm transition
                ${loading || success ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
            >
              {loading ? "Saving..." : success ? "Saved ✓" : "Save Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}