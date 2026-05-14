import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

export default function EditProfile() {
  const navigate = useNavigate();

  const token   = useMemo(() => localStorage.getItem("token"), []);
  const emailLS = useMemo(() => localStorage.getItem("email"), []);

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");
  const [msgType, setMsgType] = useState("info");

  const [form, setForm] = useState({
    fullName: "", email: "", degree: "", hometown: "", school: "",
  });

  // ✅ Load existing profile
  useEffect(() => {
    const controller = new AbortController();
    async function loadProfile() {
      setLoading(true); setMsg(""); setMsgType("info");
      if (!token && !emailLS) {
        setLoading(false); setMsgType("error");
        setMsg("Not logged in. Please login again."); return;
      }
      const config = { signal: controller.signal, headers: {}, params: {} };
      if (token) config.headers.Authorization = `Bearer ${token}`;
      else config.params.email = emailLS;
      try {
        const res = await axios.get(`${API_BASE}/api/students/me`, config);
        const d = res.data;
        setForm({
          fullName: d.fullName || "", email: d.email || "",
          degree: d.degree || "", hometown: d.hometown || "", school: d.school || "",
        });
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          setMsgType("error"); setMsg("Unauthorized. Please login again.");
          setTimeout(() => navigate("/login"), 600);
        } else { setMsgType("error"); setMsg("Failed to load profile."); }
      } finally { setLoading(false); }
    }
    loadProfile();
    return () => controller.abort();
  }, [navigate, token, emailLS]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  }

  // ✅ Save changes
  async function onSubmit(e) {
    e.preventDefault(); setSaving(true); setMsg(""); setMsgType("info");
    try {
      const config = { headers: {} };
      if (token) config.headers.Authorization = `Bearer ${token}`;
      const res = await axios.put(`${API_BASE}/api/students/me`, form, config);
      if (res.data?.email) localStorage.setItem("email", res.data.email);
      setMsgType("success"); setMsg("Profile updated successfully ✅");
      setTimeout(() => navigate("/students/profile"), 700);
    } catch (err) {
      const status    = err?.response?.status;
      const serverMsg = err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : "");
      if (status === 401 || status === 403) {
        localStorage.removeItem("token");
        setMsgType("error"); setMsg("Unauthorized. Please login again.");
        setTimeout(() => navigate("/login"), 600);
      } else { setMsgType("error"); setMsg(serverMsg || "Failed to save changes."); }
    } finally { setSaving(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center gap-3">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
      <span className="text-slate-400 text-sm">Loading profile...</span>
    </div>
  );

  return (
    // ── Dark full-screen, NO sidebar ─────────────────────────
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

      {/* ── Top bar ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-8 py-3 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/students/profile")}
          className="flex items-center gap-2 text-sm text-slate-400 border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-100 transition"
        >
          ← Back to Profile
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-100">Edit Profile</p>
          <p className="text-xs text-slate-500">Update your personal information</p>
        </div>
      </div>

      {/* ── Centered form ── */}
      <div className="flex-1 flex justify-center py-10 px-4">
        <div className="w-full max-w-xl space-y-5">

          <div>
            <h1 className="text-2xl font-semibold text-slate-100">Edit Profile</h1>
            <p className="text-sm text-slate-400 mt-1">Changes will be saved to your account.</p>
          </div>

          {/* Message banner */}
          {msg && (
            <div className={`text-sm rounded-lg px-4 py-3 border ${
              msgType === "success" ? "bg-emerald-900/20 border-emerald-800 text-emerald-300" :
              msgType === "error"   ? "bg-red-900/20 border-red-800 text-red-300"             :
                                     "bg-slate-800 border-slate-700 text-slate-300"
            }`}>
              {msg}
            </div>
          )}

          {/* ── Card ── */}
          <form onSubmit={onSubmit}>
            <div className="bg-[#0f1b3b] border border-slate-800 rounded-xl p-7 space-y-5 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 pb-3 border-b border-slate-800">
                Personal Information
              </p>

              <div className="grid grid-cols-2 gap-5">

                <DarkField label="Full Name" cls="col-span-2">
                  <input
                    name="fullName" value={form.fullName} onChange={onChange}
                    type="text" required placeholder="Enter full name"
                    className="dark-input"
                  />
                </DarkField>

                <DarkField label="Email Address" cls="col-span-2">
                  <input
                    name="email" value={form.email} onChange={onChange}
                    type="email" required placeholder="Enter email address"
                    className="dark-input"
                  />
                </DarkField>

                <DarkField label="Degree">
                  <input
                    name="degree" value={form.degree} onChange={onChange}
                    type="text" placeholder="e.g. Software Engineering"
                    className="dark-input"
                  />
                </DarkField>

                <DarkField label="Hometown">
                  <input
                    name="hometown" value={form.hometown} onChange={onChange}
                    type="text" placeholder="e.g. Kurunegala"
                    className="dark-input"
                  />
                </DarkField>

                <DarkField label="School" cls="col-span-2">
                  <input
                    name="school" value={form.school} onChange={onChange}
                    type="text" placeholder="e.g. Maliyadeva College"
                    className="dark-input"
                  />
                </DarkField>

              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => navigate("/students/profile")}
                className="px-6 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-7 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

function DarkField({ label, children, cls = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${cls}`}>
      <label className="text-sm text-slate-400">{label}</label>
      {children}
    </div>
  );
}