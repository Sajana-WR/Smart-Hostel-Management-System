// src/pages/admin/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminLayout() {
  const fullName = localStorage.getItem("fullName") || "Administrator";
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-800">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
            <p className="text-xs text-gray-500">
              Manage students, rooms, payments, complaints and more.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{fullName}</span>
            <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}