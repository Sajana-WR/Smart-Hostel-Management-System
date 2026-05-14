// src/pages/admin/rooms/RoomList.jsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/api";

function StatusPill({ status }) {
  let classes = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ";
  if (status === "OCCUPIED") {
    classes += "bg-red-100 text-red-700 border-red-200";
  } else if (status === "PARTIAL") {
    classes += "bg-amber-100 text-amber-700 border-amber-200";
  } else {
    classes += "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  return <span className={classes}>{status}</span>;
}

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/rooms/all");
      setRooms(res.data);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const blocks = useMemo(() => {
    const unique = [...new Set(rooms.map((r) => r.block))];
    return unique.sort();
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const keyword = search.toLowerCase().trim();
      const matchSearch =
        !keyword ||
        room.roomCode?.toLowerCase().includes(keyword) ||
        room.block?.toLowerCase().includes(keyword) ||
        room.occupants?.some((o) => o.name?.toLowerCase().includes(keyword));
      const matchBlock = blockFilter === "all" || room.block === blockFilter;
      const matchStatus = statusFilter === "all" || room.status === statusFilter;
      return matchSearch && matchBlock && matchStatus;
    });
  }, [search, blockFilter, statusFilter, rooms]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading rooms...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Room List</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of all hostel rooms and occupancy. ({rooms.length} rooms)
          </p>
        </div>
        <Link
          to="/admin/rooms/add"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-sm hover:bg-emerald-700"
        >
          + Add Room
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by room code, block or student name..."
          className="flex-1 min-w-[220px] px-3 py-2 text-sm bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="px-3 py-2 text-sm bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={blockFilter}
          onChange={(e) => setBlockFilter(e.target.value)}
        >
          <option value="all">All Blocks</option>
          {blocks.map((b) => (
            <option key={b} value={b}>Block {b}</option>
          ))}
        </select>
        <select
          className="px-3 py-2 text-sm bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="PARTIAL">Partial</option>
          <option value="OCCUPIED">Full</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">Room Code</th>
              <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">Block</th>
              <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">Floor</th>
              <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">Capacity</th>
              <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">Occupants</th>
              <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                <td className="px-6 py-3 font-medium text-gray-800">{room.roomCode}</td>
                <td className="px-6 py-3 text-gray-600">{room.block}</td>
                <td className="px-6 py-3 text-gray-600">{room.floor}</td>
                <td className="px-6 py-3 text-gray-600">{room.capacity}</td>
                <td className="px-6 py-3 text-gray-600">
                  <span className={room.occupied > 0 ? "text-emerald-600 font-medium" : "text-gray-400"}>
                    {room.occupied} / {room.capacity}
                  </span>
                  {room.occupants && room.occupants.length > 0 && (
                    <div className="mt-1">
                      {room.occupants.map((o) => (
                        <span key={o.id} className="text-xs text-gray-400 block">{o.name}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-3">
                  <StatusPill status={room.status} />
                </td>
                <td className="px-6 py-3 text-right space-x-2">
                  {/* ✅ FIXED: correct route paths matching App.jsx */}
                  <Link
                    to={`/admin/rooms/details/${room.id}`}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    View
                  </Link>
                  <Link
                    to={`/admin/rooms/edit/${room.id}`}
                    className="px-3 py-1.5 rounded-lg border border-emerald-400 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                  >
                    Edit
                  </Link>
                  <Link
                    to="/admin/rooms/allocation"
                    className="px-3 py-1.5 rounded-lg border border-indigo-400 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    Allocate
                  </Link>
                </td>
              </tr>
            ))}
            {filteredRooms.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                  No rooms match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}