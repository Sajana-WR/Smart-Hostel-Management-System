// src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const navItem = (path, label) => (
    <Link
      to={path}
      className={`px-4 py-2 rounded-lg transition-all ${
        pathname === path
          ? "bg-blue-600 text-white shadow"
          : "text-slate-300 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 w-full px-8 py-4 bg-slate-900/80 backdrop-blur-md shadow-md flex justify-between items-center z-50">
      <h1 className="text-xl font-bold text-white tracking-wide">
        Smart Hostel
      </h1>

      <div className="flex items-center gap-6">
        {navItem("/", "Home")}
        {navItem("/login", "Login")}
        {navItem("/register", "Register")}
        {navItem("/student/dashboard", "Student")}
      </div>
    </nav>
  );
}
