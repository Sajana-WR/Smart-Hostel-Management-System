// src/pages/admin/rooms/RoomAllocation.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/api";

export default function RoomAllocation() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("student1");
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, roomsRes] = await Promise.all([
        api.get("/api/students/admin/all"),
        api.get("/api/rooms/all"),
      ]);
      setStudents(studentsRes.data);
      setRooms(roomsRes.data);
    } catch (err) {
      setError("Failed to load students or rooms.");
    } finally {
      setLoading(false);
    }
  };

  const availableRooms = rooms.filter((r) => r.status !== "OCCUPIED");
  const unassignedStudents = students.filter((s) => {
    const isAssigned = rooms.some((r) => r.occupants && r.occupants.some((o) => o.id === s.id));
    return !isAssigned;
  });

  const selectedRoomData = rooms.find((r) => String(r.id) === String(selectedRoom));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!selectedStudent) return setError("Please select a student.");
    if (!selectedRoom) return setError("Please select a room.");
    try {
      setSubmitting(true);
      await api.post("/api/rooms/admin/allocate", {
        userId: parseInt(selectedStudent),
        roomId: parseInt(selectedRoom),
        slot: selectedSlot,
        checkInDate: checkInDate,
      });
      setSuccess("Student allocated to room successfully!");
      setSelectedStudent("");
      setSelectedRoom("");
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to allocate room.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setSelectedStudent("");
    setSelectedRoom("");
    setSelectedSlot("student1");
    setCheckInDate(new Date().toISOString().split("T")[0]);
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Room Allocation / Transfer</h1>
          <p className="text-sm text-gray-500 mt-1">Assign students to rooms.</p>
        </div>
        <Link to="/admin/rooms" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to room list
        </Link>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-700 text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-700 text-sm">
          ❌ {error}
        </div>
      )}

      <div className="grid gap-6 max-w-5xl">

        {/* Allocation Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Allocate Student to Room</h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Student" required>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a student...</option>
                  {unassignedStudents.map((s) => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>
                  ))}
                  {unassignedStudents.length === 0 && <option disabled>All students are assigned</option>}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">{unassignedStudents.length} unassigned student(s)</p>
              </FormField>

              <FormField label="Room" required>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a room...</option>
                  {availableRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.roomCode} — Block {r.block}, Floor {r.floor} ({r.occupied}/{r.capacity} occupied)
                    </option>
                  ))}
                  {availableRooms.length === 0 && <option disabled>No available rooms</option>}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">{availableRooms.length} room(s) with available space</p>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Slot">
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="student1">Student 1 (Primary)</option>
                  <option value="student2">Student 2 (Roommate)</option>
                </select>
              </FormField>

              <FormField label="Check-in Date">
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </FormField>
            </div>

            {/* Selected Room Info */}
            {selectedRoomData && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-gray-600 mb-2">Room Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div><span className="text-gray-400">Room:</span><span className="ml-1 text-gray-700">{selectedRoomData.roomCode}</span></div>
                  <div><span className="text-gray-400">Block:</span><span className="ml-1 text-gray-700">{selectedRoomData.block}</span></div>
                  <div><span className="text-gray-400">Capacity:</span><span className="ml-1 text-gray-700">{selectedRoomData.capacity}</span></div>
                  <div><span className="text-gray-400">Occupied:</span><span className="ml-1 text-gray-700">{selectedRoomData.occupied}/{selectedRoomData.capacity}</span></div>
                </div>
                {selectedRoomData.occupants && selectedRoomData.occupants.length > 0 && (
                  <div className="mt-2">
                    <span className="text-gray-400 text-xs">Current occupants: </span>
                    {selectedRoomData.occupants.map((o) => (
                      <span key={o.id} className="text-xs text-emerald-600 mr-2">{o.name}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm transition
                  ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
              >
                {submitting ? "Allocating..." : "Confirm Allocation"}
              </button>
            </div>
          </form>
        </div>

        {/* Current Allocations */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Current Room Occupancy</h2>
          <div className="space-y-3">
            {rooms.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg p-3">
                <div>
                  <span className="font-medium text-gray-800 text-sm">{r.roomCode}</span>
                  <span className="text-xs text-gray-400 ml-2">Block {r.block} · Floor {r.floor}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{r.occupied}/{r.capacity}</span>
                  <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-medium ${
                    r.status === "OCCUPIED"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : r.status === "PARTIAL"
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  }`}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}