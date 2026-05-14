// src/pages/admin/complaints/ComplaintAnalytics.jsx
import { useState, useEffect } from "react";
import api from "../../../api/api";

export default function ComplaintAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/complaints/admin/analytics");
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return <p className="text-gray-400 text-center py-12">Failed to load analytics.</p>;
  }

  const categoryData = analytics.byCategory
    ? Object.entries(analytics.byCategory).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
    : [];
  const categoryTotal = categoryData.reduce((s, x) => s + x.value, 0);

  const roomData = analytics.byRoom
    ? Object.entries(analytics.byRoom).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 5)
    : [];
  const roomTotal = roomData.reduce((s, x) => s + x.value, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Complaint Analytics & Trends</h1>
        <p className="text-sm text-gray-500">Overview of complaint volume, categories and resolution status.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard label="Total Complaints" value={analytics.total} color="text-gray-800" />
        <StatCard label="Pending" value={analytics.pending} color="text-amber-600" />
        <StatCard label="In Progress" value={analytics.inProgress} color="text-blue-600" />
        <StatCard label="Resolved" value={analytics.resolved} color="text-emerald-600" />
        <StatCard label="Rejected" value={analytics.rejected} color="text-red-600" />
      </div>

      {/* Avg Resolution Time */}
      {analytics.avgResolutionHours > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-400">Average Resolution Time</p>
          <p className="text-xl font-semibold text-emerald-600">{analytics.avgResolutionHours} hours</p>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Complaints by Category</h2>
          {categoryData.length === 0 ? (
            <p className="text-sm text-gray-400">No category data available.</p>
          ) : (
            <div className="space-y-3">
              {categoryData.map((item) => {
                const percent = categoryTotal > 0 ? Math.round((item.value / categoryTotal) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700">{item.label}</span>
                      <span className="text-gray-400">{item.value} ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Room Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Top Rooms by Complaints</h2>
          {roomData.length === 0 ? (
            <p className="text-sm text-gray-400">No room data available.</p>
          ) : (
            <div className="space-y-3">
              {roomData.map((item) => {
                const percent = roomTotal > 0 ? Math.round((item.value / roomTotal) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700">Room {item.label}</span>
                      <span className="text-gray-400">{item.value} ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Status Breakdown</h2>
        <div className="flex gap-2 h-6 rounded-full overflow-hidden">
          {analytics.total > 0 && (
            <>
              {analytics.pending > 0 && <div className="bg-amber-500 h-full" style={{ width: `${(analytics.pending / analytics.total) * 100}%` }} title={`Pending: ${analytics.pending}`} />}
              {analytics.inProgress > 0 && <div className="bg-blue-500 h-full" style={{ width: `${(analytics.inProgress / analytics.total) * 100}%` }} title={`In Progress: ${analytics.inProgress}`} />}
              {analytics.resolved > 0 && <div className="bg-emerald-500 h-full" style={{ width: `${(analytics.resolved / analytics.total) * 100}%` }} title={`Resolved: ${analytics.resolved}`} />}
              {analytics.rejected > 0 && <div className="bg-red-500 h-full" style={{ width: `${(analytics.rejected / analytics.total) * 100}%` }} title={`Rejected: ${analytics.rejected}`} />}
            </>
          )}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> In Progress</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Resolved</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Rejected</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value ?? 0}</p>
    </div>
  );
}