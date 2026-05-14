// src/pages/admin/canteen/NearbyServicesManager.jsx
import { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, Pencil, Navigation } from "lucide-react";
import api from "../../../api/api";

const CATEGORIES = ["Restaurant", "Gym", "Transport", "Shop", "Medical", "Cafe"];
const emptyForm = { name: "", description: "", distance: "", category: "Restaurant" };

export default function NearbyServicesManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/nearby-services");
      setServices(res.data);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setMsg({ type: "error", text: "Name is required." }); return; }
    setSaving(true);
    setMsg(null);
    try {
      if (editingId) {
        await api.put(`/api/nearby-services/admin/${editingId}`, form);
        setMsg({ type: "success", text: "Service updated!" });
      } else {
        await api.post("/api/nearby-services/admin", form);
        setMsg({ type: "success", text: "Service added!" });
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchServices();
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s) => {
    setEditingId(s.id);
    setForm({ name: s.name, description: s.description || "", distance: s.distance || "", category: s.category || "Restaurant" });
    setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/api/nearby-services/admin/${id}`);
      setMsg({ type: "success", text: "Service deleted!" });
      fetchServices();
    } catch (err) {
      setMsg({ type: "error", text: "Failed to delete." });
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMsg(null);
  };

  // ✅ FIXED: Forces origin to The Bunker, not user's current location
  const getDirections = (serviceName) => {
    const destination = encodeURIComponent(serviceName + " Watareka Sri Lanka");
    const url = `https://www.google.com/maps/dir/?api=1&origin=The+Bunker+Watareka+Sri+Lanka&destination=${destination}&travelmode=walking`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Manage Nearby Services</h1>
        <p className="text-sm text-gray-500 mt-1">Add, edit or remove nearby services shown to students.</p>
      </div>

      {/* Message */}
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm ${
          msg.type === "success"
            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {msg.type === "success" ? "✅" : "❌"} {msg.text}
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          {editingId ? "✏️ Edit Service" : "➕ Add New Service"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name *</label>
              <input type="text" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. The Green Kitchen"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
              <select value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Distance</label>
              <input type="text" value={form.distance}
                onChange={(e) => setForm({ ...form, distance: e.target.value })}
                placeholder="e.g. 200m"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
              <input type="text" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Sri Lankan food near hostel gate"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            {editingId && (
              <button type="button" onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            )}
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
              <Plus size={16} />
              {saving ? "Saving..." : editingId ? "Update Service" : "Add Service"}
            </button>
          </div>
        </form>
      </div>

      {/* Services List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Current Services ({services.length})</h2>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 px-6 py-8 text-gray-400 text-sm">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
            Loading...
          </div>
        ) : services.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">
            <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
            No services added yet. Add your first one above!
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Distance</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                      {s.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.distance || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">{s.description || "—"}</td>
                  <td className="px-4 py-3 text-right space-x-1">
                    {/* ✅ Directions from The Bunker */}
                    <button onClick={() => getDirections(s.name)}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-blue-400 text-blue-600 hover:bg-blue-50">
                      <Navigation size={12} /> Directions
                    </button>
                    <button onClick={() => handleEdit(s)}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-emerald-400 text-emerald-600 hover:bg-emerald-50">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(s.id, s.name)}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-red-400 text-red-500 hover:bg-red-50">
                      <Trash2 size={12} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Google Maps */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">📍 The Bunker — Location Map</h2>
        <p className="text-xs text-gray-400 mb-4">Use the map to find nearby places and add them above.</p>
        <div className="rounded-xl overflow-hidden border border-gray-200 h-[420px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.5620644137216!2d80.0365366753166!3d6.822994493174801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253ed07449f6d%3A0x2c5639ddd7c1819e!2sThe%20Bunker!5e0!3m2!1sen!2slk!4v1777919155679!5m2!1sen!2slk"
            width="100%" height="100%" style={{ border: 0 }}
            allowFullScreen="" loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="The Bunker Hostel Location"
          />
        </div>
      </div>

    </div>
  );
}