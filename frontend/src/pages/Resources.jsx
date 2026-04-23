import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { ArrowDownTrayIcon, TrashIcon, PlusIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const BRANCHES = ['All', 'CSE', 'ECE', 'ME', 'CE', 'EEE', 'IT', 'CSE-AI', 'CSE-DS'];

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ semester: '', branch: '' });
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: '', semester: 1, branch: 'All', tags: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchResources = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filters.semester) params.set('semester', filters.semester);
    if (filters.branch && filters.branch !== 'All') params.set('branch', filters.branch);
    api.get(`/resources?${params}`).then(({ data }) => setResources(data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchResources(); }, [search, filters]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Select a file');
    setUploading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('file', file);
    try {
      await api.post('/resources', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resource uploaded!');
      setShowUpload(false);
      setForm({ title: '', description: '', subject: '', semester: 1, branch: 'All', tags: '' });
      setFile(null);
      fetchResources();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/resources/${id}`);
      toast.success('Deleted');
      fetchResources();
    } catch { toast.error('Failed to delete'); }
  };

  const handleDownload = async (resource) => {
    await api.get(`/resources/${resource._id}/download`);
    window.open(`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${resource.fileUrl}`, '_blank');
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resources</h1>
        <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2 text-sm">
          <PlusIcon className="w-4 h-4" /> Upload
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search resources..." /></div>
        <select className="input-field w-full sm:w-36" value={filters.semester} onChange={e => setFilters({ ...filters, semester: e.target.value })}>
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
        </select>
        <select className="input-field w-full sm:w-36" value={filters.branch} onChange={e => setFilters({ ...filters, branch: e.target.value })}>
          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map(r => (
          <div key={r._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <DocumentIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{r.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{r.subject} • Sem {r.semester} • {r.branch}</p>
                <p className="text-xs text-gray-400 mt-1">by {r.uploadedBy?.name} • {r.downloads} downloads</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleDownload(r)} className="btn-primary text-xs flex items-center gap-1 flex-1 justify-center">
                <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Download
              </button>
              {(user?._id === r.uploadedBy?._id || user?.role === 'admin') && (
                <button onClick={() => handleDelete(r._id)} className="btn-danger text-xs p-2">
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
        {!resources.length && <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center py-8">No resources found.</p>}
      </div>

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Resource">
        <form onSubmit={handleUpload} className="space-y-3">
          <input className="input-field" placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <input className="input-field" placeholder="Subject *" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
          <textarea className="input-field" placeholder="Description" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <select className="input-field" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
            <select className="input-field" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })}>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <input className="input-field" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <input type="file" id="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt" onChange={e => setFile(e.target.files[0])} />
            <label htmlFor="file" className="cursor-pointer text-sm text-blue-600 hover:underline">
              {file ? file.name : 'Click to select file (PDF, DOC, PPT, ZIP — max 10MB)'}
            </label>
          </div>
          <button type="submit" disabled={uploading} className="btn-primary w-full">
            {uploading ? 'Uploading...' : 'Upload Resource'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
