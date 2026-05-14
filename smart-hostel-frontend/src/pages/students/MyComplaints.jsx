import { useState, useEffect } from 'react';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';

export default function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const res = await api.get('/api/complaints/my-complaints');
      setComplaints(res.data);
    } catch (err) {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-600/20 text-yellow-300';
      case 'IN_PROGRESS': return 'bg-blue-600/20 text-blue-300';
      case 'RESOLVED': return 'bg-green-600/20 text-green-300';
      case 'REJECTED': return 'bg-red-600/20 text-red-300';
      default: return 'bg-slate-600/20 text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-8">
          <p className="text-slate-300 text-center">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">My Complaints</h2>
        <button
          onClick={() => navigate('/students/complaints/new')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm"
        >
          + New Complaint
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/40 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {complaints.length === 0 ? (
        <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-400 mb-4">No complaints found</p>
          <button
            onClick={() => navigate('/students/complaints/new')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Submit Your First Complaint
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs text-slate-500">#{complaint.id}</span>
                  <h3 className="text-lg font-medium text-white mt-1">{complaint.subject}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Category</p>
                  <p className="text-slate-300">{complaint.category}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Room</p>
                  <p className="text-slate-300">{complaint.roomCode || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Submitted</p>
                  <p className="text-slate-300">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-[#0a1125] rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{complaint.description}</p>
              </div>

              {complaint.adminResponse && (
                <div className="border-t border-slate-700 pt-4 mt-2">
                  <p className="text-xs text-slate-500 mb-1">Admin Response:</p>
                  <p className="text-sm text-blue-300">{complaint.adminResponse}</p>
                </div>
              )}

              {complaint.resolvedAt && (
                <p className="text-xs text-slate-500 mt-3">
                  Resolved on: {new Date(complaint.resolvedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}