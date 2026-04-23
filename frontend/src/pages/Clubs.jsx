import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline';

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Social', 'Academic', 'General'];

export default function Clubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'General', email: '', instagram: '', coordinator: '' });
  const [saving, setSaving] = useState(false);

  const fetchClubs = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (catFilter) params.set('category', catFilter);
    api.get(`/clubs?${params}`).then(({ data }) => setClubs(data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchClubs(); }, [search, catFilter]);

  const handleJoin = async (id) => {
    try { await api.post(`/clubs/${id}/join`); toast.success('Join request sent!'); fetchClubs(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/clubs', form);
      toast.success('Club created!');
      setShowCreate(false);
      fetchClubs();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const isMember = (club) => club.members?.some(m => (m._id || m) === user?._id);
  const hasRequested = (club) => club.joinRequests?.some(r => (r._id || r) === user?._id);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bennett Clubs</h1>
        {user?.role === 'admin' && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
            <PlusIcon className="w-4 h-4" /> Add Club
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search clubs..." /></div>
        <select className="input-field w-full sm:w-40" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map(club => (
          <div key={club._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserGroupIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{club.name}</h3>
                <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs">{club.category}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{club.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{club.members?.length || 0} members</span>
              <div className="flex gap-2">
                <button onClick={() => setSelected(club)} className="btn-secondary text-xs">Details</button>
                {!isMember(club) && !hasRequested(club) && (
                  <button onClick={() => handleJoin(club._id)} className="btn-primary text-xs">Join</button>
                )}
                {hasRequested(club) && <span className="text-xs text-yellow-600 font-medium">Requested</span>}
                {isMember(club) && <span className="text-xs text-green-600 font-medium">Member ✓</span>}
              </div>
            </div>
          </div>
        ))}
        {!clubs.length && <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center py-8">No clubs found.</p>}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div className="space-y-3 text-sm">
            <p className="text-gray-700 dark:text-gray-300">{selected.description}</p>
            <div className="grid grid-cols-2 gap-2 text-gray-500 dark:text-gray-400">
              <div>Category: <span className="font-medium text-gray-900 dark:text-white">{selected.category}</span></div>
              <div>Members: <span className="font-medium text-gray-900 dark:text-white">{selected.members?.length || 0}</span></div>
              {selected.coordinator && <div>Coordinator: <span className="font-medium text-gray-900 dark:text-white">{selected.coordinator}</span></div>}
              {selected.email && <div>Email: <span className="font-medium text-gray-900 dark:text-white">{selected.email}</span></div>}
              {selected.instagram && <div>Instagram: <span className="font-medium text-gray-900 dark:text-white">{selected.instagram}</span></div>}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Club">
        <form onSubmit={handleCreate} className="space-y-3">
          <input className="input-field" placeholder="Club Name *" value={form.name} onChange={set('name')} required />
          <textarea className="input-field" placeholder="Description *" rows={3} value={form.description} onChange={set('description')} required />
          <select className="input-field" value={form.category} onChange={set('category')}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="input-field" placeholder="Coordinator Name" value={form.coordinator} onChange={set('coordinator')} />
          <input type="email" className="input-field" placeholder="Club Email" value={form.email} onChange={set('email')} />
          <input className="input-field" placeholder="Instagram Handle" value={form.instagram} onChange={set('instagram')} />
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Creating...' : 'Create Club'}</button>
        </form>
      </Modal>
    </div>
  );
}
