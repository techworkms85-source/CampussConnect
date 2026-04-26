import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  CalculatorIcon, ShoppingBagIcon, BookOpenIcon, MagnifyingGlassIcon,
  UserGroupIcon, ChatBubbleLeftIcon, CalendarIcon,
} from '@heroicons/react/24/outline';

const modules = [
  { to: '/cgpa', icon: CalculatorIcon, label: 'CGPA Calculator', desc: 'Track your academic performance', color: 'bg-blue-500' },
  { to: '/food', icon: ShoppingBagIcon, label: 'Food Outlets', desc: 'Campus dining options & menus', color: 'bg-orange-500' },
  { to: '/resources', icon: BookOpenIcon, label: 'Resources', desc: 'Study materials & notes', color: 'bg-green-500' },
  { to: '/lost-found', icon: MagnifyingGlassIcon, label: 'Lost & Found', desc: 'Report or find lost items', color: 'bg-yellow-500' },
  { to: '/clubs', icon: UserGroupIcon, label: 'Clubs', desc: 'Join campus clubs & societies', color: 'bg-purple-500' },
  { to: '/feedback', icon: ChatBubbleLeftIcon, label: 'Feedback', desc: 'Share your thoughts', color: 'bg-pink-500' },
  { to: '/events', icon: CalendarIcon, label: 'Events', desc: 'Upcoming campus events', color: 'bg-indigo-500' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    api.get('/events?upcoming=true').then(({ data }) => setUpcomingEvents(data.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}.</h1>
        <p className="text-blue-100 mt-1">
          {user?.branch && `${user.branch} • `}Semester {user?.semester} • Bennett University
        </p>
      </div>

      {/* Modules grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map(({ to, icon: Icon, label, desc, color }) => (
            <Link
              key={to}
              to={to}
              className="card hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className={`w-12 h-12 ${color} rounded flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
            <Link to="/events" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <div key={event._id} className="card">
                <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 mb-2">{event.category}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{event.venue}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
