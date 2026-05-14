// src/pages/admin/ai/EnergyDataUpload.jsx
import { useState, useEffect } from "react";
import api from "../../../api/api";

export default function EnergyDataUpload() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterBlock, setFilterBlock] = useState("A");

  const [form, setForm] = useState({
    blockCode: "A",
    recordDate: new Date().toISOString().split("T")[0],
    consumptionKwh: "",
    costPerKwh: "35.00",
    meterReadingStart: "",
    meterReadingEnd: "",
    notes: "",
  });

  useEffect(() => { fetchRecords(); }, [filterBlock]);

  // ✅ FIXED: Fetch by block to avoid loading all 5000 records at once
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/energy/admin/records/by-block?blockCode=${filterBlock}`);
      // Show latest 20 only
      const sorted = (res.data || []).sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
      setRecords(sorted.slice(0, 20));
    } catch (err) {
      console.error("Failed to fetch records:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.consumptionKwh || Number(form.consumptionKwh) <= 0) return setError("Consumption (kWh) is required.");
    try {
      setSubmitting(true);
      await api.post("/api/energy/admin/records", {
        blockCode: form.blockCode,
        recordDate: form.recordDate,
        consumptionKwh: Number(form.consumptionKwh),
        costPerKwh: Number(form.costPerKwh) || 35.0,
        meterReadingStart: form.meterReadingStart ? Number(form.meterReadingStart) : null,
        meterReadingEnd: form.meterReadingEnd ? Number(form.meterReadingEnd) : null,
        notes: form.notes || null,
      });
      setSuccess(`Energy data for Block ${form.blockCode} on ${form.recordDate} saved!`);
      setForm({ ...form, consumptionKwh: "", meterReadingStart: "", meterReadingEnd: "", notes: "" });
      setFilterBlock(form.blockCode);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save energy data.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`/api/energy/admin/records/${id}`);
      fetchRecords();
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Energy Consumption – Data Entry</h2>
        <p className="text-gray-500">Upload monthly energy usage data for AI-based forecasting.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-700 text-sm">✅ {success}</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-700 text-sm">❌ {error}</div>
      )}

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Add Energy Record</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Block *</label>
              <select name="blockCode" value={form.blockCode} onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="A">Block A</option>
                <option value="B">Block B</option>
                <option value="C">Block C</option>
                <option value="D">Block D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Record Date *</label>
              <input type="date" name="recordDate" value={form.recordDate} onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Consumption (kWh) *</label>
              <input type="number" name="consumptionKwh" value={form.consumptionKwh} onChange={handleChange}
                placeholder="e.g. 520" min="0" step="0.01"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Cost per kWh (LKR)</label>
              <input type="number" name="costPerKwh" value={form.costPerKwh} onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Meter Start</label>
              <input type="number" name="meterReadingStart" value={form.meterReadingStart} onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Meter End</label>
              <input type="number" name="meterReadingEnd" value={form.meterReadingEnd} onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <input type="text" name="notes" value={form.notes} onChange={handleChange}
              placeholder="Optional notes..."
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button type="submit" disabled={submitting}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition ${
              submitting ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}>
            {submitting ? "Saving..." : "Save Record"}
          </button>
        </form>
      </div>

      {/* Existing Records */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-800">
            Existing Records — Block {filterBlock} (latest 20)
          </h3>
          {/* ✅ Block filter */}
          <select value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="A">Block A</option>
            <option value="B">Block B</option>
            <option value="C">Block C</option>
            <option value="D">Block D</option>
          </select>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Loading...</div>
        ) : records.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No energy records for Block {filterBlock}.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Block</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">kWh</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Cost/kWh</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Total Cost</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">{r.recordDate}</td>
                    <td className="px-4 py-2 text-gray-600">Block {r.blockCode}</td>
                    <td className="px-4 py-2 text-right text-gray-800">{r.consumptionKwh}</td>
                    <td className="px-4 py-2 text-right text-gray-500">{r.costPerKwh}</td>
                    <td className="px-4 py-2 text-right text-emerald-600">
                      {r.totalCost ? `LKR ${Number(r.totalCost).toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => handleDelete(r.id)}
                        className="text-xs px-2 py-1 rounded border border-red-300 text-red-500 hover:bg-red-50">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}