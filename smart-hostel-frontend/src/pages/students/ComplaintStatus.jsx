// src/pages/student/ComplaintStatus.jsx

const mockComplaints = [
  {
    id: "C-101",
    date: "2025-03-20",
    subject: "Broken shower in bathroom",
    status: "In Progress",
  },
  {
    id: "C-099",
    date: "2025-02-10",
    subject: "Fan not working",
    status: "Resolved",
  },
];

export default function ComplaintStatus() {
  return (
    <div className="space-y-6">

      {/* PAGE TITLE */}
      <h2 className="text-2xl font-semibold text-slate-100">
        My Complaints Status
      </h2>

      {/* CARD */}
      <div className="bg-[#0f1b3b] border border-slate-800 rounded-xl shadow-lg">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-800">
          <p className="text-sm font-medium text-slate-200">
            Recent Complaints
          </p>
        </div>

        {/* LIST */}
        <ul className="divide-y divide-slate-800 text-sm">
          {mockComplaints.map((c) => (
            <li
              key={c.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-[#162447] transition"
            >
              {/* LEFT SECTION */}
              <div>
                <p className="font-medium text-slate-100">{c.subject}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {c.id} • Submitted on {c.date}
                </p>
              </div>

              {/* STATUS PILL */}
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium
                  ${
                    c.status === "Resolved"
                      ? "bg-blue-600/20 text-blue-300 border border-blue-700/40"
                      : "bg-amber-600/20 text-amber-300 border border-amber-700/40"
                  }
                `}
              >
                {c.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
