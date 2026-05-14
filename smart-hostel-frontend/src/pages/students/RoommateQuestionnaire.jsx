// src/pages/students/RoommateQuestionnaire.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

const FIELDS = [
  { key: "degree", label: "Degree", type: "select", required: true, options: ["Software Engineering", "Computer Science", "IT", "Business", "Engineering", "Other"] },
  { key: "hometown", label: "Hometown", type: "text", required: true, placeholder: "e.g., Kurunegala" },
  { key: "school", label: "School", type: "text", required: true, placeholder: "e.g., Maliyadeva College" },
  { key: "preferredStudyTime", label: "Preferred Study Time", type: "select", required: true, options: ["Morning", "Evening", "Night"] },
  { key: "typicalSleepTime", label: "Typical Sleep Time", type: "select", required: true, options: ["Early (before 10PM)", "Normal (10PM–12AM)", "Late (after 12AM)"], mapValue: (v) => (v.startsWith("Early") ? "Early" : v.startsWith("Normal") ? "Normal" : "Late") },
  { key: "wakeUpTime", label: "Typical Wake-up Time", type: "select", required: true, options: ["Before 6AM", "6AM–8AM", "After 8AM"] },
  { key: "cleanlinessPreference", label: "Cleanliness Preference", type: "select", required: true, options: ["Very Clean", "Moderate", "Relaxed"] },
  { key: "noiseTolerance", label: "Music & Noise Tolerance", type: "select", required: true, options: ["Low Noise Only", "Medium", "High / No problem"], mapValue: (v) => (v.startsWith("Low") ? "Low" : v.startsWith("Medium") ? "Medium" : "High") },
  { key: "guestFrequency", label: "Guest Frequency", type: "select", required: true, options: ["Never", "Sometimes", "Often"] },
  { key: "smokingPreference", label: "Smoking Preference", type: "select", required: true, options: ["Non-smoker", "Okay with smoker", "Smoker"], mapValue: (v) => (v === "Non-smoker" ? "No" : v === "Okay with smoker" ? "Ok" : "Yes") },
  { key: "personalityType", label: "Personality Type", type: "select", required: true, options: ["Introvert", "Ambivert", "Extrovert"] },
  { key: "roomTempPreference", label: "Room Temperature Preference (Optional)", type: "select", required: false, options: ["Cold", "Normal", "Warm"] },
  { key: "sharingPreference", label: "Sharing Preference (Optional)", type: "select", required: false, options: ["Share everything", "Share some things", "Prefer separate"] },
];

export default function RoommateQuestionnaire() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);

  const initialForm = useMemo(() => {
    const obj = {};
    FIELDS.forEach((f) => (obj[f.key] = ""));
    return obj;
  }, []);

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoadingExisting(false); return; }
    fetch(`${API_BASE}/api/survey/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        const existing = data?.data || {};
        if (existing && Object.keys(existing).length > 0) setForm((prev) => ({ ...prev, ...existing }));
      })
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  }, []);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const missing = FIELDS.filter((f) => f.required && !String(form[f.key] || "").trim()).map((f) => f.label);
    if (missing.length) return `Please fill: ${missing.join(", ")}`;
    return "";
  };

  const buildPayload = (userId) => {
    const payload = { userId };
    FIELDS.forEach((f) => {
      const raw = form[f.key];
      if (!raw) return;
      payload[f.key] = f.mapValue ? f.mapValue(raw) : raw;
    });
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      const userIdStr = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (!userIdStr) throw new Error("User not found. Please login again.");
      if (!token) throw new Error("Session expired. Please login again.");
      const payload = buildPayload(Number(userIdStr));
      const res = await fetch(`${API_BASE}/api/survey/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = "Failed to save questionnaire";
        try { const data = await res.json(); msg = data?.message || data?.error || msg; } catch { const text = await res.text(); if (text) msg = text; }
        if (res.status === 401) msg = "Unauthorized. Please login again.";
        throw new Error(msg);
      }
      localStorage.setItem("surveyCompleted", "true");
      navigate("/students/ai/roommate-results");
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-2">
        AI Roommate Matching – Questionnaire
      </h1>
      <p className="text-slate-400 mb-6">
        Answer these questions so the system can suggest compatible roommates.
      </p>

      <form onSubmit={handleSubmit} className="bg-[#0d1733]/70 border border-slate-800 rounded-2xl p-6 space-y-6">
        {loadingExisting && (
          <div className="text-slate-400 text-sm">Loading your saved answers...</div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-sm text-slate-300 font-medium block mb-2">
              {f.label}
              {f.required && <span className="text-red-400"> *</span>}
            </label>

            {f.type === "select" ? (
              <select
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                required={f.required}
              >
                <option value="">Select an option</option>
                {f.options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
              </select>
            ) : (
              <input
                type="text"
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder={f.placeholder || ""}
                required={f.required}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className={`w-full transition px-4 py-3 rounded-lg font-semibold text-white
            ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Saving..." : "Save Questionnaire"}
        </button>
      </form>
    </div>
  );
}