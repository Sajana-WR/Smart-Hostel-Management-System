// src/components/AdminSidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const base = "block px-4 py-2.5 text-sm rounded-lg transition font-medium";
  const linkClass = ({ isActive }) =>
    `${base} ${isActive ? "bg-emerald-600 text-white" : "text-stone-600 hover:bg-stone-200"}`;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="h-screen w-64 bg-stone-100 text-stone-800 flex flex-col sticky top-0 border-r border-stone-200">
      {/* Logo */}
      <div className="p-6 text-xl font-bold border-b border-stone-200 text-stone-800">
        Smart Hostel
      </div>

      {/* Nav Links */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">

        <div>
          <p className="text-xs text-stone-400 uppercase mb-2 font-semibold tracking-wider">Overview</p>
          <NavLink to="/admin/dashboard" end className={linkClass}>📊 Dashboard</NavLink>
        </div>

        <div>
          <p className="text-xs text-stone-400 uppercase mb-2 font-semibold tracking-wider">Students</p>
          <NavLink to="/admin/students" end className={linkClass}>👥 Student List</NavLink>
          <NavLink to="/admin/students/add" className={linkClass}>➕ Add Student</NavLink>
          <NavLink to="/admin/students/search" className={linkClass}>🔍 Search & Filter</NavLink>
          {/* ✅ NEW — Pending Approvals */}
          <NavLink to="/admin/students/approvals" className={linkClass}>⏳ Pending Approvals</NavLink>
        </div>

        <div>
          <p className="text-xs text-stone-400 uppercase mb-2 font-semibold tracking-wider">Rooms</p>
          <NavLink to="/admin/rooms" end className={linkClass}>🏠 Room List</NavLink>
          <NavLink to="/admin/rooms/add" className={linkClass}>➕ Add Room</NavLink>
          <NavLink to="/admin/rooms/allocation" className={linkClass}>🔄 Allocation & Transfer</NavLink>
        </div>

        <div>
          <p className="text-xs text-stone-400 uppercase mb-2 font-semibold tracking-wider">Payments</p>
          <NavLink to="/admin/payments" end className={linkClass}>💳 Payment List</NavLink>
          <NavLink to="/admin/payments/history" className={linkClass}>📋 Payment History</NavLink>
          <NavLink to="/admin/payments/verification" className={linkClass}>✅ Verification</NavLink>
          <NavLink to="/admin/payments/reports" className={linkClass}>📈 Financial Reports</NavLink>
        </div>

        <div>
          <p className="text-xs text-stone-400 uppercase mb-2 font-semibold tracking-wider">Complaints</p>
          <NavLink to="/admin/complaints" end className={linkClass}>📝 Complaint List</NavLink>
          <NavLink to="/admin/complaints/analytics" className={linkClass}>📊 Analytics & Trends</NavLink>
        </div>

        <div>
          <p className="text-xs text-stone-400 uppercase mb-2 font-semibold tracking-wider">Canteen & Nearby</p>
          <NavLink to="/admin/canteen/menu" className={linkClass}>🍽️ Daily Menu</NavLink>
          <NavLink to="/admin/canteen/orders" className={linkClass}>📦 Meal Orders</NavLink>
          <NavLink to="/admin/canteen/nearby" className={linkClass}>📍 Nearby Services</NavLink>
        </div>

        <div>
          <p className="text-xs text-stone-400 uppercase mb-2 font-semibold tracking-wider">AI Modules</p>
          <NavLink to="/admin/ai/roommate-questions" className={linkClass}>🤝 Roommate Questions</NavLink>
          <NavLink to="/admin/ai/roommate-result" className={linkClass}>🎯 Matching Results</NavLink>
          <NavLink to="/admin/ai/energy-upload" className={linkClass}>⚡ Energy Data Upload</NavLink>
          <NavLink to="/admin/ai/energy-forecast" className={linkClass}>📉 Energy Forecast</NavLink>
        </div>

        <div>
          <p className="text-xs text-stone-400 uppercase mb-2 font-semibold tracking-wider">Notifications</p>
          <NavLink to="/admin/notifications" className={linkClass}>🔔 Notification Center</NavLink>
        </div>

      </div>

      {/* Logout */}
      <div className="p-4 border-t border-stone-200">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition font-medium"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}