// src/pages/students/ApprovedDashboard.jsx
export default function ApprovedDashboard({ student, onLogout }) {
  const name = student?.fullName || "Student";

  const goToQuestionnaire = () => {
    window.location.href = "/students/ai/roommate-questionnaire";
  };
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#0a1125] text-slate-100">

      {/* Sidebar — only questionnaire unlocked */}
      <div className="w-56 bg-[#111827] border-r border-slate-800 flex flex-col py-5 flex-shrink-0">
        <div className="px-5 pb-5 border-b border-slate-800 mb-4">
          <span className="text-white font-semibold text-base">The Bunker</span>
        </div>

        <div className="px-5 mb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
          Overview
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-300 bg-blue-600/20 border-r-2 border-blue-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </div>

        <div className="px-5 mt-4 mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          AI Modules
        </div>

        {/* Questionnaire — only unlocked item */}
        <button
          onClick={goToQuestionnaire}
          className="flex items-center gap-3 px-5 py-2.5 text-sm text-green-400 hover:bg-green-500/10 transition text-left w-full"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Roommate Questionnaire
        </button>

        <div className="px-5 mt-4 mb-1 text-[10px] font-semibold text-slate-700 uppercase tracking-widest">
          Locked
        </div>
        {["My Profile", "Room Details", "Payments", "Complaints", "Canteen"].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between px-5 py-2 text-sm text-slate-700 cursor-not-allowed select-none"
          >
            <span>{item}</span>
            <svg className="w-3 h-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="h-16 px-6 border-b border-slate-800 bg-[#0d1733]/80 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-white">Student Portal</h1>
            <p className="text-xs text-slate-400">Welcome, {name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right text-xs">
                <p className="font-semibold text-white">{name}</p>
                <p className="text-green-400">Approved</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white">
                {initial}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#0a1125] space-y-5">

          <div>
            <h2 className="text-xl font-semibold text-white">Welcome, {name}!</h2>
            <p className="text-sm text-slate-400 mt-0.5">Your application has been approved</p>
          </div>

          {/* Approved banner */}
          <div className="bg-[#1e293b] border border-green-500/30 border-l-4 border-l-green-500 rounded-xl p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-400">Application approved!</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Great news! The admin has confirmed your room availability. 
                Complete the roommate questionnaire below to unlock your full student portal.
              </p>
            </div>
          </div>

          {/* Status cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Application status</p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                Approved
              </span>
              <p className="text-xs text-slate-500 mt-2">Room availability confirmed</p>
            </div>
            <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Questionnaire</p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400">
                Not completed
              </span>
              <p className="text-xs text-slate-500 mt-2">Required to access portal</p>
            </div>
          </div>

          {/* Big CTA */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Complete your roommate questionnaire</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed max-w-sm mx-auto">
              Answer a few questions about your lifestyle and preferences. 
              This helps us match you with the most compatible roommate.
            </p>
            <button
              onClick={goToQuestionnaire}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              Start Questionnaire →
            </button>
          </div>

          {/* Steps */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4">
            <p className="text-sm font-semibold text-white mb-4">Your progress</p>
            <div className="space-y-0">

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="w-0.5 h-8 bg-slate-700 my-1" />
                </div>
                <div className="pb-6">
                  <p className="text-sm font-semibold text-white">Registration submitted</p>
                  <p className="text-xs text-slate-500">Account created</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="w-0.5 h-8 bg-slate-700 my-1" />
                </div>
                <div className="pb-6">
                  <p className="text-sm font-semibold text-white">Admin approved</p>
                  <p className="text-xs text-slate-500">Room availability confirmed</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                    3
                  </div>
                  <div className="w-0.5 h-8 bg-slate-700 my-1" />
                </div>
                <div className="pb-6">
                  <p className="text-sm font-semibold text-blue-400">Complete roommate questionnaire</p>
                  <p className="text-xs text-slate-500">Currently required</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs text-slate-400">
                    4
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Access full student portal</p>
                  <p className="text-xs text-slate-600">Unlocks after questionnaire</p>
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}