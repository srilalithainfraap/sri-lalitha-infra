import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart2, Map, MessageSquare, Calendar, Check, Trash2, LogOut, ExternalLink, Shield, Camera, Upload, X, AlertCircle } from 'lucide-react';
import { useGallery, compressImage } from '../hooks/useGallery';
import { formatCurrency, getStatusColor, formatDate } from '../utils/formatters';
import { Badge } from '../components/Badge';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuth } from '../features/auth/AuthContext';
import { getPlots, updatePlotStatus as apiUpdatePlotStatus } from '../api/plots';
import { getEnquiries, updateEnquiryStatus, deleteEnquiry as apiDeleteEnquiry } from '../api/enquiries';
import { getVisits, updateVisitStatus as apiUpdateVisitStatus } from '../api/visits';
import { uploadGalleryItem, deleteGalleryItem as apiDeleteGalleryItem } from '../api/gallery';
import { getAdminStats } from '../api/dashboard';

function AvailabilityBarChart({ plots }) {
  const counts = {
    available: plots.filter((p) => p.status === 'available').length,
    reserved: plots.filter((p) => p.status === 'reserved').length,
    sold: plots.filter((p) => p.status === 'sold').length,
  };
  const max = Math.max(...Object.values(counts));
  const bars = [
    { label: 'Available', value: counts.available, color: '#B88A35' },
    { label: 'Reserved', value: counts.reserved, color: '#3B82F6' },
    { label: 'Sold', value: counts.sold, color: '#6B7280' },
  ];
  const chartH = 120;
  const barW = 60;
  const gap = 30;
  const svgW = bars.length * (barW + gap) + gap;

  return (
    <svg viewBox={`0 0 ${svgW} ${chartH + 30}`} className="w-full max-w-xs">
      {bars.map((bar, i) => {
        const h = max > 0 ? (bar.value / max) * chartH : 0;
        const x = gap + i * (barW + gap);
        const y = chartH - h;
        return (
          <g key={bar.label}>
            <rect x={x} y={y} width={barW} height={h} fill={bar.color} rx="4" fillOpacity={0.85} />
            <text x={x + barW / 2} y={y - 4} fill="#374151" fontSize="11" fontWeight="bold" textAnchor="middle">{bar.value}</text>
            <text x={x + barW / 2} y={chartH + 14} fill="#6B7280" fontSize="9" textAnchor="middle">{bar.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function AdminPage() {
  useAnalytics('admin');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const [plots, setPlots]         = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [visits, setVisits]       = useState([]);
  const [adminStats, setAdminStats] = useState(null);

  // Load all admin data from backend
  useEffect(() => {
    getPlots().then(({ plots: p }) => setPlots(p ?? [])).catch(() => {});
    getEnquiries().then(({ enquiries: e }) => setEnquiries(e ?? [])).catch(() => {});
    getVisits().then(({ visits: v }) => setVisits(v ?? [])).catch(() => {});
    getAdminStats().then((d) => setAdminStats(d.stats ?? null)).catch(() => {});
  }, []);

  const stats = adminStats ?? {
    total: plots.length,
    available: plots.filter((p) => p.status === 'available').length,
    reserved:  plots.filter((p) => p.status === 'reserved').length,
    sold:      plots.filter((p) => p.status === 'sold').length,
    enquiries: enquiries.length,
    visits:    visits.length,
  };

  const updatePlotStatus = async (id, newStatus) => {
    try {
      const { plot } = await apiUpdatePlotStatus(id, newStatus);
      setPlots((prev) => prev.map((p) => (p._id === id || p.plotId === id) ? { ...p, status: plot.status } : p));
    } catch { /* ignore */ }
  };

  const markEnquiryRead = async (id) => {
    try {
      const { enquiry } = await updateEnquiryStatus(id, 'read');
      setEnquiries((prev) => prev.map((e) => e._id === id ? { ...e, status: enquiry.status } : e));
    } catch { /* ignore */ }
  };

  const deleteEnquiry = async (id) => {
    try {
      await apiDeleteEnquiry(id);
      setEnquiries((prev) => prev.filter((e) => e._id !== id));
    } catch { /* ignore */ }
  };

  const updateVisitStatus = async (id, status) => {
    try {
      const { visit } = await apiUpdateVisitStatus(id, status);
      setVisits((prev) => prev.map((v) => v._id === id ? { ...v, status: visit.status } : v));
    } catch { /* ignore */ }
  };

  // ── Gallery management ─────────────────────────────────────────────────
  const { items: galleryItems, addItem: addGalleryItem, removeItem: removeGalleryItem } = useGallery();
  const [pendingFile, setPendingFile]     = useState(null);   // File object
  const [previewUrl, setPreviewUrl]       = useState(null);   // dataURL for preview
  const [galleryTitle, setGalleryTitle]   = useState('');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('');
  const [uploadError, setUploadError]     = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploading, setUploading]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);   // id pending delete

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_BYTES = 2 * 1024 * 1024; // 2 MB input limit

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploadSuccess('');
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Unsupported file type. Please upload a JPG, PNG, or WebP image.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 2 MB.`);
      e.target.value = '';
      return;
    }
    setPendingFile(file);
    setGalleryTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('image', pendingFile);
      formData.append('title', galleryTitle.trim() || 'Untitled');
      formData.append('caption', galleryCaption.trim());
      formData.append('category', galleryCategory.trim() || 'Photos');
      await uploadGalleryItem(formData);
      setUploadSuccess('Image uploaded successfully and is now visible on the gallery.');
      setPendingFile(null);
      setPreviewUrl(null);
      setGalleryTitle('');
      setGalleryCaption('');
      setGalleryCategory('');
    } catch (err) {
      setUploadError(err.message || 'Failed to upload the image. Please try a different file.');
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setPendingFile(null);
    setPreviewUrl(null);
    setGalleryTitle('');
    setGalleryCaption('');
    setGalleryCategory('');
    setUploadError('');
    setUploadSuccess('');
  };

  const confirmDelete = (id) => setDeleteConfirm(id);

  const executeDelete = async () => {
    if (deleteConfirm) {
      try {
        await apiDeleteGalleryItem(deleteConfirm);
        removeGalleryItem(deleteConfirm); // remove from local hook state too
      } catch { /* ignore */ }
      setDeleteConfirm(null);
    }
  };
  // ──────────────────────────────────────────────────────────────────────

  const tabs = [
    { id: 'overview',  label: 'Overview',  icon: BarChart2 },
    { id: 'plots',     label: 'Plots',     icon: Map },
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquare },
    { id: 'visits',    label: 'Visits',    icon: Calendar },
    { id: 'gallery',   label: 'Gallery',   icon: Camera },
  ];

  const activeTabLabel = tabs.find((t) => t.id === activeTab)?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col">

      {/* ── Admin Header — full viewport width ───────────────────────────── */}
      <header className="bg-[#101B35] border-b border-[#B88A35]/30 sticky top-0 z-50 flex-shrink-0">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#B88A35]/20 border border-[#B88A35]/50 flex items-center justify-center flex-shrink-0">
              <Shield size={14} className="text-[#B88A35]" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-none">Sri Lalitha Infra</p>
              <p className="text-[#B88A35] text-[10px] tracking-wider uppercase leading-none mt-0.5">Admin Panel</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentUser && (
              <span className="hidden sm:block text-gray-400 text-xs">{currentUser.name}</span>
            )}
            <Link
              to="/"
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
            >
              <ExternalLink size={13} /> Public Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 text-xs px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
            >
              <LogOut size={13} /> Log Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Body: sidebar + main ──────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar — desktop only */}
        <aside className="hidden md:flex flex-col w-52 bg-[#101B35] border-r border-[#B88A35]/20 flex-shrink-0">
          <div className="px-4 py-5 border-b border-[#B88A35]/20">
            <p className="text-white font-semibold text-sm">Dashboard</p>
            <p className="text-gray-500 text-xs mt-0.5">Internal Management</p>
          </div>
          <nav className="flex-1 py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition ${
                  activeTab === tab.id
                    ? 'bg-[#B88A35]/15 text-[#D5B46B] border-r-2 border-[#B88A35]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={15} /> {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content area — fills all remaining width */}
        <main className="flex-1 flex flex-col overflow-auto min-w-0">

          {/* Mobile tab bar */}
          <div className="md:hidden flex gap-1 bg-white border-b border-gray-200 px-3 py-2 overflow-x-auto flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  activeTab === tab.id ? 'bg-[#172544] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={13} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Section heading */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <h1 className="text-lg font-bold text-[#172544]">{activeTabLabel}</h1>
            <p className="text-gray-400 text-xs mt-0.5">Sri Lalitha Enclave — Admin Panel</p>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 p-6 overflow-auto">

        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {[
                { label: 'Total Plots', value: stats.total, color: 'text-[#172544]' },
                { label: 'Available', value: stats.available, color: 'text-[#B88A35]' },
                { label: 'Reserved', value: stats.reserved, color: 'text-blue-500' },
                { label: 'Sold', value: stats.sold, color: 'text-gray-500' },
                { label: 'Enquiries', value: stats.enquiries, color: 'text-purple-500' },
                { label: 'Visits', value: stats.visits, color: 'text-green-500' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100"
                >
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-[#172544] mb-4">Plot Status Distribution</h3>
                <AvailabilityBarChart plots={plots} />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-[#172544] mb-4">Recent Enquiries</h3>
                {enquiries.slice(-5).reverse().map((e) => (
                  <div key={e._id ?? e.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#172544]">{e.name}</p>
                      <p className="text-xs text-gray-400">Plot {e.plotNumber} · {formatDate(e.createdAt)}</p>
                    </div>
                    <Badge variant={e.status === 'new' ? 'info' : 'success'}>{e.status}</Badge>
                  </div>
                ))}
                {enquiries.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No enquiries yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Plots Table */}
        {activeTab === 'plots' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#172544] text-white">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium">Plot</th>
                    <th className="text-left px-4 py-3 text-xs font-medium">Area</th>
                    <th className="text-left px-4 py-3 text-xs font-medium">Facing</th>
                    <th className="text-left px-4 py-3 text-xs font-medium">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium">Change Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {plots.map((plot) => (
                    <tr key={plot._id ?? plot.plotId} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-bold text-[#172544]">{plot.plotId ?? plot.id}</td>
                      <td className="px-4 py-3">{plot.area} sq.yds</td>
                      <td className="px-4 py-3">{plot.facing}</td>
                      <td className="px-4 py-3 text-[#B88A35] font-medium">{formatCurrency(plot.price)}</td>
                      <td className="px-4 py-3"><Badge variant={plot.status}>{getStatusColor(plot.status).label}</Badge></td>
                      <td className="px-4 py-3">
                        <select
                          value={plot.status}
                          onChange={(e) => updatePlotStatus(plot._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#B88A35]"
                        >
                          <option value="available">Available</option>
                          <option value="reserved">Reserved</option>
                          <option value="sold">Sold</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {enquiries.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No enquiries received yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#172544] text-white">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium">Plot</th>
                      <th className="text-left px-4 py-3 text-xs font-medium">Mobile</th>
                      <th className="text-left px-4 py-3 text-xs font-medium">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {enquiries.map((enq) => (
                      <tr key={enq._id ?? enq.id} className={`hover:bg-gray-50 transition ${enq.status === 'new' ? 'bg-blue-50/30' : ''}`}>
                        <td className="px-4 py-3 font-medium">{enq.name}</td>
                        <td className="px-4 py-3">Plot {enq.plotNumber}</td>
                        <td className="px-4 py-3">{enq.mobile}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(enq.createdAt)}</td>
                        <td className="px-4 py-3"><Badge variant={enq.status === 'new' ? 'info' : 'success'}>{enq.status}</Badge></td>
                        <td className="px-4 py-3 flex gap-2">
                          {enq.status === 'new' && (
                            <button onClick={() => markEnquiryRead(enq._id)} title="Mark read" className="text-green-500 hover:text-green-700 transition">
                              <Check size={16} />
                            </button>
                          )}
                          <button onClick={() => deleteEnquiry(enq._id)} title="Delete" className="text-red-400 hover:text-red-600 transition">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Visits */}
        {activeTab === 'visits' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {visits.length === 0 ? (
              <div className="p-12 text-center text-gray-400">No site visits scheduled yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#172544] text-white">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium">Mobile</th>
                      <th className="text-left px-4 py-3 text-xs font-medium">Preferred Date</th>
                      <th className="text-left px-4 py-3 text-xs font-medium">Time</th>
                      <th className="text-left px-4 py-3 text-xs font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {visits.map((visit) => (
                      <tr key={visit._id ?? visit.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium">{visit.name}</td>
                        <td className="px-4 py-3">{visit.mobile}</td>
                        <td className="px-4 py-3">{formatDate(visit.preferredDate)}</td>
                        <td className="px-4 py-3">{visit.preferredTime || '—'}</td>
                        <td className="px-4 py-3"><Badge variant={visit.status === 'pending' ? 'warning' : visit.status === 'confirmed' ? 'success' : 'default'}>{visit.status}</Badge></td>
                        <td className="px-4 py-3">
                          <select
                            value={visit.status}
                            onChange={(e) => updateVisitStatus(visit._id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#B88A35]"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Gallery Management ────────────────────────────────────────── */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">

            {/* Upload form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-[#172544] mb-1">Upload New Image</h2>
              <p className="text-gray-400 text-xs mb-4">
                Accepted: JPG, PNG, WebP · Max 2 MB · Images are compressed to 800 px before saving.
              </p>

              {/* File picker */}
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-[#B88A35]/60 transition group">
                <Upload size={28} className="text-gray-300 group-hover:text-[#B88A35] transition" />
                <p className="text-sm text-gray-500 font-medium">Click to choose an image</p>
                <p className="text-xs text-gray-400">JPG · PNG · WebP · max 2 MB</p>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>

              {/* Error / success banners */}
              {uploadError && (
                <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{uploadError}</p>
                </div>
              )}
              {uploadSuccess && !pendingFile && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <p className="text-green-700 text-sm">{uploadSuccess}</p>
                </div>
              )}

              {/* Preview + metadata fields */}
              {pendingFile && previewUrl && (
                <div className="mt-4 flex flex-col sm:flex-row gap-5 items-start">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full sm:w-40 h-28 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                      <input
                        value={galleryTitle}
                        onChange={(e) => setGalleryTitle(e.target.value)}
                        placeholder="e.g. Main Entrance Gate"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#B88A35]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Category <span className="text-gray-400">(optional)</span></label>
                        <input
                          value={galleryCategory}
                          onChange={(e) => setGalleryCategory(e.target.value)}
                          placeholder="e.g. Infrastructure"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#B88A35]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Caption <span className="text-gray-400">(optional)</span></label>
                        <input
                          value={galleryCaption}
                          onChange={(e) => setGalleryCaption(e.target.value)}
                          placeholder="Short description"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#B88A35]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pendingFile && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-[#B88A35] hover:bg-[#D5B46B] disabled:opacity-60 text-white font-semibold px-6 py-2 rounded-xl transition text-sm"
                  >
                    {uploading ? 'Uploading…' : 'Upload Image'}
                  </button>
                  <button
                    onClick={cancelUpload}
                    className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Uploaded images grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#172544]">
                  Uploaded Images
                  <span className="ml-2 text-sm font-normal text-gray-400">({galleryItems.length})</span>
                </h2>
                {galleryItems.length > 0 && (
                  <p className="text-xs text-gray-400 hidden sm:block">Hover an image to delete it</p>
                )}
              </div>

              {galleryItems.length === 0 ? (
                <div className="py-12 text-center">
                  <Camera size={36} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">No images uploaded yet.</p>
                  <p className="text-gray-300 text-xs mt-1">Uploaded images appear on the Gallery page and homepage preview.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {galleryItems.map((item) => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                      <img
                        src={item.dataUrl}
                        alt={item.title}
                        className="w-full h-28 object-cover"
                        loading="lazy"
                      />
                      <div className="px-2 py-1.5 bg-white">
                        <p className="text-xs font-medium text-[#172544] truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-400 truncate">{item.category}</p>
                      </div>
                      {/* Delete button — always visible on touch, hover-only on pointer devices */}
                      <button
                        onClick={() => confirmDelete(item.id)}
                        title="Delete image"
                        aria-label={`Delete ${item.title}`}
                        className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition shadow opacity-100 sm:opacity-0 sm:group-hover:opacity-100 min-w-[32px] min-h-[32px] flex items-center justify-center"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Persistent storage notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 text-sm font-medium">Storage notice</p>
                  <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                    Images are stored in this browser's local storage. They are visible on this device
                    but will not appear after a fresh deployment or on another device. For production
                    cross-device persistence, connect Firebase Storage.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Delete confirmation modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
              <h3 className="font-bold text-[#172544] mb-2">Delete Image?</h3>
              <p className="text-gray-500 text-sm mb-5">
                This image will be removed from the gallery and homepage preview. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={executeDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-xl transition text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 border border-gray-200 text-gray-600 hover:border-gray-300 font-medium py-2 rounded-xl transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

          </div>{/* /scrollable content */}
        </main>
      </div>{/* /body */}
    </div>
  );
}
