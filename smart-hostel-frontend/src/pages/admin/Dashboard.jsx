// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [studentsRes, roomsRes, complaintsRes, paymentsRes] = await Promise.allSettled([
        api.get("/api/students/admin/all"),
        api.get("/api/rooms/all"),
        api.get("/api/complaints/admin/all"),
        api.get("/api/payments/admin/all"),
      ]);

      const students  = studentsRes.status  === "fulfilled" ? studentsRes.value.data  : [];
      const rooms     = roomsRes.status     === "fulfilled" ? roomsRes.value.data     : [];
      const complaints= complaintsRes.status=== "fulfilled" ? complaintsRes.value.data: [];
      const payments  = paymentsRes.status  === "fulfilled" ? paymentsRes.value.data  : [];

      const occupiedRooms       = rooms.filter(r => r.occupied || r.status === "OCCUPIED").length;
      const pendingComplaints   = complaints.filter(c => c.status === "PENDING").length;
      const inProgressComplaints= complaints.filter(c => c.status === "IN_PROGRESS").length;
      const resolvedComplaints  = complaints.filter(c => c.status === "RESOLVED").length;
      const monthlyRevenue      = payments.filter(p => p.status === "PAID")
                                    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const blockStats = rooms.reduce((acc, room) => {
        const block = room.block || room.roomCode?.charAt(0) || "?";
        if (!acc[block]) acc[block] = { total: 0, occupied: 0 };
        acc[block].total++;
        if (room.occupied || room.status === "OCCUPIED") acc[block].occupied++;
        return acc;
      }, {});

      setStats({
        totalStudents: students.length, totalRooms: rooms.length,
        occupiedRooms, pendingComplaints, inProgressComplaints,
        resolvedComplaints, monthlyRevenue, blockStats,
        recentComplaints: complaints.slice(0, 5),
        recentPayments:   payments.slice(0, 5),
      });
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-green-600" />
      <span className="ml-3 text-gray-400 text-sm">Loading dashboard...</span>
    </div>
  );

  const occupancyPercent = stats?.totalRooms > 0
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Dashboard Overview</h2>
        <p className="text-xs text-gray-400 mt-1">
          {new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Students"     value={stats?.totalStudents ?? "—"}
          sub={null} icon="👥" color="blue"   onClick={() => navigate("/admin/students")} />
        <StatCard title="Room Occupancy"     value={`${stats?.occupiedRooms} / ${stats?.totalRooms}`}
          sub={`${occupancyPercent}% occupied`} icon="🏠" color="green" onClick={() => navigate("/admin/rooms")} />
        <StatCard title="Pending Complaints" value={stats?.pendingComplaints ?? "—"}
          sub={`${stats?.inProgressComplaints} in progress`} icon="📝" color="amber" onClick={() => navigate("/admin/complaints")} />
        <StatCard title="Monthly Revenue"    value={`Rs. ${Number(stats?.monthlyRevenue ?? 0).toLocaleString()}`}
          sub={null} icon="💰" color="purple" onClick={() => navigate("/admin/payments")} />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Occupancy by Block */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Room Occupancy by Block</h3>
          {Object.keys(stats?.blockStats || {}).length === 0 ? (
            <p className="text-sm text-gray-400">No room data available.</p>
          ) : (
            <div className="space-y-4">
              {/* ✅ FIXED: sorted alphabetically A, B, C, D */}
              {Object.entries(stats?.blockStats || {}).sort(([a], [b]) => a.localeCompare(b)).map(([block, data]) => {
                const pct = data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0;
                const barColor = pct >= 75 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400";
                return (
                  <div key={block}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span className="font-medium text-gray-700">Block {block}</span>
                      <span>{data.occupied}/{data.total} rooms · {pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100">
                      <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Complaints Overview */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Complaints Overview</h3>
            <button onClick={() => navigate("/admin/complaints")} className="text-xs text-blue-600 hover:underline">View All →</button>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between items-center">
              <span className="text-gray-500">Pending</span>
              <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">{stats?.pendingComplaints ?? 0}</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">In Progress</span>
              <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">{stats?.inProgressComplaints ?? 0}</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-500">Resolved</span>
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">{stats?.resolvedComplaints ?? 0}</span>
            </li>
          </ul>
          <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
            <button onClick={() => navigate("/admin/students/add")}
              className="w-full text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg py-2 hover:bg-green-100 transition font-medium">
              + Add New Student
            </button>
            <button onClick={() => navigate("/admin/rooms/add")}
              className="w-full text-xs bg-gray-50 border border-gray-200 text-gray-600 rounded-lg py-2 hover:bg-gray-100 transition font-medium">
              🏠 Add New Room
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Complaints */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Recent Complaints</h3>
            <button onClick={() => navigate("/admin/complaints")} className="text-xs text-blue-600 hover:underline">View All →</button>
          </div>
          {(stats?.recentComplaints || []).length === 0 ? (
            <p className="text-sm text-gray-400">No complaints yet.</p>
          ) : (
            <ul className="space-y-0 divide-y divide-gray-100 text-sm">
              {stats.recentComplaints.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-gray-800 truncate max-w-[200px]">{c.subject}</p>
                    <p className="text-xs text-gray-400">{c.category} · {c.userName}</p>
                  </div>
                  <StatusPill status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Recent Payments</h3>
            <button onClick={() => navigate("/admin/payments")} className="text-xs text-blue-600 hover:underline">View All →</button>
          </div>
          {(stats?.recentPayments || []).length === 0 ? (
            <p className="text-sm text-gray-400">No payments yet.</p>
          ) : (
            <ul className="space-y-0 divide-y divide-gray-100 text-sm">
              {stats.recentPayments.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-gray-800 font-medium">Rs. {Number(p.amount).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{p.monthYear} · Room {p.roomCode}</p>
                  </div>
                  <StatusPill status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

function StatCard({ title, value, sub, icon, color, onClick }) {
  const styles = {
    blue:   { top: "border-t-blue-500",   icon: "bg-blue-50",   text: "" },
    green:  { top: "border-t-green-500",  icon: "bg-green-50",  text: "" },
    amber:  { top: "border-t-amber-500",  icon: "bg-amber-50",  text: "" },
    purple: { top: "border-t-purple-500", icon: "bg-purple-50", text: "" },
  };
  const s = styles[color];
  return (
    <button onClick={onClick}
      className={`bg-white border border-gray-200 border-t-4 ${s.top} rounded-xl p-4 text-left w-full hover:shadow-sm transition`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
        <div className={`w-8 h-8 rounded-lg ${s.icon} flex items-center justify-center text-base`}>{icon}</div>
      </div>
      <p className="text-xl font-semibold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </button>
  );
}

function StatusPill({ status }) {
  const map = {
    PENDING:     "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    RESOLVED:    "bg-green-100 text-green-700",
    PAID:        "bg-green-100 text-green-700",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}