// src/pages/students/PendingDashboard.jsx
import { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080";

export default function PendingDashboard({ student, onLogout }) {
  const name = student?.fullName || "Student";
  const initial = name.charAt(0).toUpperCase();

  const [roomPref, setRoomPref] = useState(student?.roomTypePreference || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const handleSavePreference = async () => {
    if (!roomPref) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/students/me/room-preference`,
        { roomTypePreference: roomPref },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveMsg("Preference updated successfully!");
      setEditing(false);
    } catch (err) {
      setSaveMsg("Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a1125] text-slate-100">

      {/* Sidebar */}
      <div className="w-56 bg-[#111827] border-r border-slate-800 flex flex-col py-5 flex-shrink-0">
        <div className="px-5 pb-5 border-b border-slate-800 mb-4">
          <span className="text-white font-semibold text-base">The Bunker</span>
        </div>
        <div className="px-5 mb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Overview</div>
        <div className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-300 bg-blue-600/20 border-r-2 border-blue-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </div>
        <div className="px-5 mt-4 mb-1 text-[10px] font-semibold text-slate-700 uppercase tracking-widest">Locked until approved</div>
        {["My Profile", "Room Details", "Payments", "Complaints", "Canteen", "AI Modules"].map((item) => (
          <div key={item} className="flex items-center justify-between px-5 py-2 text-sm text-slate-700 cursor-not-allowed select-none">
            <span>{item}</span>
            <svg className="w-3 h-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 px-6 border-b border-slate-800 bg-[#0d1733]/80 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-white">Student Portal</h1>
            <p className="text-xs text-slate-400">Welcome, {name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right text-xs">
                <p className="font-semibold text-white">{name}</p>
                <p className="text-slate-400">Pending approval</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white">{initial}</div>
            </div>
            <button onClick={onLogout} className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto bg-[#0a1125] space-y-5">

          <div>
            <h2 className="text-xl font-semibold text-white">Welcome, {name}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Your account is pending admin approval</p>
          </div>

          {/* Status banner */}
          <div className="bg-[#1e293b] border border-amber-500/30 border-l-4 border-l-amber-500 rounded-xl p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-400">Approval pending</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Your registration has been submitted. The admin team will review your application and confirm room availability. This usually takes 1–2 working days.
              </p>
            </div>
          </div>

          {/* Status cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Application status</p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400">Awaiting review</span>
              <p className="text-xs text-slate-500 mt-2">Submitted on registration</p>
            </div>
            <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Room availability</p>
              <p className="text-sm font-semibold text-white">To be confirmed</p>
              <p className="text-xs text-slate-500 mt-1">Admin will assign your room</p>
            </div>
          </div>

          {/* ✅ Room Type Preference Card */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Room Type Preference
              </p>
              {!editing && (
                <button
                  onClick={() => { setEditing(true); setSaveMsg(""); }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Change
                </button>
              )}
            </div>

            {!editing ? (
              <div className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-lg border border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-lg">
                  {roomPref === "SINGLE" ? "🛏️" : roomPref === "DOUBLE" ? "🛏️🛏️" : "❓"}
                </div>
                <div>
                  <p className="text-xs text-slate-500">Your preference</p>
                  <p className="text-sm font-semibold text-white">
                    {roomPref === "SINGLE" ? "Single Room" : roomPref === "DOUBLE" ? "Double Room" : "Not specified"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRoomPref("SINGLE")}
                    className={`p-3 rounded-lg border text-sm font-medium transition ${
                      roomPref === "SINGLE"
                        ? "border-blue-500 bg-blue-500/20 text-blue-400"
                        : "border-slate-700 bg-[#0f172a] text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    🛏️ Single Room
                  </button>
                  <button
                    onClick={() => setRoomPref("DOUBLE")}
                    className={`p-3 rounded-lg border text-sm font-medium transition ${
                      roomPref === "DOUBLE"
                        ? "border-purple-500 bg-purple-500/20 text-purple-400"
                        : "border-slate-700 bg-[#0f172a] text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    🛏️🛏️ Double Room
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSavePreference}
                    disabled={saving || !roomPref}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setSaveMsg(""); setRoomPref(student?.roomTypePreference || ""); }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                  >
                    Cancel
                  </button>
                </div>
                {saveMsg && (
                  <p className={`text-xs ${saveMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>{saveMsg}</p>
                )}
              </div>
            )}
            {saveMsg && !editing && (
              <p className="text-xs text-green-400 mt-2">{saveMsg}</p>
            )}
          </div>

          {/* Contact section */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4">
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Contact the admin team
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-lg border border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-300">Hostel office</p>
                  <p className="text-xs text-blue-400">+94 11 234 5678</p>
                </div>
                <span className="text-[10px] text-slate-500">Mon–Fri 8am–5pm</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-lg border border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-300">Admin email</p>
                  <p className="text-xs text-blue-400">hostel@pusl.ac.lk</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-lg border border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-300">Walk-in office</p>
                  <p className="text-xs text-slate-400">Block A, Ground Floor — Room 01</p>
                </div>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4">
            <p className="text-sm font-semibold text-white mb-4">What happens next?</p>
            <div className="space-y-0">
              {[
                { done: true, label: "Registration submitted", sub: "Your account has been created" },
                { done: false, active: true, num: 2, label: "Admin reviews & confirms room availability", sub: "You will be notified by email once approved" },
                { done: false, num: 3, label: "Complete roommate questionnaire", sub: "Unlocks after approval" },
                { done: false, num: 4, label: "Access full student portal", sub: "Payments, complaints, canteen & more", last: true },
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      step.done ? "bg-green-600" : step.active ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"
                    }`}>
                      {step.done
                        ? <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        : step.num}
                    </div>
                    {!step.last && <div className="w-0.5 h-8 bg-slate-700 my-1" />}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm font-semibold ${step.done || step.active ? "text-white" : "text-slate-400"}`}>{step.label}</p>
                    <p className="text-xs text-slate-500">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}