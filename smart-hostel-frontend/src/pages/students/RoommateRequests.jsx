import { useState, useEffect } from 'react';
import api from '../../api/api';

export default function RoommateRequests() {
  const userId = localStorage.getItem('userId');
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const res = await api.get(`/api/roommates/user/${userId}`);
      setSentRequests(res.data.sent || []);
      setReceivedRequests(res.data.received || []);
    } catch {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await api.put(`/api/roommates/accept/${requestId}`, { userId });
      setSuccess('Request accepted! You are now roommates.');
      setExpandedId(null);
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.put(`/api/roommates/reject/${requestId}`, { userId });
      setSuccess('Request rejected');
      setExpandedId(null);
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleCancel = async (requestId) => {
    try {
      await api.delete(`/api/roommates/cancel/${requestId}`, { data: { userId } });
      setSuccess('Request cancelled');
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const DetailRow = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="flex gap-2 text-sm">
        <span className="text-slate-400 min-w-[140px]">{label}:</span>
        <span className="text-white capitalize">{value}</span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white">Roommate Requests</h2>
        <p className="text-sm text-slate-400 mt-1">Manage your roommate requests</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
          <p className="text-green-300 text-sm">{success}</p>
        </div>
      )}

      {/* ── Received Requests ── */}
      <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Received Requests ({receivedRequests.length})
        </h3>

        {receivedRequests.length === 0 ? (
          <p className="text-slate-400 text-sm">No pending requests</p>
        ) : (
          <div className="space-y-4">
            {receivedRequests.map(req => (
              <div key={req.id} className="bg-[#0a1125] border border-slate-700 rounded-lg p-4">

                {/* Header row */}
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {req.requesterName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{req.requesterName}</p>
                      <p className="text-xs text-slate-400">
                        Sent: {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => toggleExpand(req.id)}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-sm text-white transition-colors"
                    >
                      {expandedId === req.id ? 'Hide Details ▲' : 'Show Details ▼'}
                    </button>
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm text-white transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Expandable details panel */}
                {expandedId === req.id && (
                  <div className="mt-4 pt-4 border-t border-slate-700 space-y-4">

                    {/* Basic Info */}
                    <div>
                      <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                        Basic Info
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <DetailRow label="Email"    value={req.requesterEmail} />
                        <DetailRow label="Username" value={req.requesterUsername} />
                        <DetailRow label="Degree"   value={req.requesterDegree} />
                        <DetailRow label="School"   value={req.requesterSchool} />
                        <DetailRow label="Hometown" value={req.requesterHometown} />
                      </div>
                    </div>

                    {/* Survey / Lifestyle */}
                    {(req.requesterStudyTime || req.requesterSleepTime ||
                      req.requesterCleanliness || req.requesterPersonality) && (
                      <div>
                        <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                          Lifestyle & Preferences
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <DetailRow label="Study Time"      value={req.requesterStudyTime} />
                          <DetailRow label="Sleep Time"      value={req.requesterSleepTime} />
                          <DetailRow label="Wake Up Time"    value={req.requesterWakeUpTime} />
                          <DetailRow label="Cleanliness"     value={req.requesterCleanliness} />
                          <DetailRow label="Noise Tolerance" value={req.requesterNoiseTolerance} />
                          <DetailRow label="Guests"          value={req.requesterGuestFrequency} />
                          <DetailRow label="Smoking"         value={req.requesterSmoking} />
                          <DetailRow label="Personality"     value={req.requesterPersonality} />
                          <DetailRow label="Room Temp"       value={req.requesterRoomTemp} />
                          <DetailRow label="Sharing"         value={req.requesterSharing} />
                        </div>
                      </div>
                    )}

                    {/* Fallback if no data at all */}
                    {!req.requesterEmail && !req.requesterDegree &&
                     !req.requesterStudyTime && !req.requesterPersonality && (
                      <p className="text-slate-500 text-xs italic">
                        This student has not completed their profile or survey yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sent Requests ── */}
      <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Sent Requests ({sentRequests.length})
        </h3>

        {sentRequests.length === 0 ? (
          <p className="text-slate-400 text-sm">No pending requests</p>
        ) : (
          <div className="space-y-4">
            {sentRequests.map(req => (
              <div key={req.id} className="bg-[#0a1125] border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {req.requestedName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{req.requestedName}</p>
                      <p className="text-xs text-slate-400">
                        Status:{' '}
                        <span className={
                          req.status === 'PENDING'  ? 'text-yellow-400' :
                          req.status === 'ACCEPTED' ? 'text-green-400'  : 'text-red-400'
                        }>
                          {req.status}
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Sent: {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {req.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(req.id)}
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm text-white transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}