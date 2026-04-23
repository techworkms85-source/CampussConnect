import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/outline';

const CATEGORIES = ['Academic', 'Infrastructure', 'Food', 'Events', 'Other'];

export default function Feedback() {
  const { user } = useAuth();
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: 'Academic', subject: '', message: '', rating: 0, isAnonymous: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/feedback/mine').then(({ data }) => setMyFeedbacks(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) return toast.error('Please select a rating');
    if (!form.subject.trim() || !form.message.trim()) return toast.error('Fill all required fields');
    setSubmitting(true);
    try {
      const { data } = await api.post('/feedback', form);
      toast.success('Feedback submitted!');
      setMyFeedbacks([data.data, ...myFeedbacks]);
      setForm({ category: 'Academic', subject: '', message: '', rating: 0, isAnonymous: false });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const statusColor = { pending: 'bg-yellow-100 text-yellow-700', reviewed: 'bg-blue-100 text-blue-700', resolved: 'bg-green-100 text-green-700' };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit form */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Submit Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="input-field" placeholder="Subject *" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
            <textarea className="input-field" placeholder="Your feedback *" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating *</p>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(r => (
                  <button type="button" key={r} onClick={() => setForm({ ...form, rating: r })}>
                    {r <= form.rating ? <StarSolid className="w-6 h-6 text-yellow-400" /> : <StarIcon className="w-6 h-6 text-gray-300" />}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm({ ...form, isAnonymous: e.target.checked })} className="rounded" />
              Submit anonymously
            </label>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        {/* My feedbacks */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">My Submissions</h2>
          {!myFeedbacks.length ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No feedback submitted yet.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {myFeedbacks.map(fb => (
                <div key={fb._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{fb.subject}</span>
                    <span className={`badge ${statusColor[fb.status]} dark:bg-opacity-20`}>{fb.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{fb.category} • {'⭐'.repeat(fb.rating)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{fb.message}</p>
                  {fb.adminResponse && (
                    <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded p-2 text-xs text-blue-700 dark:text-blue-400">
                      Admin: {fb.adminResponse}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
