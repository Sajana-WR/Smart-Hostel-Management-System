import { useState, useEffect } from 'react';
import api from '../../api/api';

export default function Requests() {
  const userId = localStorage.getItem('userId');
  const [sentRequests,     setSentRequests]     = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      const res = await api.get(`/api/roommates/user/${userId}`);
      console.log("FULL RESPONSE:", res.data);
      console.log("FIRST RECEIVED:", res.data.received?.[0]);
      setSentRequests    (res.data.sent     || []);
      setReceivedRequests(res.data.received || []);
    } catch {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const res = await api.put(`/api/roommates/accept/${requestId}`, { userId: Number(userId) });
      setSuccess(res.data.message || 'Request accepted!');
      setError('');
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const res = await api.put(`/api/roommates/reject/${requestId}`, { userId: Number(userId) });
      setSuccess(res.data.message || 'Request rejected');
      setError('');
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleCancel = async (requestId) => {
    try {
      const res = await api.delete(`/api/roommates/cancel/${requestId}`, {
        data: { userId: Number(userId) }
      });
      setSuccess(res.data.message || 'Request cancelled');
      setError('');
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-3">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
      <span className="text-slate-400 text-sm">Loading requests...</span>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white">Roommate Requests</h2>
        <p className="text-sm text-slate-400 mt-1">Manage your roommate requests</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 border border-green-500/40 text-green-200 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* ── RECEIVED REQUESTS ── */}
      <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Received Requests ({receivedRequests.length})
        </h3>

        {receivedRequests.length === 0 ? (
          <p className="text-slate-400 text-sm">No pending requests</p>
        ) : (
          <div className="space-y-4">
            {receivedRequests.map(req => (
              <ReceivedCard
                key={req.id}
                req={req}
                onAccept={() => handleAccept(req.id)}
                onReject={() => handleReject(req.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── SENT REQUESTS ── */}
      <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Sent Requests ({sentRequests.length})
        </h3>

        {sentRequests.length === 0 ? (
          <p className="text-slate-400 text-sm">No pending requests</p>
        ) : (
          <div className="space-y-3">
            {sentRequests.map(req => (
              <div key={req.id} className="bg-[#0a1125] border border-slate-700 rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm flex-shrink-0">
                    {(req.requestedName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{req.requestedName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sent: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={req.status} />
                  {req.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(req.id)}
                      className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xs text-white font-medium transition"
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

/* ── RECEIVED CARD with expandable profile details ── */
function ReceivedCard({ req, onAccept, onReject }) {
  const [expanded, setExpanded] = useState(false);

  // ✅ Field names now match the backend DTO exactly
  const profileDetails = [
    { label: 'Full Name', value: req.requesterName },
    { label: 'Email',     value: req.requesterEmail },
    { label: 'Username',  value: req.requesterUsername },
    { label: 'Degree',    value: req.requesterDegree },
    { label: 'Hometown',  value: req.requesterHometown },
    { label: 'School',    value: req.requesterSchool },
  ].filter(d => d.value);

  const prefDetails = [
    { label: 'Study Time',  value: req.requesterStudyTime },
    { label: 'Sleep Time',  value: req.requesterSleepTime },
    { label: 'Wake Up',     value: req.requesterWakeUpTime },
    { label: 'Cleanliness', value: req.requesterCleanliness },
    { label: 'Noise',       value: req.requesterNoiseTolerance },
    { label: 'Guests',      value: req.requesterGuestFrequency },
    { label: 'Smoking',     value: req.requesterSmoking },
    { label: 'Personality', value: req.requesterPersonality },
    { label: 'Room Temp',   value: req.requesterRoomTemp },
    { label: 'Sharing',     value: req.requesterSharing },
  ].filter(d => d.value);

  return (
    <div className="bg-[#0a1125] border border-slate-700 rounded-xl overflow-hidden">

      {/* Top row */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
            {(req.requesterName || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{req.requesterName}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Sent: {new Date(req.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            {expanded ? 'Hide Details ▲' : 'View Details ▼'}
          </button>
          <button
            onClick={onAccept}
            className="text-xs px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="text-xs px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Expandable details panel */}
      {expanded && (
        <div className="border-t border-slate-800 px-5 py-5 bg-slate-900/40 space-y-5">

          {/* Profile details */}
          {profileDetails.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                Profile Details
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {profileDetails.map(d => (
                  <div key={d.label}>
                    <p className="text-xs text-slate-500 mb-0.5">{d.label}</p>
                    <p className="text-sm text-slate-200 font-medium">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questionnaire preferences */}
          {prefDetails.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                Roommate Preferences
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {prefDetails.map(d => (
                  <div key={d.label}>
                    <p className="text-xs text-slate-500 mb-0.5">{d.label}</p>
                    <p className="text-sm text-slate-200 font-medium">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback — shown when backend doesn't return details */}
          {profileDetails.length === 0 && prefDetails.length === 0 && (
            <div className="text-center py-2">
              <p className="text-sm text-slate-500">
                No additional details returned by the server.
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Check browser Console (F12) for the raw API response.
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

/* ── Status pill ── */
function StatusPill({ status }) {
  const styles = {
    PENDING:  'bg-yellow-900/40 text-yellow-400',
    ACCEPTED: 'bg-emerald-900/40 text-emerald-400',
    REJECTED: 'bg-red-900/40 text-red-400',
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[status] ?? 'bg-slate-800 text-slate-400'}`}>
      {status || 'Pending'}
    </span>
  );
}