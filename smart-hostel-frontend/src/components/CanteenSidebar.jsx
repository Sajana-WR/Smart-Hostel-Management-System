// src/components/CanteenSidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";

export default function CanteenSidebar() {
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
      <div className="p-6 border-b border-stone-200">
        <p className="text-xl font-bold text-stone-800">Smart Hostel</p>
        <p className="text-xs text-stone-400 mt-1">Canteen Staff Portal</p>
      </div>

      {/* Nav Links */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="text-xs text-stone-400 uppercase mb-2 font-semibold tracking-wider">Canteen & Nearby</p>
        <NavLink to="/canteen/menu" className={linkClass}>🍽️ Daily Menu</NavLink>
        <NavLink to="/canteen/orders" className={linkClass}>📦 Meal Orders</NavLink>
        <NavLink to="/canteen/nearby" className={linkClass}>📍 Nearby Services</NavLink>
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