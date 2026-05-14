// src/pages/auth/Login.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import bgImage from "../../assets/hostel-bg.png";
import api from "../../api/api";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
      };

      const res = await api.post(`/api/auth/login`, payload);
      const data = res.data || {};

      const userId = data.id ?? data.userId;
      if (!userId) {
        setError("Login response missing user id.");
        return;
      }

      // ✅ store token
      const token = data.token ?? data.accessToken ?? data.jwt;
      if (token) localStorage.setItem("token", token);

      localStorage.setItem("userId", String(userId));
      localStorage.setItem("fullName", data.fullName ?? "");
      localStorage.setItem("email", data.email ?? "");
      localStorage.setItem("username", data.username ?? "");
      localStorage.setItem("role", data.role ?? "STUDENT");
      localStorage.setItem(
        "surveyCompleted",
        String(Boolean(data.surveyCompleted))
      );

      // ✅ Redirect based on role
      const role = data.role ?? "STUDENT";

      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (role === "CANTEEN_STAFF") {
        navigate("/canteen/menu");
      } else {
        // Students
        if (data.surveyCompleted === false) {
          navigate("/students/ai/roommate-questionnaire");
        } else {
          navigate("/students/dashboard");
        }
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen text-slate-50 bg-cover bg-center relative flex flex-col"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <nav className="relative z-10 w-full bg-slate-900/80 backdrop-blur px-8 py-4 flex items-center justify-between border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wide">Smart Hostel</h1>

        <div className="flex gap-4 text-sm">
          <Link to="/" className="hover:text-blue-400">
            Home
          </Link>
          <Link to="/register" className="hover:text-blue-400">
            Register
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

          {error && (
            <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-slate-300">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 text-white font-semibold py-2.5 rounded-lg text-sm transition
                ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:underline">
              Register as Student
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}