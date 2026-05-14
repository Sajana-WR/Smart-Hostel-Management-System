import { Link } from "react-router-dom";
import bgImage from "../../assets/hostel-bg.png";

export default function Home() {
  return (
    <div className="min-h-screen text-slate-50 relative overflow-x-hidden" style={{ background: "#080c14" }}>

      {/* Ambient blobs */}
      <div className="fixed top-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full opacity-[0.15] blur-[100px] bg-blue-500 pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-50px] left-[-80px] w-[350px] h-[350px] rounded-full opacity-[0.12] blur-[100px] bg-violet-600 pointer-events-none" />
      <div className="fixed top-[40%] left-[35%] w-[250px] h-[250px] rounded-full opacity-[0.10] blur-[100px] bg-cyan-500 pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4 bg-[#080c14]/75 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-base shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            🏚️
          </div>
          <span className="font-extrabold text-lg tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            The Bunker
          </span>
        </div>

        <div className="flex items-center gap-7 text-sm">
          <Link to="/" className="text-slate-500 hover:text-slate-200 transition-colors font-medium">Home</Link>
          <Link to="/login" className="text-slate-500 hover:text-slate-200 transition-colors font-medium">Login</Link>
          <Link
            to="/register"
            className="px-5 py-2 rounded-lg border border-blue-500/60 bg-blue-500/10 text-blue-300 hover:bg-blue-500 hover:text-white transition-all duration-200 font-semibold"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 pt-24 pb-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 rounded-full px-5 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-300">Smart Hostel Management</span>
        </div>

        <h1
          className="font-extrabold leading-[0.95] tracking-[-3px] mb-5"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(52px, 9vw, 96px)" }}
        >
          Welcome to<br />
          <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 bg-clip-text text-transparent">
            The Bunker.
          </span>
        </h1>

        <p className="text-slate-500 font-light max-w-[500px] leading-relaxed mb-12" style={{ fontSize: "clamp(14px, 1.5vw, 17px)" }}>
          Rooms, payments, canteen, complaints, AI-matching & energy forecasting — all managed from one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="px-9 py-4 rounded-xl font-bold text-white text-[15px] bg-gradient-to-r from-blue-500 to-cyan-500 shadow-[0_8px_32px_rgba(59,130,246,0.35)] hover:-translate-y-0.5 hover:shadow-[0_14px_44px_rgba(59,130,246,0.5)] transition-all duration-300"
          >
            🔑 Login as Student / Admin
          </Link>
          <Link
            to="/register"
            className="px-9 py-4 rounded-xl font-medium text-slate-300 text-[15px] bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-indigo-500/50 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
          >
            Register as Student →
          </Link>
        </div>
      </main>

      {/* Stats Strip */}
      <div className="relative z-10 flex flex-wrap justify-center border-t border-b border-white/[0.06] bg-[#0d1526]/60 backdrop-blur-xl">
        {[
          { num: "10+", label: "Modules" },
          { num: "11",  label: "DB Tables" },
          { num: "3",   label: "User Roles" },
          { num: "AI",  label: "Powered" },
          { num: "24/7",label: "Available" },
        ].map((s, i) => (
          <div key={i} className="flex-1 min-w-[130px] px-10 py-6 text-center border-r border-white/[0.06] last:border-r-0">
            <div
              className="font-extrabold text-3xl bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >{s.num}</div>
            <div className="text-[11px] text-slate-600 mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <p className="text-[11px] font-bold uppercase tracking-[2px] text-cyan-400 mb-3">What's inside</p>
        <h2 className="font-extrabold text-4xl tracking-tight mb-10" style={{ fontFamily: "'Syne', sans-serif" }}>
          Everything you need.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: "🏠", color: "rgba(59,130,246,.12)",   title: "Room Management",       desc: "Browse, allocate and manage hostel rooms with live availability." },
            { icon: "🤖", color: "rgba(139,92,246,.12)",   title: "AI Roommate Matching",  desc: "Weighted scoring finds compatible roommates based on lifestyle habits." },
            { icon: "⚡", color: "rgba(6,182,212,.12)",    title: "Energy Forecasting",    desc: "LSTM-powered energy prediction to cut waste and reduce costs." },
            { icon: "💳", color: "rgba(34,197,94,.12)",    title: "Online Payments",       desc: "Secure rent payments via PayHere & Stripe with full history." },
            { icon: "🍽️", color: "rgba(251,191,36,.12)",  title: "Canteen Portal",        desc: "Digital meal ordering and menu management — fully paperless." },
            { icon: "📣", color: "rgba(239,68,68,.12)",    title: "Complaints & Alerts",   desc: "Track complaints with SMS & email via Twilio and SendGrid." },
          ].map((f, i) => (
            <div key={i} className="group bg-[#0d1526] border border-white/[0.07] rounded-2xl p-6 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4" style={{ background: f.color }}>{f.icon}</div>
              <h3 className="font-bold text-base mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{f.title}</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role Cards */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <p className="text-[11px] font-bold uppercase tracking-[2px] text-cyan-400 mb-3">Access</p>
        <h2 className="font-extrabold text-4xl tracking-tight mb-10" style={{ fontFamily: "'Syne', sans-serif" }}>
          Built for every role.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { emoji: "👨‍🎓", role: "Student",        desc: "Book rooms, pay fees, order meals and submit complaints.",         color: "#3b82f6", to: "/login?role=student" },
            { emoji: "👨‍💼", role: "Administrator",   desc: "Full control — rooms, payments, AI tools and system config.",      color: "#8b5cf6", to: "/login?role=admin"   },
            { emoji: "🍴",   role: "Canteen Staff",   desc: "Update menus, confirm orders and manage canteen operations.",      color: "#06b6d4", to: "/login?role=canteen" },
          ].map((r, i) => (
            <div key={i} className="bg-[#0d1526] border border-white/[0.07] rounded-2xl p-8 text-center hover:-translate-y-1.5 hover:shadow-[0_24px_64px_rgba(0,0,0,0.5)] transition-all duration-300">
              <span className="text-5xl mb-4 block">{r.emoji}</span>
              <h3 className="font-extrabold text-lg mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>{r.role}</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-6">{r.desc}</p>
              <Link
                to={r.to}
                className="inline-block px-6 py-2.5 rounded-xl text-[13px] font-semibold border transition-all duration-200 hover:bg-opacity-10"
                style={{ borderColor: r.color, color: r.color }}
              >
                {r.role} Login
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-10 py-7 flex justify-between flex-wrap gap-3 text-xs text-slate-600">
        <span>PUSL3190 — <strong className="text-slate-500">The Bunker · Smart Hostel Management System</strong></span>
        <span>Ranasinghe Ranasinghe &nbsp;|&nbsp; Index: 10953006</span>
      </footer>
    </div>
  );
}