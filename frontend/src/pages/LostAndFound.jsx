import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, TrashIcon, PencilIcon, PhotoIcon } from '@heroicons/react/24/outline';

const CATEGORIES = ['Electronics', 'Books', 'ID Card', 'Keys', 'Wallet', 'Clothing', 'Other'];
const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const emptyForm = () => ({
  title: '', description: '', type: 'lost', category: 'Other',
  location: '', date: new Date().toISOString().split('T')[0],
  contactName: '', contactEmail: '', contactPhone: '', status: 'open',
});

export default function LostAndFound() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (typeFilter) params.set('type', typeFilter);
    if (statusFilter) params.set('status', statusFilter);
    api.get(`/lostandfound?${params}`)
      .then(({ data }) => setItems(data.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, [search, typeFilter, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item._id);
    setForm({ ...item, date: item.date?.split('T')[0] });
    setImageFile(null);
    setImagePreview(item.image ? `${BASE_URL}${item.image}` : '');
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Use FormData to support image upload
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (editing) {
        await api.put(`/lostandfound/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/lostandfound', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success(editing ? 'Updated!' : 'Posted!');
      setShowModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try { await api.delete(`/lostandfound/${id}`); toast.success('Deleted'); fetchItems(); }
    catch { toast.error('Failed to delete'); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lost & Found</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <PlusIcon className="w-4 h-4" /> Post Item
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search items..." /></div>
        <select className="input-field w-full sm:w-32" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <select className="input-field w-full sm:w-32" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item._id} className="card hover:shadow-md transition-shadow overflow-hidden p-0">
            {/* Item image */}
            {item.image ? (
              <img
                src={`${BASE_URL}${item.image}`}
                alt={item.title}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <PhotoIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className={`badge ${item.type === 'lost' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                  {item.type.toUpperCase()}
                </span>
                <span className={`badge ${item.status === 'open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {item.status}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.description}</p>
              <div className="mt-2 text-xs text-gray-400 space-y-0.5">
                <p>Location: {item.location}</p>
                <p>Date: {new Date(item.date).toLocaleDateString()}</p>
                <p>Contact: {item.contactName} &bull; {item.contactEmail}</p>
              </div>
              {((user?._id || user?.id)?.toString() === item.postedBy?._id?.toString() || user?.role === 'admin') && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(item)} className="btn-secondary text-xs flex items-center gap-1">
                    <PencilIcon className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="btn-danger text-xs flex items-center gap-1">
                    <TrashIcon className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {!items.length && <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center py-8">No items found.</p>}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Item' : 'Post Lost/Found Item'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select className="input-field" value={form.type} onChange={set('type')}>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
            <select className="input-field" value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input className="input-field" placeholder="Title *" value={form.title} onChange={set('title')} required />
          <textarea className="input-field" placeholder="Description *" rows={2} value={form.description} onChange={set('description')} required />
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="Location *" value={form.location} onChange={set('location')} required />
            <input type="date" className="input-field" value={form.date} onChange={set('date')} required />
          </div>
          <input className="input-field" placeholder="Your Name *" value={form.contactName} onChange={set('contactName')} required />
          <input type="email" className="input-field" placeholder="Contact Email *" value={form.contactEmail} onChange={set('contactEmail')} required />
          <input className="input-field" placeholder="Phone (optional)" value={form.contactPhone} onChange={set('contactPhone')} />

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(''); }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >x</button>
                </div>
              ) : (
                <label htmlFor="lf-image" className="flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <PhotoIcon className="w-8 h-8 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload image</span>
                  <span className="text-xs text-gray-400">JPG, PNG, WEBP — max 5MB</span>
                </label>
              )}
              <input id="lf-image" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          {editing && (
            <select className="input-field" value={form.status} onChange={set('status')}>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
          )}
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving...' : editing ? 'Update' : 'Post Item'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
