import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import bgImage from "../../assets/hostel-bg.png";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    roomTypePreference: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError("");
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.username || !form.password || !form.roomTypePreference) {
      setError("Please fill all fields including room type preference.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:8080/api/auth/register", form);
      alert("Account created! Please wait for admin approval before logging in.");
      navigate("/login");
    } catch (err) {
      const fieldErrors = err?.response?.data?.fieldErrors;
      const firstFieldError = fieldErrors ? Object.values(fieldErrors)[0] : null;
      const msg =
        firstFieldError ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen text-slate-50 bg-cover bg-center relative flex flex-col"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <nav className="relative z-10 w-full bg-slate-900/80 backdrop-blur px-8 py-4 flex items-center justify-between border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wide">Smart Hostel</h1>
        <div className="flex gap-4 text-sm">
          <Link to="/" className="hover:text-blue-400">Home</Link>
          <Link to="/login" className="hover:text-blue-400">Login</Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Student Account</h2>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>

            <div>
              <label className="block text-sm mb-1 text-slate-300">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                maxLength={120}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                maxLength={180}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                minLength={3}
                maxLength={50}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                maxLength={120}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ✅ Room type preference */}
            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Room Type Preference <span className="text-red-400">*</span>
              </label>
              <select
                name="roomTypePreference"
                value={form.roomTypePreference}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
              >
                <option value="" disabled>Select room type</option>
                <option value="SINGLE">Single Room</option>
                <option value="DOUBLE">Double Room</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Admin will confirm availability based on your preference.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm shadow-md transition-colors"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
          </p>
        </div>
      </main>
    </div>
  );
}