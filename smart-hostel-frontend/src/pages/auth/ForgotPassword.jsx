import { Link } from "react-router-dom";
import bgImage from "../../assets/hostel-bg.png";

export default function ForgotPassword() {
  return (
    <div
      className="min-h-screen text-slate-50 bg-cover bg-center relative flex flex-col"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Navbar */}
      <nav className="relative z-10 w-full bg-slate-900/80 backdrop-blur px-8 py-4 flex items-center justify-between border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wide">Smart Hostel</h1>

        <div className="flex gap-4 text-sm">
          <Link to="/" className="hover:text-blue-400">
            Home
          </Link>
          <Link to="/login" className="hover:text-blue-400">
            Login
          </Link>
        </div>
      </nav>

      {/* Forgot Password Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Reset Password
          </h2>

          <form className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold
              py-2.5 rounded-lg text-sm transition"
            >
              Send Reset Link
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            <Link to="/login" className="text-blue-400 hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
