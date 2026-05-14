// src/pages/students/StudentDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const API_BASE = "http://localhost:8080";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [matchedRoommate, setMatchedRoommate] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const fullName = localStorage.getItem("fullName");

  useEffect(() => {
    fetchDashboardData();
    fetchMatchedRoommate();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [roomRes, paymentsRes, complaintsRes] = await Promise.allSettled([
        api.get(`/api/rooms/me/${userId}`),
        api.get(`/api/payments/my/${userId}`),
        api.get("/api/complaints/my-complaints"),
      ]);

      setDashboardData({
        room: roomRes.status === "fulfilled" ? roomRes.value.data : null,
        payments: paymentsRes.status === "fulfilled" ? paymentsRes.value.data : [],
        complaints: complaintsRes.status === "fulfilled" ? complaintsRes.value.data : [],
      });
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Only show matched roommate if no assigned roommate exists in room allocation
  const fetchMatchedRoommate = async () => {
    try {
      // If room already has an assigned roommate, don't show a second one
      const roomRes = await api.get(`/api/rooms/me/${userId}`);
      const roomData = roomRes.data;
      if (roomData && roomData.roommates && roomData.roommates.length > 0) {
        return; // already has a real assigned roommate, skip
      }

      const res = await fetch(`${API_BASE}/api/roommates/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();

      // Check sent requests for ACCEPTED
      const acceptedSent = (data.sent || []).find((r) => r.status === "ACCEPTED");
      if (acceptedSent) {
        setMatchedRoommate({
          name: acceptedSent.requestedName,
          status: "Matched (Room pending)",
        });
        return;
      }

      // Check received requests for ACCEPTED
      const acceptedReceived = (data.received || []).find((r) => r.status === "ACCEPTED");
      if (acceptedReceived) {
        setMatchedRoommate({
          name: acceptedReceived.requesterName,
          status: "Matched (Room pending)",
        });
      }
    } catch (err) {
      console.error("Failed to fetch matched roommate", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-slate-400 text-sm">Loading dashboard...</span>
      </div>
    );
  }

  const room = dashboardData?.room;
  const hasRoom = room && room.hasRoom !== false && room.roomId;
  const payments = dashboardData?.payments || [];
  const complaints = dashboardData?.complaints || [];
  const lastPayment = payments.length > 0 ? payments[0] : null;
  const pendingComplaints = complaints.filter((c) => c.status === "PENDING").length;
  const totalComplaints = complaints.length;

  // ✅ Priority 1: Assigned roommate from room allocation
  // ✅ Priority 2: Accepted match (waiting for admin room assignment)
  // ✅ Priority 3: Not assigned
  const assignedRoommate =
    hasRoom && room.roommates && room.roommates.length > 0
      ? { name: room.roommates[0].fullName, status: "Assigned", isAssigned: true }
      : null;

  const roommateDisplay = assignedRoommate || matchedRoommate || null;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Student Portal</h1>
        <p className="text-slate-400 text-sm mt-1">
          Welcome back, {fullName || "Student"}.
        </p>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <DashboardCard
          title="My Profile"
          value="View / Update"
          link="/students/profile"
          icon="👤"
        />
        <DashboardCard
          title="Room Details"
          value={hasRoom ? `Room ${room.roomId}` : "Your Room"}
          link="/students/my-room"
          icon="🏠"
        />
        <DashboardCard
          title="Payments"
          value="Pay & Check History"
          link="/students/payments/make"
          icon="💳"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Room */}
        <div className="bg-[#0f1b3b] rounded-xl border border-slate-800 p-4 shadow">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Room</p>
          <p className="text-lg font-bold text-white">
            {hasRoom ? room.roomId : "—"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {hasRoom
              ? `Floor ${room.floor} · Block ${room.block}`
              : "Not assigned"}
          </p>
        </div>

        {/* Last Payment */}
        <div className="bg-[#0f1b3b] rounded-xl border border-slate-800 p-4 shadow">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Last Payment</p>
          <p className="text-lg font-bold text-white">
            {lastPayment ? `Rs. ${Number(lastPayment.amount).toLocaleString()}` : "—"}
          </p>
          <p className="text-xs mt-1">
            {lastPayment ? (
              <span className={lastPayment.status === "PAID" ? "text-green-400" : "text-yellow-400"}>
                {lastPayment.status}
              </span>
            ) : (
              <span className="text-slate-500">No payments yet</span>
            )}
          </p>
        </div>

        {/* Complaints */}
        <div className="bg-[#0f1b3b] rounded-xl border border-slate-800 p-4 shadow">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Complaints</p>
          <p className="text-lg font-bold text-white">{totalComplaints}</p>
          <p className="text-xs mt-1">
            {pendingComplaints > 0
              ? <span className="text-yellow-400">{pendingComplaints} pending</span>
              : <span className="text-slate-500">All resolved</span>}
          </p>
        </div>

        {/* Roommate */}
        <div className="bg-[#0f1b3b] rounded-xl border border-slate-800 p-4 shadow">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Roommate</p>
          <p className="text-lg font-bold text-white truncate">
            {roommateDisplay ? roommateDisplay.name : "—"}
          </p>
          <p className="text-xs mt-1">
            {roommateDisplay ? (
              <span className={roommateDisplay.isAssigned ? "text-green-400" : "text-yellow-400"}>
                {roommateDisplay.status}
              </span>
            ) : (
              <span className="text-slate-500">Not assigned</span>
            )}
          </p>
        </div>

      </div>

      {/* Bottom Panels */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Recent Complaints */}
        <div className="bg-[#0f1b3b] rounded-xl border border-slate-800 p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">My Complaints</h2>
            <button
              onClick={() => navigate("/students/complaints/my")}
              className="text-xs text-blue-400 hover:underline"
            >
              View All →
            </button>
          </div>

          {complaints.length === 0 ? (
            <p className="text-sm text-slate-500">No complaints submitted yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {complaints.slice(0, 3).map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between border-b border-slate-800 pb-2"
                >
                  <div>
                    <p className="text-slate-200 font-medium truncate max-w-[200px]">
                      {c.subject}
                    </p>
                    <p className="text-xs text-slate-500">{c.category}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.status === "PENDING"  ? "bg-yellow-900/40 text-yellow-400" :
                    c.status === "RESOLVED" ? "bg-green-900/40 text-green-400" :
                    "bg-blue-900/40 text-blue-400"
                  }`}>
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Tips */}
        <div className="bg-[#0f1b3b] rounded-xl border border-slate-800 p-6 shadow">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Tips</h2>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✔</span>
              Keep your room clean and follow hostel rules.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✔</span>
              Submit complaints early to avoid delays.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✔</span>
              Payments should be done before the 5th of each month.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✔</span>
              Use the AI roommate matching for best compatibility.
            </li>
          </ul>

          {/* Quick Actions */}
          <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate("/students/complaints/new")}
              className="text-xs bg-blue-600/20 border border-blue-700 text-blue-300 rounded-lg py-2 hover:bg-blue-600/40 transition"
            >
              + Submit Complaint
            </button>
            <button
              onClick={() => navigate("/students/canteen/menu")}
              className="text-xs bg-slate-700/30 border border-slate-700 text-slate-300 rounded-lg py-2 hover:bg-slate-700/50 transition"
            >
              🍽️ View Menu
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function DashboardCard({ title, value, link, icon }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(link)}
      className="p-6 bg-[#0f1b3b] rounded-xl border border-slate-800 shadow-md
      hover:border-blue-500 hover:shadow-lg transition group text-left w-full"
    >
      <p className="text-xs uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1">
        <span>{icon}</span> {title}
      </p>
      <p className="text-xl font-semibold text-white group-hover:text-blue-400">
        {value}
      </p>
    </button>
  );
}