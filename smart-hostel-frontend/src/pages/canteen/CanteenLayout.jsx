// src/pages/canteen/CanteenLayout.jsx
import { Outlet } from "react-router-dom";
import CanteenSidebar from "../../components/CanteenSidebar.jsx";

export default function CanteenLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <CanteenSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}