import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { StarIcon, ClockIcon, MapPinIcon, ShoppingCartIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

export default function FoodOutlets() {
  const { user } = useAuth();
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [ratingVal, setRatingVal] = useState(0);
  const [cart, setCart] = useState({});
  const [orderNote, setOrderNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);

  const fetchOutlets = () => {
    api.get(`/food${search ? `?search=${search}` : ''}`)
      .then(({ data }) => setOutlets(data.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  const fetchMyOrders = () => {
    api.get('/orders/my').then(({ data }) => setMyOrders(data.data)).catch(() => {});
  };

  useEffect(() => { fetchOutlets(); fetchMyOrders(); }, [search]);

  const handleRate = async (id) => {
    if (!ratingVal) return toast.error('Select a rating');
    try {
      await api.post(`/food/${id}/rate`, { rating: ratingVal });
      toast.success('Rating submitted!');
      fetchOutlets();
      setRatingVal(0);
    } catch { toast.error('Failed to rate'); }
  };

  const updateCart = (item, delta) => {
    setCart(prev => {
      const qty = (prev[item.name]?.quantity || 0) + delta;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[item.name];
        return next;
      }
      return { ...prev, [item.name]: { ...item, quantity: qty } };
    });
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!cartItems.length) return toast.error('Cart is empty');
    setPlacing(true);
    try {
      await api.post('/orders', {
        outletId: selected._id,
        items: cartItems.map(({ name, price, quantity }) => ({ name, price, quantity })),
        note: orderNote,
      });
      toast.success('Order placed!');
      setCart({});
      setOrderNote('');
      setSelected(null);
      fetchMyOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const handleCancelOrder = async (id) => {
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Order cancelled');
      fetchMyOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel');
    }
  };

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    ready: 'bg-green-100 text-green-700',
    delivered: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Food Outlets</h1>
        <button onClick={() => setShowOrders(true)} className="btn-secondary flex items-center gap-2 text-sm">
          <ShoppingCartIcon className="w-4 h-4" /> My Orders
          {myOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded px-1.5 py-0.5">
              {myOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}
            </span>
          )}
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search outlets..." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {outlets.map(outlet => (
          <div key={outlet._id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelected(outlet); setCart({}); setRatingVal(0); }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{outlet.name}</h3>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mt-1">
                  <MapPinIcon className="w-3.5 h-3.5" />{outlet.location}
                </div>
              </div>
              <span className={`badge ${outlet.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {outlet.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <ClockIcon className="w-3.5 h-3.5" />{outlet.timings}
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

      {/* Outlet detail + order modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Location:</span> <span className="font-medium dark:text-white">{selected.location}</span></div>
              <div><span className="text-gray-500">Timings:</span> <span className="font-medium dark:text-white">{selected.timings}</span></div>
              <div><span className="text-gray-500">Rating:</span> <span className="font-medium dark:text-white">{selected.avgRating || 'N/A'}</span></div>
              <div><span className="text-gray-500">Status:</span> <span className={`font-medium ${selected.isOpen ? 'text-green-600' : 'text-red-600'}`}>{selected.isOpen ? 'Open' : 'Closed'}</span></div>
            </div>

            {/* Menu with add to cart */}
            {selected.menu?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Menu</h3>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {selected.menu.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-sm border ${item.isVeg ? 'border-green-500' : 'border-red-500'}`} />
                        <span className="text-gray-900 dark:text-white">{item.name}</span>
                        <span className="text-xs text-gray-400">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300 w-14 text-right">₹{item.price}</span>
                        {selected.isOpen && (
                          <div className="flex items-center gap-1">
                            {cart[item.name] ? (
                              <>
                                <button onClick={() => updateCart(item, -1)} className="w-6 h-6 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <MinusIcon className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center text-sm font-medium text-gray-900 dark:text-white">{cart[item.name].quantity}</span>
                                <button onClick={() => updateCart(item, 1)} className="w-6 h-6 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <PlusIcon className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <button onClick={() => updateCart(item, 1)} className="w-6 h-6 flex items-center justify-center border border-blue-500 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                <PlusIcon className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cart summary */}
            {cartItems.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded p-3 space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">Your Order</h4>
                {cartItems.map(item => (
                  <div key={item.name} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{item.name} x{item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 text-sm">
                  <span>Total</span><span>₹{cartTotal}</span>
                </div>
                <input
                  className="input-field text-sm"
                  placeholder="Add a note (optional)"
                  value={orderNote}
                  onChange={e => setOrderNote(e.target.value)}
                />
                <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary w-full text-sm">
                  {placing ? 'Placing...' : `Place Order — ₹${cartTotal}`}
                </button>
              </div>
            )}

            {/* Rate */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Rate this outlet</h3>
              <div className="flex gap-1 mb-2">
                {[1,2,3,4,5].map(r => (
                  <button key={r} onClick={() => setRatingVal(r)}>
                    {r <= ratingVal ? <StarSolid className="w-5 h-5 text-yellow-400" /> : <StarIcon className="w-5 h-5 text-gray-300" />}
                  </button>
                ))}
              </div>
              <button onClick={() => handleRate(selected._id)} className="btn-secondary text-sm">Submit Rating</button>
            </div>
          </div>
        )}
      </Modal>

      {/* My Orders modal */}
      <Modal open={showOrders} onClose={() => setShowOrders(false)} title="My Orders" size="lg">
        <div className="space-y-3">
          {myOrders.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No orders yet.</p>}
          {myOrders.map(order => (
            <div key={order._id} className="border border-gray-200 dark:border-gray-700 rounded p-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 dark:text-white">{order.outlet?.name}</span>
                <span className={`badge ${statusColor[order.status]}`}>{order.status}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-400 space-y-0.5">
                {order.items.map((item, i) => (
                  <div key={i}>{item.name} x{item.quantity} — ₹{item.price * item.quantity}</div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold text-gray-900 dark:text-white">Total: ₹{order.total}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  {order.status === 'pending' && (
                    <button onClick={() => handleCancelOrder(order._id)} className="text-red-500 hover:text-red-700 text-xs">Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
