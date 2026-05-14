// src/pages/admin/notifications/NotificationCenter.jsx

export default function NotificationCenter() {
  const notifications = [
    { type: "Payment", message: "Payment received from STU001 (LKR 35,000 for February).", time: "10 min ago" },
    { type: "Complaint", message: "New complaint submitted (Room A-101 – Maintenance).", time: "30 min ago" },
    { type: "Room Allocation", message: "Student STU005 requested room transfer to Block B.", time: "2 hours ago" },
    { type: "Energy", message: "Energy usage exceeded 1400 kWh for Block C last month.", time: "Yesterday" }
  ];

  const tagColor = {
    Payment: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Complaint: "bg-amber-100 text-amber-700 border-amber-200",
    "Room Allocation": "bg-sky-100 text-sky-700 border-sky-200",
    Energy: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200"
  };

  const dotColor = {
    Payment: "bg-emerald-500",
    Complaint: "bg-amber-500",
    "Room Allocation": "bg-sky-500",
    Energy: "bg-fuchsia-500"
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Notification Center</h1>
        <p className="text-gray-500 mt-1">
          Central view of all alerts related to payments, complaints, rooms and energy.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between text-gray-400 text-sm mb-4">
          <span>Showing latest {notifications.length} notifications</span>
          <span className="hover:text-gray-600 cursor-pointer">Mark all as read (UI only)</span>
        </div>

        <div className="space-y-6">
          {notifications.map((n, idx) => (
            <div key={idx} className="border-b border-gray-100 pb-4 last:border-none">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${dotColor[n.type] || "bg-gray-400"}`}></div>
                  <div>
                    <span className={`px-2 py-1 rounded-full border text-xs font-medium ${tagColor[n.type]}`}>
                      {n.type}
                    </span>
                    <p className="text-gray-700 mt-2 text-[15px]">{n.message}</p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm whitespace-nowrap ml-4">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}