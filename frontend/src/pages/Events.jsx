import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'General'];

const emptyForm = () => ({
  title: '', description: '', category: 'General', date: '', endDate: '',
  venue: '', organizer: '', registrationLink: '', maxParticipants: 0, tags: '',
});

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [upcoming, setUpcoming] = useState('true');
  const [catFilter, setCatFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchEvents = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (upcoming) params.set('upcoming', upcoming);
    if (catFilter) params.set('category', catFilter);
    api.get(`/events?${params}`).then(({ data }) => setEvents(data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, [search, upcoming, catFilter]);

  const handleRegister = async (id) => {
    try { await api.post(`/events/${id}/register`); toast.success('Registered!'); fetchEvents(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/events/${editing}`, form);
      else await api.post('/events', form);
      toast.success(editing ? 'Updated!' : 'Event created!');
      setShowCreate(false);
      setEditing(null);
      fetchEvents();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/events/${id}`); toast.success('Deleted'); fetchEvents(); }
    catch { toast.error('Failed to delete'); }
  };

  const openEdit = (event) => {
    setEditing(event._id);
    setForm({ ...event, date: event.date?.split('T')[0], endDate: event.endDate?.split('T')[0] || '', tags: event.tags?.join(', ') || '' });
    setShowCreate(true);
  };

  const isRegistered = (event) => event.registrations?.some(r => (r._id || r) === user?._id);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
        {user?.role === 'admin' && (
          <button onClick={() => { setEditing(null); setForm(emptyForm()); setShowCreate(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <PlusIcon className="w-4 h-4" /> Add Event
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search events..." /></div>
        <select className="input-field w-full sm:w-36" value={upcoming} onChange={e => setUpcoming(e.target.value)}>
          <option value="true">Upcoming</option>
          <option value="false">Past</option>
          <option value="">All</option>
        </select>
        <select className="input-field w-full sm:w-40" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(event => (
          <div key={event._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="badge bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{event.category}</span>
              {new Date(event.date) < new Date() && <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">Past</span>}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{event.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{event.description}</p>
            <div className="space-y-1 text-xs text-gray-400 mb-3">
              <div className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" />{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <div className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />{event.venue}</div>
              <div className="flex items-center gap-1"><UserGroupIcon className="w-3.5 h-3.5" />{event.registrations?.length || 0}{event.maxParticipants ? `/${event.maxParticipants}` : ''} registered</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelected(event)} className="btn-secondary text-xs flex-1">Details</button>
              {new Date(event.date) >= new Date() && !isRegistered(event) && (
                <button onClick={() => handleRegister(event._id)} className="btn-primary text-xs flex-1">Register</button>
              )}
              {isRegistered(event) && <span className="text-xs text-green-600 font-medium self-center">Registered ✓</span>}
              {user?.role === 'admin' && (
                <>
                  <button onClick={() => openEdit(event)} className="btn-secondary text-xs px-2">Edit</button>
                  <button onClick={() => handleDelete(event._id)} className="btn-danger text-xs px-2">Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
        {!events.length && <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center py-8">No events found.</p>}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title} size="lg">
        {selected && (
          <div className="space-y-3 text-sm">
            <p className="text-gray-700 dark:text-gray-300">{selected.description}</p>
            <div className="grid grid-cols-2 gap-2 text-gray-500 dark:text-gray-400">
              <div>Date: <span className="font-medium text-gray-900 dark:text-white">{new Date(selected.date).toLocaleDateString()}</span></div>
              <div>Venue: <span className="font-medium text-gray-900 dark:text-white">{selected.venue}</span></div>
              <div>Organizer: <span className="font-medium text-gray-900 dark:text-white">{selected.organizer}</span></div>
              <div>Registrations: <span className="font-medium text-gray-900 dark:text-white">{selected.registrations?.length || 0}</span></div>
            </div>
            {selected.registrationLink && (
              <a href={selected.registrationLink} target="_blank" rel="noreferrer" className="btn-primary inline-block text-xs">External Registration Link</a>
            )}
          </div>
        )}
      </Modal>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={editing ? 'Edit Event' : 'Create Event'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="input-field" placeholder="Title *" value={form.title} onChange={set('title')} required />
          <textarea className="input-field" placeholder="Description *" rows={3} value={form.description} onChange={set('description')} required />
          <div className="grid grid-cols-2 gap-3">
            <select className="input-field" value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="input-field" placeholder="Organizer *" value={form.organizer} onChange={set('organizer')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Start Date *</label><input type="datetime-local" className="input-field" value={form.date} onChange={set('date')} required /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">End Date</label><input type="datetime-local" className="input-field" value={form.endDate} onChange={set('endDate')} /></div>
          </div>
          <input className="input-field" placeholder="Venue *" value={form.venue} onChange={set('venue')} required />
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="Registration Link" value={form.registrationLink} onChange={set('registrationLink')} />
            <input type="number" className="input-field" placeholder="Max Participants (0=unlimited)" value={form.maxParticipants} onChange={set('maxParticipants')} />
          </div>
          <input className="input-field" placeholder="Tags (comma separated)" value={form.tags} onChange={set('tags')} />
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : editing ? 'Update Event' : 'Create Event'}</button>
        </form>
      </Modal>
    </div>
  );
}
