// src/pages/admin/rooms/RoomEdit.jsx
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../../api/api";

export default function RoomEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const [block, setBlock] = useState("");
  const [floor, setFloor] = useState("");
  const [capacity, setCapacity] = useState(2);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/rooms/admin/${id}`);
        const room = res.data;
        setBlock(room.block || "");
        setFloor(room.floor ?? "");
        setCapacity(room.capacity || 2);
      } catch (err) {
        setError("Failed to load room details.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess("");
    try {
      await api.put(`/api/rooms/admin/${id}`, {
        block: block.trim().toUpperCase(),
        floor: Number(floor),
        capacity: Number(capacity),
      });
      setSuccess("Room updated successfully!");
      setTimeout(() => navigate("/admin/rooms"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update room.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading room...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Edit Room</h1>
          <p className="text-sm text-gray-500 mt-1">Update details for room #{id}</p>
        </div>
        <Link to="/admin/rooms" className="text-sm text-gray-400 hover:text-gray-600">
          ← Back to list
        </Link>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
          ✅ {success}
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Block */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Block</label>
            <select
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Block</option>
              <option value="A">Block A</option>
              <option value="B">Block B</option>
              <option value="C">Block C</option>
              <option value="D">Block D</option>
              <option value="E">Block E</option>
            </select>
          </div>

          {/* Floor */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Floor</label>
            <input
              type="number"
              min="0"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Capacity (beds)</label>
            <input
              type="number"
              min="1"
              max="6"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Link
              to="/admin/rooms"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}