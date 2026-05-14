// src/components/StudentSidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";

export default function StudentSidebar({ surveyCompleted, loading }) {
  const navigate = useNavigate();

  const base =
    "block px-4 py-2.5 text-sm rounded-lg transition font-medium w-full text-left";

  const linkClass = ({ isActive }) =>
    `${base} ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-300 hover:bg-slate-800"
    }`;

  const isLoggedIn = !!localStorage.getItem("token");
  const locked = !loading && isLoggedIn && surveyCompleted === false;

  return (
    <aside className="w-64 h-full bg-slate-900 border-r border-slate-800 p-4 flex flex-col">
      <h1 className="text-2xl font-bold text-white mb-6">The Bunker</h1>

      <nav className="space-y-6 flex-1">

        {/* OVERVIEW */}
        <div>
          <p className="text-xs text-slate-500 mb-2">OVERVIEW</p>
          <NavLink to="/students/dashboard" end className={linkClass}>
            Dashboard
          </NavLink>
        </div>

        {/* PROFILE */}
        <div>
          <p className="text-xs text-slate-500 mb-2">PROFILE</p>
          <NavLink to="/students/profile" end className={linkClass}>
            My Profile
          </NavLink>
        </div>

        {/* AI MODULES */}
        <div>
          <p className="text-xs text-slate-500 mb-2">AI MODULES</p>

          <NavLink to="/students/ai/roommate-questionnaire" className={linkClass}>
            Roommate Questionnaire
          </NavLink>

          {locked ? (
            <button
              type="button"
              onClick={() => navigate("/students/ai/roommate-questionnaire")}
              className={`${base} text-slate-400 bg-slate-800/40 cursor-not-allowed flex items-center justify-between`}
              title="Complete the questionnaire first"
            >
              <span>Matching Results</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-700">
                Locked
              </span>
            </button>
          ) : (
            <NavLink to="/students/ai/roommate-results" className={linkClass}>
              Matching Results
            </NavLink>
          )}

          {!locked && (
            <NavLink to="/students/requests" className={linkClass}>
              <div className="flex items-center justify-between">
                <span>Roommate Requests</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/30">
                  New
                </span>
              </div>
            </NavLink>
          )}
        </div>

        {/* MY ROOM */}
        <div>
          <p className="text-xs text-slate-500 mb-2">MY ROOM</p>
          <NavLink to="/students/my-room" end className={linkClass}>
            Room Details
          </NavLink>
          <NavLink to="/students/floor-chart" end className={linkClass}>
            <div className="flex items-center justify-between">
              <span>Floor Chart</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-600/30">
                Map
              </span>
            </div>
          </NavLink>
        </div>

        {/* PAYMENTS */}
        <div>
          <p className="text-xs text-slate-500 mb-2">PAYMENTS</p>
          <NavLink to="/students/payments/make" end className={linkClass}>
            Make Payment
          </NavLink>
          <NavLink to="/students/payments/history" end className={linkClass}>
            Payment History
          </NavLink>
        </div>

        {/* COMPLAINTS */}
        <div>
          <p className="text-xs text-slate-500 mb-2">COMPLAINTS</p>
          <NavLink to="/students/complaints/new" end className={linkClass}>
            Submit Complaint
          </NavLink>
          <NavLink to="/students/complaints" end className={linkClass}>
            My Complaints
          </NavLink>
        </div>

        {/* CANTEEN */}
        <div>
          <p className="text-xs text-slate-500 mb-2">CANTEEN</p>
          <NavLink to="/students/canteen/menu" end className={linkClass}>
            View Menu
          </NavLink>
          <NavLink to="/students/canteen/order" end className={linkClass}>
            Order Meal
          </NavLink>
          <NavLink to="/students/canteen/my-orders" end className={linkClass}>
            My Orders
          </NavLink>
          {/* ✅ NEW: Nearby Services */}
          <NavLink to="/students/canteen/nearby" end className={linkClass}>
            Nearby Services
          </NavLink>
        </div>

      </nav>

      <footer className="text-center text-xs text-slate-500 mt-auto">
        © 2025 The Bunker
      </footer>
    </aside>
  );
}