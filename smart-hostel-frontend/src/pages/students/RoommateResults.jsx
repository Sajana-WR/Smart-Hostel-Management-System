// src/pages/students/RoommateResults.jsx
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function RoommateResults() {
  const [matches, setMatches] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [requestStatusMap, setRequestStatusMap] = useState({});
  const [myRoommateId, setMyRoommateId] = useState(null);
  const [canSendStatus, setCanSendStatus] = useState({ canSend: true, reason: "", isStudent2: false, hasRoom: false });

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const loadExistingRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/roommates/user/${userId}`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      const map = {};

      // ✅ Check room allocation first — RoommateDto uses .id not .userId
      const roomRes = await fetch(`${API_BASE}/api/rooms/me/${userId}`, { headers });
      if (roomRes.ok) {
        const roomData = await roomRes.json();
        if (roomData && roomData.roommates && roomData.roommates.length > 0) {
          const assignedRoommateId = roomData.roommates[0].id; // ✅ FIXED: .id not .userId
          setMyRoommateId(assignedRoommateId);
          (data.sent || []).forEach((r) => { map[r.requestedId] = r.status; });
          setRequestStatusMap(map);
          return;
        }
      }

      // No room allocation roommate — check accepted requests
      const acceptedSent = (data.sent || []).find((r) => r.status === "ACCEPTED");
      if (acceptedSent) {
        setMyRoommateId(acceptedSent.requestedId);
      } else {
        const acceptedReceived = (data.received || []).find((r) => r.status === "ACCEPTED");
        if (acceptedReceived) {
          setMyRoommateId(acceptedReceived.requesterId);
        }
      }

      (data.sent || []).forEach((r) => { map[r.requestedId] = r.status; });
      (data.received || []).forEach((r) => {
        if (r.status === "ACCEPTED") map[r.requesterId] = "ACCEPTED";
      });
      setRequestStatusMap(map);
    } catch (err) {
      console.error("Failed to load existing requests", err);
    }
  };

  const checkCanSend = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/roommates/can-send/${userId}`, { headers });
      const data = await res.json();
      setCanSendStatus(data);
    } catch (err) {
      setCanSendStatus({ canSend: true, reason: "", isStudent2: false, hasRoom: false });
    }
  };

  const loadMatches = () => {
    if (!userId) { setError("User not found. Please login again."); setLoading(false); return; }
    if (!token) { setError("Session expired. Please login again."); setLoading(false); return; }
    fetch(`${API_BASE}/api/matching/roommates/${userId}`, { headers })
      .then(async (res) => {
        if (!res.ok) {
          let errMsg = "Failed to fetch matches";
          try { const data = await res.json(); errMsg = data?.message || data?.error || errMsg; } catch { const text = await res.text(); if (text) errMsg = text; }
          if (res.status === 401) errMsg = "Unauthorized. Please login again.";
          throw new Error(errMsg);
        }
        return res.json();
      })
      .then((data) => { setMatches(data.matches || []); setPreferences(data.preferences || null); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMatches(); checkCanSend(); loadExistingRequests(); }, []);

  const sendRequest = async (requestedId) => {
    setMsg(""); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/roommates/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requesterId: Number(userId), requestedId: Number(requestedId) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.message || "Request failed"); return; }
      setMsg(data?.message || "Roommate request sent!");
      setRequestStatusMap((prev) => ({ ...prev, [requestedId]: "PENDING" }));
      await checkCanSend();
    } catch { setError("Something went wrong. Please try again."); }
  };

  const leaveRoom = async () => {
    if (!window.confirm("Are you sure you want to leave your current room?")) return;
    setMsg(""); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/roommates/leave-room/${userId}`, { method: "PUT", headers });
      const data = await res.json();
      if (!res.ok) { setError(data?.message || "Failed to leave room"); return; }
      setMsg(data?.message || "You have left the room successfully");
      setMyRoommateId(null);
      await checkCanSend(); await loadExistingRequests();
    } catch { setError("Failed to leave room"); }
  };

  const getButtonState = (match) => {
    // ✅ Only show Matched for the ONE actual roommate
    if (myRoommateId && match.userId === myRoommateId) {
      return { label: "✅ Matched", disabled: true, style: "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 cursor-not-allowed" };
    }
    const status = requestStatusMap[match.userId];
    if (status === "PENDING") return { label: "⏳ Pending", disabled: true, style: "bg-blue-600/20 text-blue-300 border border-blue-500/40 cursor-not-allowed" };
    if (match.allocated) return { label: "Already in Room", disabled: true, style: "bg-slate-700 text-slate-400 cursor-not-allowed" };
    if (!canSendStatus.canSend) return { label: "Send Request", disabled: true, style: "bg-slate-700 text-slate-400 cursor-not-allowed" };
    return { label: "Send Request", disabled: false, style: "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer" };
  };

  const isAlreadyMatched = myRoommateId !== null;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-2">AI Roommate Matches</h1>
      <p className="text-slate-400 mb-6">These are suggested roommates based on your questionnaire.</p>

      {loading && <div className="text-slate-400">Loading matches...</div>}

      {isAlreadyMatched && (
        <div className="mb-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-4 rounded-lg">
          <p className="font-medium">✅ You are already matched as roommates</p>
        </div>
      )}

      {!canSendStatus.canSend && canSendStatus.reason && !isAlreadyMatched && (
        <div className="mb-4 bg-amber-500/20 border border-amber-500/40 text-amber-200 p-4 rounded-lg">
          <p className="font-medium">⚠️ {canSendStatus.reason}</p>
          {canSendStatus.isStudent2 && (
            <button onClick={leaveRoom} className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-white text-sm">
              Leave Current Room
            </button>
          )}
          {!canSendStatus.isStudent2 && canSendStatus.hasRoom && (
            <p className="text-sm mt-2 text-amber-300">As the primary occupant, please contact admin to change rooms.</p>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg mb-4">{error}</div>
      )}
      {msg && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-lg mb-4">{msg}</div>
      )}

      {/* Preferences */}
      {preferences && (
        <div className="bg-[#0d1733]/70 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3 text-white">Your Preferences</h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(preferences).map(([key, value]) => (
              <div key={key} className="flex justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                <span className="text-slate-400 text-sm">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                <span className="text-white text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && matches.length === 0 && !error && (
        <div className="text-slate-400">No matches found yet. Make sure other students completed the survey.</div>
      )}

      {/* Matches List */}
      <div className="space-y-4">
        {matches.map((m) => {
          const btn = getButtonState(m);
          const isMyRoommate = myRoommateId && m.userId === myRoommateId;
          return (
            <div key={m.userId} className="bg-[#0d1733]/70 border border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700 transition">
              <div>
                <p className="text-white font-semibold capitalize">{m.fullName}</p>
                <p className="text-slate-400 text-sm">User ID: {m.userId}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {m.allocated && (
                    <span className="text-xs bg-amber-600/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">Already in a room</span>
                  )}
                  {isMyRoommate && (
                    <span className="text-xs bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">Your roommate</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`font-bold text-lg ${m.score >= 70 ? "text-emerald-400" : m.score >= 50 ? "text-amber-400" : "text-red-400"}`}>
                    {m.score}%
                  </p>
                  <p className="text-slate-500 text-xs">Compatibility</p>
                </div>
                <button
                  onClick={() => !btn.disabled && sendRequest(m.userId)}
                  disabled={btn.disabled}
                  className={`px-4 py-2 rounded-lg font-medium transition text-sm ${btn.style}`}
                >
                  {btn.label}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <a href="/students/requests" className="text-blue-400 hover:text-blue-300 text-sm underline">
          View your pending requests →
        </a>
      </div>
    </div>
  );
}