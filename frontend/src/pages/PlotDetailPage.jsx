import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Maximize2, Compass, Road, MessageCircle, Calendar, Heart, CheckCircle } from 'lucide-react';
import { getItem, KEYS } from '../utils/storage';
import plotsData from '../data/plots';
import { createEnquiry } from '../api/enquiries';
import { formatCurrency, getStatusColor } from '../utils/formatters';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Input, Textarea } from '../components/Input';
import { validateEnquiry, sanitizePhone } from '../utils/validation';
import { useAuth } from '../features/auth/AuthContext';
import { config } from '../data/config';
import { useAnalytics } from '../hooks/useAnalytics';

export function PlotDetailPage() {
  useAnalytics('plot-detail');
  const { plotId } = useParams();
  const navigate = useNavigate();
  const { session, currentUser, toggleSavedPlot } = useAuth();

  const plots = getItem(KEYS.PLOTS, plotsData);
  const plot = plots.find((p) => p.id === plotId);

  const [enquiryForm, setEnquiryForm] = useState({ name: currentUser?.name || '', mobile: currentUser?.mobile || '', email: currentUser?.email || '', message: `Hi, I'm interested in Plot ${plot?.number} (${plotId}). Please share more details.` });
  const [enquiryErrors, setEnquiryErrors] = useState({});
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);

  if (!plot) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold text-[#172544] mb-4">Plot not found</p>
        <Link to="/explore-plots" className="text-[#B88A35] hover:underline">← Back to Explore Plots</Link>
      </div>
    );
  }

  const isSaved = currentUser?.savedPlots?.includes(plotId) ?? false;
  const similar = plots.filter((p) => p.status === 'available' && p.id !== plotId).slice(0, 3);

  const toggleSave = async () => {
    if (!session) { navigate('/login'); return; }
    await toggleSavedPlot(plotId);
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    const errs = validateEnquiry(enquiryForm);
    if (Object.keys(errs).length > 0) { setEnquiryErrors(errs); return; }
    try {
      await createEnquiry({ plotId, plotNumber: plot.number, ...enquiryForm });
      setEnquirySubmitted(true);
    } catch (err) {
      setEnquiryErrors({ submit: err.message || 'Failed to submit enquiry. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] pt-16 lg:pt-20">
      {/* Header */}
      <div className="bg-[#172544] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/explore-plots" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#D5B46B] text-sm mb-4 transition">
            <ArrowLeft size={16} /> Back to Explore Plots
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold">Plot {plot.number}</h1>
                <Badge variant={plot.status}>{getStatusColor(plot.status).label}</Badge>
              </div>
              <p className="text-gray-400">{plot.id} — {config.project.name}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#D5B46B]">{formatCurrency(plot.price)}</p>
              <p className="text-gray-400 text-sm">Indicative price</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-bold text-[#172544] mb-5">Plot Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: Maximize2, label: 'Area', value: `${plot.area} sq. yards` },
                  { icon: Maximize2, label: 'Dimensions', value: plot.dimensions },
                  { icon: Compass, label: 'Facing', value: plot.facing },
                  { icon: MapPin, label: 'Location', value: config.project.location },
                  { icon: MapPin, label: 'Road', value: plot.road },
                  { icon: CheckCircle, label: 'Status', value: getStatusColor(plot.status).label },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <item.icon size={15} className="text-[#B88A35]" />
                      <p className="text-xs text-gray-400">{item.label}</p>
                    </div>
                    <p className="font-semibold text-[#172544] text-sm">{item.value}</p>
                  </div>
                ))}
              </div>

              {plot.features?.length > 0 && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-sm font-semibold text-[#172544] mb-2">Special Features</p>
                  <div className="flex flex-wrap gap-2">
                    {plot.features.map((f) => (
                      <span key={f} className="text-sm bg-[#B88A35]/10 text-[#8B6520] px-3 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Mini SVG Locator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-bold text-[#172544] mb-4">Location in Layout</h2>
              <svg viewBox="0 0 620 320" className="w-full rounded-xl" style={{ background: '#1a2744' }}>
                {Array.from({ length: 60 }, (_, i) => {
                  const p = plots[i];
                  if (!p) return null;
                  const col = (i % 10);
                  const row = Math.floor(i / 10);
                  const x = 10 + col * 60;
                  const y = 10 + row * 52;
                  const isThis = p.id === plotId;
                  return (
                    <rect
                      key={p.id}
                      x={x} y={y} width={55} height={46}
                      fill={isThis ? '#FFFFFF' : getStatusColor(p.status).bg}
                      fillOpacity={isThis ? 1 : 0.5}
                      stroke={isThis ? '#B88A35' : 'none'}
                      strokeWidth={isThis ? 2 : 0}
                      rx="2"
                    />
                  );
                })}
                <text x="310" y="305" fill="#9CA3AF" fontSize="10" textAnchor="middle">MAIN ROAD</text>
              </svg>
              <p className="text-xs text-gray-400 mt-2 text-center">White highlighted plot = Plot {plot.number}</p>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {/* Save / WhatsApp */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${config.company.whatsapp}?text=Hi, I'm interested in Plot ${plot.number} (${plotId})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-semibold transition"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
                <button
                  onClick={toggleSave}
                  className={`p-3 rounded-xl border-2 transition ${isSaved ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-[#B88A35]'}`}
                >
                  <Heart size={20} className={isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                </button>
              </div>
            </motion.div>

            {/* Enquiry Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <h3 className="font-bold text-[#172544] mb-4">Send Enquiry</h3>
              {enquirySubmitted ? (
                <div className="text-center py-6">
                  <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                  <p className="font-semibold text-[#172544]">Enquiry Sent!</p>
                  <p className="text-sm text-gray-500 mt-1">We'll contact you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-3">
                  <Input
                    label="Name"
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm((f) => ({ ...f, name: e.target.value }))}
                    error={enquiryErrors.name}
                    placeholder="Your full name"
                  />
                  <Input
                    label="Mobile"
                    type="tel" inputMode="numeric" maxLength={10}
                    value={enquiryForm.mobile}
                    onChange={(e) => setEnquiryForm((f) => ({ ...f, mobile: sanitizePhone(e.target.value) }))}
                    error={enquiryErrors.mobile}
                    placeholder="10-digit mobile"
                  />
                  <Input
                    label="Email (optional)"
                    type="email"
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm((f) => ({ ...f, email: e.target.value }))}
                    error={enquiryErrors.email}
                    placeholder="email@example.com"
                  />
                  <Textarea
                    label="Message"
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm((f) => ({ ...f, message: e.target.value }))}
                    error={enquiryErrors.message}
                    rows={3}
                  />
                  {enquiryErrors.submit && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{enquiryErrors.submit}</p>
                  )}
                  <Button type="submit" className="w-full">Submit Enquiry</Button>
                </form>
              )}
            </motion.div>

            {/* Schedule Visit */}
            <Link
              to="/contact"
              className="flex items-center justify-center gap-2 w-full bg-[#172544] hover:bg-[#101B35] text-white py-3.5 rounded-xl font-semibold transition"
            >
              <Calendar size={18} /> Schedule a Site Visit
            </Link>
          </div>
        </div>

        {/* Similar Plots */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-[#172544] mb-6">Similar Available Plots</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {similar.map((p) => (
                <Link key={p.id} to={`/plots/${p.id}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-[#B88A35]/30 transition group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-[#172544]">Plot {p.number}</span>
                    <Badge variant="available">Available</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{p.area} sq.yds · {p.facing} Facing</p>
                  <p className="font-bold text-[#B88A35] mt-2">{formatCurrency(p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
