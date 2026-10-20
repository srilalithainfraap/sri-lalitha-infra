import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Calendar, User, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { formatCurrency, getStatusColor, formatDate } from '../utils/formatters';
import { Badge } from '../components/Badge';
import { useAnalytics } from '../hooks/useAnalytics';
import { getUserStats } from '../api/dashboard';

export function DashboardPage() {
  useAnalytics('dashboard');
  const { currentUser, logout } = useAuth();

  const [dashData, setDashData] = useState({ savedPlots: [], visits: [], enquiries: [], stats: null });

  useEffect(() => {
    getUserStats()
      .then((data) => setDashData(data))
      .catch(() => { /* keep empty defaults */ });
  }, []);

  const savedPlots = dashData.savedPlots ?? [];
  const visits     = dashData.visits     ?? [];
  const enquiries  = dashData.enquiries  ?? [];

  const [activeTab, setActiveTab] = useState('saved');

  const tabs = [
    { id: 'saved', label: 'Saved Plots', icon: Heart, count: savedPlots.length },
    { id: 'visits', label: 'Site Visits', icon: Calendar, count: visits.length },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F0] pt-16 lg:pt-20">
      <div className="bg-[#172544] text-white py-10 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#B88A35] flex items-center justify-center text-xl font-bold">
              {currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {currentUser?.name}!</h1>
              <p className="text-[#D5B46B] text-sm mt-0.5">Explore your next opportunity with Sri Lalitha Infra.</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Saved Plots', value: savedPlots.length, icon: Heart, color: 'text-red-500' },
            { label: 'Visits Scheduled', value: visits.length, icon: Calendar, color: 'text-green-500' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center"
            >
              <stat.icon size={24} className={`${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-[#172544]">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-white text-[#172544] shadow-sm' : 'text-gray-500 hover:text-[#172544]'}`}
            >
              <tab.icon size={15} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-[#B88A35] text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'saved' && (
          <div>
            {savedPlots.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Heart size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No saved plots yet.</p>
                <Link to="/explore-plots" className="text-[#B88A35] text-sm hover:underline mt-2 inline-block">Explore Plots →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedPlots.map((plot) => (
                  <Link key={plot._id ?? plot.id} to={`/plots/${plot.plotId ?? plot.id}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-[#B88A35]/30 transition">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-[#172544]">Plot {plot.number}</span>
                      <Badge variant={plot.status}>{getStatusColor(plot.status).label}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{plot.area} sq.yds · {plot.facing} Facing</p>
                    <p className="font-bold text-[#B88A35] mt-2">{formatCurrency(plot.price)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {visits.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No site visits scheduled yet.</p>
                <Link to="/contact" className="text-[#B88A35] text-sm hover:underline mt-2 inline-block">Schedule a Visit →</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Time</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visits.map((visit) => (
                    <tr key={visit._id ?? visit.id}>
                      <td className="px-5 py-3 font-medium">{formatDate(visit.preferredDate)}</td>
                      <td className="px-5 py-3 text-gray-500">{visit.preferredTime || '—'}</td>
                      <td className="px-5 py-3"><Badge variant={visit.status === 'pending' ? 'warning' : 'success'}>{visit.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
