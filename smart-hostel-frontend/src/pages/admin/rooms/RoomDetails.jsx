// src/pages/admin/rooms/RoomDetails.jsx
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../../api/api";

export default function RoomDetails() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/rooms/admin/${id}`);
        setRoom(res.data);
      } catch (err) {
        setError("Room not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading room details...</span>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="space-y-4">
        <p className="text-red-400">{error || "Room not found."}</p>
        <Link to="/admin/rooms" className="text-sm text-emerald-600 hover:underline">
          ← Back to list
        </Link>
      </div>
    );
  }

  const occupants = room.occupants || [];
  const capacity = room.capacity || 2;
  const occupied = room.occupied || 0;

  // Build beds array from occupants
  const beds = Array.from({ length: capacity }, (_, i) => {
    const occupant = occupants[i] || null;
    return {
      bedNo: `Bed ${i + 1}`,
      student: occupant ? occupant.name : null,
      studentId: occupant ? occupant.id : null,
      status: occupant ? "Occupied" : "Available",
    };
  });

  const statusColor =
    room.status === "OCCUPIED"
      ? "bg-red-100 text-red-700 border-red-200"
      : room.status === "PARTIAL"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Room Details</h1>
          <p className="text-sm text-gray-500 mt-1">Summary of room information and occupancy.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/rooms/edit/${id}`}
            className="px-4 py-2 border border-emerald-500 rounded-lg text-sm text-emerald-600 hover:bg-emerald-50"
          >
            Edit
          </Link>
          <Link to="/admin/rooms" className="text-sm text-gray-400 hover:text-gray-600">
            ← Back to list
          </Link>
        </div>
      </div>

      {/* Room Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">Room</p>
          <p className="text-xl font-semibold text-gray-800">{room.roomCode}</p>
          <p className="text-sm text-gray-500 mt-1">Block {room.block} · Floor {room.floor}</p>
        </div>
        <div className="flex gap-8 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-1">Capacity</p>
            <p className="font-semibold text-gray-800">{occupied} / {capacity} beds occupied</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Status</p>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
              {room.status}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Available</p>
            <p className="font-semibold text-gray-800">{room.available} slot(s)</p>
          </div>
        </div>
      </div>

      {/* Bed Allocation */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Bed Allocation</h2>
          <Link to="/admin/rooms/allocation" className="text-xs text-indigo-600 hover:text-indigo-700">
            Manage allocation →
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {beds.map((bed) => (
            <div
              key={bed.bedNo}
              className={`border rounded-xl p-4 text-sm transition ${
                bed.status === "Occupied"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <p className="text-xs text-gray-400 mb-1">{bed.bedNo}</p>
              <p className="font-medium text-gray-800 mb-2">
                {bed.student || "Not assigned"}
              </p>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                bed.status === "Occupied"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}>
                {bed.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}