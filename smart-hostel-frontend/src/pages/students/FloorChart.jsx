// src/pages/student/FloorChart.jsx
import { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';

export default function FloorChart() {
  const userId = Number(localStorage.getItem('userId'));
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeBlock, setActiveBlock] = useState('all');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/api/rooms/all');
      setRooms(res.data);
    } catch {
      setError('Failed to load room data');
    } finally {
      setLoading(false);
    }
  };

  // Get unique blocks
  const blocks = useMemo(() => {
    const unique = [...new Set(rooms.map(r => r.block))].sort();
    return unique;
  }, [rooms]);

  // Filter rooms by selected block
  const filteredRooms = useMemo(() => {
    if (activeBlock === 'all') return rooms;
    return rooms.filter(r => r.block === activeBlock);
  }, [rooms, activeBlock]);

  // Group rooms by floor (descending so top floor shows first)
  const floorMap = useMemo(() => {
    const map = {};
    filteredRooms.forEach(room => {
      const floor = room.floor;
      if (!map[floor]) map[floor] = [];
      map[floor].push(room);
    });
    // Sort rooms within each floor by roomCode
    Object.keys(map).forEach(floor => {
      map[floor].sort((a, b) => a.roomCode.localeCompare(b.roomCode));
    });
    return map;
  }, [filteredRooms]);

  const floors = useMemo(() => {
    return Object.keys(floorMap).map(Number).sort((a, b) => b - a);
  }, [floorMap]);

  // Find current user's room
  const myRoom = useMemo(() => {
    return rooms.find(room =>
      room.occupants?.some(occ => occ.id === userId)
    );
  }, [rooms, userId]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredRooms.length;
    const occupied = filteredRooms.filter(r => r.status === 'OCCUPIED').length;
    const partial = filteredRooms.filter(r => r.status === 'PARTIAL').length;
    const available = filteredRooms.filter(r => r.status === 'AVAILABLE').length;
    const totalBeds = filteredRooms.reduce((sum, r) => sum + (r.capacity || 2), 0);
    const usedBeds = filteredRooms.reduce((sum, r) => sum + (r.occupied || 0), 0);
    return { total, occupied, partial, available, totalBeds, usedBeds };
  }, [filteredRooms]);

  const getRoomStyle = (room) => {
    const isMyRoom = myRoom && room.roomCode === myRoom.roomCode;

    if (isMyRoom) {
      return 'bg-blue-500/30 border-blue-400 ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/20';
    }
    if (room.status === 'OCCUPIED') {
      return 'bg-red-500/20 border-red-500/40 hover:bg-red-500/30';
    }
    if (room.status === 'PARTIAL') {
      return 'bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30';
    }
    return 'bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30';
  };

  const getRoomIcon = (room) => {
    const isMyRoom = myRoom && room.roomCode === myRoom.roomCode;
    if (isMyRoom) return '🏠';
    if (room.status === 'OCCUPIED') return '🔒';
    if (room.status === 'PARTIAL') return '👤';
    return '🔓';
  };

  const getBedIcons = (room) => {
    const beds = [];
    for (let i = 0; i < (room.capacity || 2); i++) {
      if (i < (room.occupied || 0)) {
        // Check if this occupant is the current user
        const occupant = room.occupants?.[i];
        const isMe = occupant && occupant.id === userId;
        beds.push(
          <span key={i} className={`text-lg ${isMe ? 'grayscale-0' : ''}`} title={occupant?.name || 'Occupied'}>
            {isMe ? '🙋' : '🛏️'}
          </span>
        );
      } else {
        beds.push(
          <span key={i} className="text-lg opacity-30" title="Empty bed">
            🛏️
          </span>
        );
      }
    }
    return beds;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-3">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
      <span className="text-slate-400 text-sm">Loading floor chart...</span>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-3 rounded-lg text-sm">
        {error}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white">Hostel Floor Chart</h2>
        <p className="text-sm text-slate-400 mt-1">
          Visual map of all rooms — find your room highlighted in blue
        </p>
      </div>

      {/* My Room Highlight */}
      {myRoom && (
        <div className="bg-blue-500/15 border border-blue-500/30 rounded-xl px-5 py-4 flex items-center gap-4">
          <div className="text-3xl">🏠</div>
          <div>
            <p className="text-blue-300 font-semibold text-sm">YOUR ROOM</p>
            <p className="text-white text-lg font-bold">{myRoom.roomCode}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-slate-400 text-xs">Block {myRoom.block} · Floor {myRoom.floor}</p>
            <p className="text-slate-300 text-sm mt-0.5">
              {myRoom.occupants?.map(o => o.name).join(' & ') || 'No occupants'}
            </p>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0d1733]/70 border border-slate-800 rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-slate-400 mt-1">Total Rooms</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.available}</p>
          <p className="text-xs text-slate-400 mt-1">Available</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{stats.partial}</p>
          <p className="text-xs text-slate-400 mt-1">Partially Full</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.occupied}</p>
          <p className="text-xs text-slate-400 mt-1">Full</p>
        </div>
      </div>

      {/* Block Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveBlock('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeBlock === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          }`}
        >
          All Blocks
        </button>
        {blocks.map(block => (
          <button
            key={block}
            onClick={() => setActiveBlock(block)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeBlock === block
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            Block {block}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500/30 border border-blue-400"></div>
          <span>Your Room</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/40"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/40"></div>
          <span>Partially Full (1 bed free)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/40"></div>
          <span>Full</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🛏️</span> <span>Occupied Bed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-30">🛏️</span> <span>Empty Bed</span>
        </div>
      </div>

      {/* Floor Chart — Building View */}
      <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl overflow-hidden">

        {/* Building Header */}
        <div className="bg-slate-800/50 px-5 py-3 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏢</span>
            <span className="text-white font-semibold text-sm">
              {activeBlock === 'all' ? 'All Blocks' : `Block ${activeBlock}`}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {stats.usedBeds} / {stats.totalBeds} beds occupied
          </div>
        </div>

        {/* Floors */}
        <div className="divide-y divide-slate-800/50">
          {floors.map(floor => (
            <div key={floor} className="flex">

              {/* Floor Label */}
              <div className="w-20 sm:w-24 flex-shrink-0 bg-slate-800/30 flex flex-col items-center justify-center py-6 border-r border-slate-800/50">
                <span className="text-2xl font-bold text-slate-300">{floor}</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Floor</span>
              </div>

              {/* Rooms on this floor */}
              <div className="flex-1 p-4">
                <div className="flex flex-wrap gap-3">
                  {floorMap[floor].map(room => {
                    const isMyRoom = myRoom && room.roomCode === myRoom.roomCode;
                    return (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoom(selectedRoom?.id === room.id ? null : room)}
                        className={`
                          relative flex flex-col items-center justify-center
                          w-28 sm:w-32 h-24 rounded-xl border-2 transition-all duration-200
                          cursor-pointer select-none
                          ${getRoomStyle(room)}
                          ${selectedRoom?.id === room.id ? 'scale-105' : 'hover:scale-[1.03]'}
                        `}
                      >
                        {/* Room code */}
                        <span className="text-white font-bold text-sm">{room.roomCode}</span>

                        {/* Bed icons */}
                        <div className="flex gap-1 mt-1.5">
                          {getBedIcons(room)}
                        </div>

                        {/* Block badge */}
                        {activeBlock === 'all' && (
                          <span className="absolute top-1.5 right-1.5 text-[10px] bg-slate-900/60 text-slate-400 px-1.5 py-0.5 rounded">
                            {room.block}
                          </span>
                        )}

                        {/* My room indicator */}
                        {isMyRoom && (
                          <span className="absolute -top-2 -left-2 text-sm animate-bounce">📍</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ground / Entrance */}
        <div className="bg-slate-800/30 px-5 py-3 border-t border-slate-700 text-center">
          <span className="text-xs text-slate-500 uppercase tracking-widest">🚪 Ground Floor / Entrance</span>
        </div>
      </div>

      {/* Selected Room Details Popup */}
      {selectedRoom && (
        <div className="bg-[#0d1733] border border-slate-700 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getRoomIcon(selectedRoom)}</span>
              <div>
                <h3 className="text-white font-bold text-lg">{selectedRoom.roomCode}</h3>
                <p className="text-xs text-slate-400">
                  Block {selectedRoom.block} · Floor {selectedRoom.floor} · Capacity: {selectedRoom.capacity}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedRoom(null)}
              className="text-slate-500 hover:text-slate-300 transition text-xl"
            >
              ✕
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <span className={`
              text-xs font-semibold px-3 py-1 rounded-full
              ${selectedRoom.status === 'OCCUPIED' ? 'bg-red-900/40 text-red-400' :
                selectedRoom.status === 'PARTIAL' ? 'bg-amber-900/40 text-amber-400' :
                'bg-emerald-900/40 text-emerald-400'}
            `}>
              {selectedRoom.status === 'OCCUPIED' ? 'Full' :
               selectedRoom.status === 'PARTIAL' ? 'Partially Occupied' : 'Available'}
            </span>
            <span className="text-xs text-slate-500">
              {selectedRoom.occupied || 0} / {selectedRoom.capacity} beds occupied
            </span>
          </div>

          {/* Occupants */}
          {selectedRoom.occupants && selectedRoom.occupants.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                Occupants
              </p>
              <div className="space-y-2">
                {selectedRoom.occupants.map((occ, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-4 py-2.5">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                      ${occ.id === userId
                        ? 'bg-blue-600/30 border border-blue-500 text-blue-400'
                        : 'bg-slate-700 text-slate-300'
                      }
                    `}>
                      {occ.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">
                        {occ.name}
                        {occ.id === userId && (
                          <span className="ml-2 text-xs text-blue-400 font-normal">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{occ.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty beds */}
          {selectedRoom.available > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 text-center">
              <p className="text-emerald-400 text-sm font-medium">
                {selectedRoom.available} bed{selectedRoom.available > 1 ? 's' : ''} available
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}