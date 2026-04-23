import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { StarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

export default function FoodOutlets() {
  const { user } = useAuth();
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [ratingVal, setRatingVal] = useState(0);

  const fetchOutlets = () => {
    api.get(`/food${search ? `?search=${search}` : ''}`).then(({ data }) => setOutlets(data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOutlets(); }, [search]);

  const handleRate = async (id) => {
    if (!ratingVal) return toast.error('Select a rating');
    try {
      await api.post(`/food/${id}/rate`, { rating: ratingVal });
      toast.success('Rating submitted!');
      fetchOutlets();
      setSelected(null);
    } catch { toast.error('Failed to rate'); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Food Outlets</h1>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search outlets..." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {outlets.map(outlet => (
          <div key={outlet._id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelected(outlet)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{outlet.name}</h3>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mt-1">
                  <MapPinIcon className="w-3.5 h-3.5" />
                  {outlet.location}
                </div>
              </div>
              <span className={`badge ${outlet.isOpen ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {outlet.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <ClockIcon className="w-3.5 h-3.5" />
              {outlet.timings}
            </div>
            <div className="flex items-center gap-1">
              <StarSolid className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{outlet.avgRating || 'No ratings'}</span>
              <span className="text-xs text-gray-400">({outlet.ratings?.length || 0})</span>
            </div>
            {outlet.menu?.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">{outlet.menu.length} items on menu</p>
            )}
          </div>
        ))}
        {!outlets.length && <p className="text-gray-500 dark:text-gray-400 col-span-3 text-center py-8">No outlets found.</p>}
      </div>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Location:</span> <span className="font-medium dark:text-white">{selected.location}</span></div>
              <div><span className="text-gray-500">Timings:</span> <span className="font-medium dark:text-white">{selected.timings}</span></div>
              <div><span className="text-gray-500">Rating:</span> <span className="font-medium dark:text-white">{selected.avgRating || 'N/A'} ⭐</span></div>
              <div><span className="text-gray-500">Status:</span> <span className={`font-medium ${selected.isOpen ? 'text-green-600' : 'text-red-600'}`}>{selected.isOpen ? 'Open' : 'Closed'}</span></div>
            </div>

            {selected.menu?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Menu</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {selected.menu.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full border-2 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`} />
                        <span className="text-gray-900 dark:text-white">{item.name}</span>
                        <span className="text-xs text-gray-400">{item.category}</span>
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Rate this outlet</h3>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(r => (
                  <button key={r} onClick={() => setRatingVal(r)}>
                    {r <= ratingVal ? <StarSolid className="w-6 h-6 text-yellow-400" /> : <StarIcon className="w-6 h-6 text-gray-300" />}
                  </button>
                ))}
              </div>
              <button onClick={() => handleRate(selected._id)} className="btn-primary text-sm">Submit Rating</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
