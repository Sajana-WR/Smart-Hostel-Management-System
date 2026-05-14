// src/pages/students/StudentLayout.jsx
import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import StudentSidebar from "../../components/StudentSidebar";
import PendingDashboard from "./PendingDashboard";
import ApprovedDashboard from "./ApprovedDashboard";

const API_BASE = "http://localhost:8080";

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [student, setStudent] = useState(null);
  const [loadingTop, setLoadingTop] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStudent() {
      setLoadingTop(true);

      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");

      if (!token && !email) {
        setLoadingTop(false);
        navigate("/login", { replace: true });
        return;
      }

      const config = {
        signal: controller.signal,
        headers: {},
        params: {},
      };

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        config.params.email = email;
      }

      try {
        const res = await axios.get(`${API_BASE}/api/students/me`, config);
        setStudent(res.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        navigate("/login", { replace: true });
      } finally {
        setLoadingTop(false);
      }
    }

    loadStudent();
    return () => controller.abort();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  // ── Loading state ──────────────────────────────────────────
  if (loadingTop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1125]">
        <p className="text-slate-400 text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  // ── PENDING: show locked dashboard ─────────────────────────
  if (student?.status === "PENDING") {
    return <PendingDashboard student={student} onLogout={handleLogout} />;
  }

  // ── REJECTED: show rejection screen ───────────────────────
  if (student?.status === "REJECTED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1125]">
        <div className="max-w-md w-full mx-4 bg-[#1e293b] border border-red-500/30 border-l-4 border-l-red-500 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Application not approved</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Unfortunately your application was not approved. This may be due to room unavailability.
            Please contact the admin team for more information.
          </p>
          <div className="bg-[#0f172a] rounded-xl p-4 text-left space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-16">Phone</span>
              <span className="text-xs text-blue-400">+94 11 234 5678</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-16">Email</span>
              <span className="text-xs text-blue-400">hostel@pusl.ac.lk</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-16">Office</span>
              <span className="text-xs text-slate-400">Block A, Ground Floor — Room 01</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // ── APPROVED but survey not done → approved dashboard ─────
  // Allow questionnaire route through so student can fill it
  const isQuestionnaireRoute = location.pathname.includes("roommate-questionnaire");
  if (student?.status === "APPROVED" && !student?.surveyCompleted && !isQuestionnaireRoute) {
    return <ApprovedDashboard student={student} onLogout={handleLogout} />;
  }

  // ── APPROVED: normal portal ────────────────────────────────
  const displayName = student?.fullName || "Student";
  const displaySub =
    student?.degree?.trim()
      ? student.degree
      : student?.surveyCompleted
      ? "Profile ready"
      : "Complete your profile";

  return (
    <div className="min-h-screen flex bg-[#0a1125] text-slate-100">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        <header className="h-16 px-6 border-b border-slate-800 bg-[#0d1733]/80 backdrop-blur-md flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-lg font-semibold text-white">Student Portal</h1>
            <p className="text-xs text-slate-400">
              {loadingTop ? "Loading..." : `Welcome back, ${displayName}.`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/students/profile"
              className="flex items-center gap-3 hover:opacity-90 transition cursor-pointer"
            >
              <div className="text-right leading-tight text-xs">
                <p className="font-semibold text-white">{displayName}</p>
                <p className="text-slate-400">{displaySub}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-blue-900/40">
                {(displayName?.charAt(0) || "S").toUpperCase()}
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto bg-[#0a1125]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}