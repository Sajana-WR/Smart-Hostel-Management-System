import { useState, useEffect } from 'react';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasRoom, setHasRoom] = useState(true);
  const [roomCheckDone, setRoomCheckDone] = useState(false);
  
  const [formData, setFormData] = useState({
    category: 'Maintenance',
    subject: '',
    description: ''
  });

  useEffect(() => {
    checkRoomAccess();
  }, []);

  const checkRoomAccess = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const res = await api.get(`/api/roommates/can-send/${userId}`);
      // If user has no room, they can't submit complaints
      if (!res.data.hasRoom) {
        setHasRoom(false);
        setError('You must have a room to submit a complaint');
      }
    } catch (err) {
      setError('Failed to verify room access');
    } finally {
      setLoading(false);
      setRoomCheckDone(true);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/api/complaints/submit', formData);
      setSuccess(res.data.message || 'Complaint submitted successfully!');
      setFormData({
        category: 'Maintenance',
        subject: '',
        description: ''
      });
      
      // Redirect to complaints list after 2 seconds
      setTimeout(() => {
        navigate('/students/complaints');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-8">
          <p className="text-slate-300 text-center">Checking room access...</p>
        </div>
      </div>
    );
  }

  if (!hasRoom && roomCheckDone) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-[#0d1733]/70 border border-red-700/50 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold text-red-400 mb-3">Access Denied</h3>
          <p className="text-slate-300 mb-4">
            You must have a room assignment to submit complaints.
          </p>
          <p className="text-sm text-slate-400">
            If you believe this is an error, please contact the hostel administration.
          </p>
          <button
            onClick={() => navigate('/students/my-room')}
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            View My Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-2">Submit a Complaint</h2>
        <p className="text-sm text-slate-400 mb-6">
          Report an issue related to your room or hostel facilities.
        </p>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/40 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/20 border border-green-500/40 text-green-200 p-4 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-[#0a1125] text-white border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-600"
              required
            >
              <option value="Maintenance">Maintenance</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Noise">Noise Complaint</option>
              <option value="Security">Security</option>
              <option value="Electricity">Electricity</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Furniture">Furniture</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Short summary of the issue"
              className="w-full bg-[#0a1125] text-white border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-600"
              required
              maxLength="100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain the problem with details..."
              rows="5"
              className="w-full bg-[#0a1125] text-white border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-600 resize-none"
              required
              maxLength="1000"
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Note */}
          <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4">
            <p className="text-xs text-blue-300">
              ℹ️ Your complaint will be linked to your student ID and room ({localStorage.getItem('roomCode') || 'A-201'}). 
              You'll receive updates when admin responds.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/students/complaints')}
              className="px-6 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white font-medium transition"
            >
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>

      <p className="text-xs text-slate-600 mt-4 text-center">
        In the backend, complaints will be saved in a Complaint table linked to your Student ID and Room.
      </p>
    </div>
  );
}