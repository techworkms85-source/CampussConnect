import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { UsersIcon, CalendarIcon, UserGroupIcon, ChatBubbleLeftIcon, BookOpenIcon, MagnifyingGlassIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [pwModal, setPwModal] = useState(null); // userId
  const [newPw, setNewPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/feedback'),
      api.get('/orders'),
    ]).then(([s, u, f, o]) => {
      setStats(s.data.data);
      setUsers(u.data.data);
      setFeedbacks(f.data.data);
      setOrders(o.data.data);
    }).catch(() => toast.error('Failed to load admin data')).finally(() => setLoading(false));
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  const handleResetPassword = async () => {
    if (!newPw || newPw.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPw(true);
    try {
      await api.put(`/admin/users/${pwModal}/password`, { newPassword: newPw });
      toast.success('Password updated');
      setPwModal(null);
      setNewPw('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSavingPw(false); }
  };

  const handleFeedbackResponse = async (id, status, adminResponse) => {
    try {
      const { data } = await api.put(`/feedback/${id}`, { status, adminResponse });
      setFeedbacks(feedbacks.map(f => f._id === id ? data.data : f));
      toast.success('Response saved');
    } catch { toast.error('Failed'); }
  };

  const handleOrderStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status });
      setOrders(orders.map(o => o._id === id ? data.data : o));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Spinner />;

  const statCards = [
    { label: 'Total Users', value: stats?.users, icon: UsersIcon, color: 'bg-blue-500' },
    { label: 'Events', value: stats?.events, icon: CalendarIcon, color: 'bg-indigo-500' },
    { label: 'Clubs', value: stats?.clubs, icon: UserGroupIcon, color: 'bg-purple-500' },
    { label: 'Feedbacks', value: stats?.feedbacks, icon: ChatBubbleLeftIcon, color: 'bg-pink-500' },
    { label: 'Resources', value: stats?.resources, icon: BookOpenIcon, color: 'bg-green-500' },
    { label: 'Lost & Found', value: stats?.lostFound, icon: MagnifyingGlassIcon, color: 'bg-yellow-500' },
  ];

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    ready: 'bg-green-100 text-green-700',
    delivered: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center">
            <div className={`w-10 h-10 ${color} rounded flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {['overview', 'users', 'orders', 'feedback'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Branch / Sem</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map(u => (
                <tr key={u._id}>
                  <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{u.branch || '—'} / Sem {u.semester}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  </td>
                  <td className="py-3 flex gap-2">
                    <button onClick={() => { setPwModal(u._id); setNewPw(''); }} className="text-blue-500 hover:text-blue-700 text-xs">Change Password</button>
                    <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-8">No orders yet.</p>}
          {orders.map(order => (
            <div key={order._id} className="card text-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{order.outlet?.name}</span>
                  <span className="text-gray-400 ml-2">by {order.user?.name} ({order.user?.email})</span>
                </div>
                <span className={`badge ${statusColor[order.status]}`}>{order.status}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-400 mb-2">
                {order.items.map((item, i) => <span key={i} className="mr-3">{item.name} x{item.quantity}</span>)}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">₹{order.total}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  <select
                    value={order.status}
                    onChange={e => handleOrderStatus(order._id, e.target.value)}
                    className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {['pending','confirmed','ready','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback tab */}
      {tab === 'feedback' && (
        <div className="space-y-3">
          {feedbacks.map(fb => (
            <FeedbackCard key={fb._id} fb={fb} onRespond={handleFeedbackResponse} />
          ))}
          {!feedbacks.length && <p className="text-gray-500 dark:text-gray-400 text-center py-8">No feedback yet.</p>}
        </div>
      )}

      {tab === 'overview' && (
        <div className="card">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Use the tabs above to manage users, orders and feedback.</p>
        </div>
      )}

      {/* Change password modal */}
      <Modal open={!!pwModal} onClose={() => setPwModal(null)} title="Change User Password">
        <div className="space-y-3">
          <input
            type="password"
            className="input-field"
            placeholder="New password (min 6 characters)"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
          />
          <button onClick={handleResetPassword} disabled={savingPw} className="btn-primary w-full">
            {savingPw ? 'Saving...' : 'Update Password'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function FeedbackCard({ fb, onRespond }) {
  const [response, setResponse] = useState(fb.adminResponse || '');
  const [status, setStatus] = useState(fb.status);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-medium text-gray-900 dark:text-white">{fb.subject}</span>
          <span className="ml-2 badge bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">{fb.category}</span>
        </div>
        <span className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{fb.message}</p>
      <p className="text-xs text-gray-400 mb-3">By: {fb.isAnonymous ? 'Anonymous' : fb.submittedBy?.name || 'Unknown'}</p>
      <div className="flex gap-2">
        <input
          className="input-field flex-1 text-sm"
          placeholder="Admin response..."
          value={response}
          onChange={e => setResponse(e.target.value)}
        />
        <select className="input-field w-32 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
        <button onClick={() => onRespond(fb._id, status, response)} className="btn-primary text-sm">Save</button>
      </div>
    </div>
  );
}
