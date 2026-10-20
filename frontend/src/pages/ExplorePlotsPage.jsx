import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Search, List, Map, X, MessageCircle, Calendar, Heart } from 'lucide-react';
import { getItem, setItem, KEYS } from '../utils/storage';
import plotsData from '../data/plots';
import { getPlots } from '../api/plots';
import { formatCurrency, getStatusColor } from '../utils/formatters';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuth } from '../features/auth/AuthContext';
import { config } from '../data/config';

const PLOT_W = 58;
const PLOT_H = 48;
const GAP = 6;
const ROAD_W = 28;
const COLS = 10;
const ROWS = 6;

function getPlotColor(status) {
  if (status === 'available') return '#B88A35';
  if (status === 'reserved') return '#3B82F6';
  return '#6B7280';
}

function PlotSVG({ plots, selectedId, hoveredId, onHover, onClick }) {
  const svgWidth = COLS * (PLOT_W + GAP) + ROAD_W * 2 + 20;
  const svgHeight = ROWS * (PLOT_H + GAP) + ROAD_W * 3 + 20;

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full" style={{ maxHeight: '100%' }}>
      {/* Background */}
      <rect width={svgWidth} height={svgHeight} fill="#1a2744" rx="8" />

      {/* Main Road (horizontal at bottom) */}
      <rect x={0} y={svgHeight - ROAD_W - 10} width={svgWidth} height={ROAD_W} fill="#374151" rx="2" />
      <text x={svgWidth / 2} y={svgHeight - ROAD_W / 2 - 6} fill="#9CA3AF" fontSize="9" textAnchor="middle" dominantBaseline="middle">
        MAIN ROAD — 30 FT
      </text>

      {/* Left boundary road */}
      <rect x={10} y={10} width={ROAD_W / 2} height={svgHeight - ROAD_W - 20} fill="#2D3748" rx="2" />

      {plots.map((plot) => {
        const col = (plot.col - 1) % COLS;
        const row = Math.floor((plot.number - 1) / COLS);
        const x = 10 + ROAD_W / 2 + col * (PLOT_W + GAP) + 4;
        const y = 10 + row * (PLOT_H + GAP + (row > 2 ? ROAD_W / 2 : 0)) + 4;
        const color = getPlotColor(plot.status);
        const isSelected = plot.id === selectedId;
        const isHovered = plot.id === hoveredId;

        return (
          <g key={plot.id}>
            <rect
              x={x}
              y={y}
              width={PLOT_W}
              height={PLOT_H}
              fill={color}
              fillOpacity={isSelected ? 1 : isHovered ? 0.9 : 0.75}
              stroke={isSelected ? '#FFFFFF' : isHovered ? '#D5B46B' : 'transparent'}
              strokeWidth={isSelected ? 2.5 : 1.5}
              rx="3"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => onHover(plot.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onClick(plot)}
            />
            <text
              x={x + PLOT_W / 2}
              y={y + PLOT_H / 2 - 5}
              fill="white"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none select-none"
            >
              {plot.number}
            </text>
            <text
              x={x + PLOT_W / 2}
              y={y + PLOT_H / 2 + 7}
              fill="rgba(255,255,255,0.8)"
              fontSize="7"
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none select-none"
            >
              {plot.area}sq
            </text>
          </g>
        );
      })}

      {/* Cross roads between rows */}
      {[2, 4].map((afterRow, i) => {
        const y = 10 + afterRow * (PLOT_H + GAP) + 4 + PLOT_H + 2;
        return (
          <g key={i}>
            <rect x={10 + ROAD_W / 2} y={y} width={COLS * (PLOT_W + GAP) - GAP + 4} height={ROAD_W / 2} fill="#2D3748" rx="2" />
            <text x={(COLS * (PLOT_W + GAP)) / 2 + 30} y={y + ROAD_W / 4} fill="#6B7280" fontSize="7" textAnchor="middle" dominantBaseline="middle">
              CROSS ROAD — 20 FT
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ExplorePlotsPage() {
  useAnalytics('explore-plots');
  const { session } = useAuth();

  const [allPlots, setAllPlots] = useState(() => {
    const stored = getItem(KEYS.PLOTS, null);
    return stored || plotsData;
  });

  const [filters, setFilters] = useState({ status: 'all', facing: 'all', minArea: '', maxArea: '', search: '' });
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [viewMode, setViewMode] = useState('map');
  const [zoom, setZoom] = useState(1);
  const [savedPlots, setSavedPlots] = useState(() => getItem(KEYS.SAVED_PLOTS, []));
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  // Load plots from backend; fall back to static data if unavailable
  useEffect(() => {
    getPlots()
      .then(({ plots }) => {
        if (plots?.length) {
          // Normalise _id → id for compatibility with existing SVG/filter code
          const normalised = plots.map((p) => ({ ...p, id: p.plotId ?? p._id }));
          setAllPlots(normalised);
          setItem(KEYS.PLOTS, normalised);
        }
      })
      .catch(() => { /* keep static fallback */ })
      .finally(() => setLoading(false));
  }, []);

  const filteredPlots = allPlots.filter((p) => {
    if (filters.status !== 'all' && p.status !== filters.status) return false;
    if (filters.facing !== 'all' && p.facing !== filters.facing) return false;
    if (filters.minArea && p.area < Number(filters.minArea)) return false;
    if (filters.maxArea && p.area > Number(filters.maxArea)) return false;
    if (filters.search && !String(p.number).includes(filters.search) && !p.id.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const toggleSave = useCallback((plotId) => {
    if (!session) return;
    setSavedPlots((prev) => {
      const next = prev.includes(plotId) ? prev.filter((id) => id !== plotId) : [...prev, plotId];
      setItem(KEYS.SAVED_PLOTS, next);
      return next;
    });
  }, [session]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleReset = () => { setZoom(1); setSelectedPlot(null); };

  const counts = {
    available: allPlots.filter((p) => p.status === 'available').length,
    reserved: allPlots.filter((p) => p.status === 'reserved').length,
    sold: allPlots.filter((p) => p.status === 'sold').length,
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] pt-16 lg:pt-20">
      {/* Header */}
      <div className="bg-[#172544] text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">Explore Plots</h1>
          <p className="text-gray-400">{config.project.name} — {config.project.location}</p>
          <p className="text-xs text-yellow-400 mt-2 italic">{config.project.disclaimer}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
            {/* Search */}
            <div className="relative flex-1 min-w-0 sm:min-w-[160px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search plot number..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#B88A35]"
              />
            </div>

            {/* Status + Facing selects row */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className="flex-1 min-w-[120px] border border-gray-200 rounded-lg px-3 py-2.5 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#B88A35]"
              >
                <option value="all">All Status</option>
                <option value="available">Available ({counts.available})</option>
                <option value="reserved">Reserved ({counts.reserved})</option>
                <option value="sold">Sold ({counts.sold})</option>
              </select>

              <select
                value={filters.facing}
                onChange={(e) => setFilters((f) => ({ ...f, facing: e.target.value }))}
                className="flex-1 min-w-[120px] border border-gray-200 rounded-lg px-3 py-2.5 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#B88A35]"
              >
                <option value="all">All Facing</option>
                {['East', 'West', 'North', 'South'].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Area range + view toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                placeholder="Min area"
                value={filters.minArea}
                onChange={(e) => setFilters((f) => ({ ...f, minArea: e.target.value }))}
                className="w-24 border border-gray-200 rounded-lg px-3 py-2.5 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#B88A35]"
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                type="number"
                placeholder="Max area"
                value={filters.maxArea}
                onChange={(e) => setFilters((f) => ({ ...f, maxArea: e.target.value }))}
                className="w-24 border border-gray-200 rounded-lg px-3 py-2.5 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#B88A35]"
              />

              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2.5 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center ${viewMode === 'map' ? 'bg-[#B88A35] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  title="Map view"
                  aria-label="Map view"
                >
                  <Map size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center ${viewMode === 'list' ? 'bg-[#B88A35] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  title="List view"
                  aria-label="List view"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          {[
            { color: '#B88A35', label: `Available (${counts.available})` },
            { color: '#3B82F6', label: `Reserved (${counts.reserved})` },
            { color: '#6B7280', label: `Sold (${counts.sold})` },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
          <span className="text-sm text-gray-400 ml-auto">
            Showing {filteredPlots.length} of {allPlots.length} plots
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map / List View */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="bg-white rounded-2xl h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-[#B88A35] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Loading master plan...</p>
                </div>
              </div>
            ) : viewMode === 'map' ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Zoom Controls */}
                <div className="flex items-center gap-2 p-3 border-b border-gray-100">
                  <button onClick={handleZoomIn} className="p-1.5 rounded-lg border border-gray-200 hover:border-[#B88A35] text-gray-600 hover:text-[#B88A35] transition">
                    <ZoomIn size={16} />
                  </button>
                  <button onClick={handleZoomOut} className="p-1.5 rounded-lg border border-gray-200 hover:border-[#B88A35] text-gray-600 hover:text-[#B88A35] transition">
                    <ZoomOut size={16} />
                  </button>
                  <button onClick={handleReset} className="p-1.5 rounded-lg border border-gray-200 hover:border-[#B88A35] text-gray-600 hover:text-[#B88A35] transition">
                    <RotateCcw size={16} />
                  </button>
                  <span className="text-xs text-gray-400 ml-1">{Math.round(zoom * 100)}%</span>
                  <span className="text-xs text-gray-400 ml-auto hidden sm:block">Click a plot to view details</span>
                  <span className="text-xs text-gray-400 ml-auto sm:hidden">Tap a plot to view details</span>
                </div>

                <div
                  ref={containerRef}
                  className="overflow-auto"
                  style={{ maxHeight: 'min(520px, 70vh)' }}
                >
                  <div
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.2s ease' }}
                  >
                    <PlotSVG
                      plots={filteredPlots}
                      selectedId={selectedPlot?.id}
                      hoveredId={hoveredId}
                      onHover={setHoveredId}
                      onClick={setSelectedPlot}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#172544] text-white">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium">Plot</th>
                        <th className="text-left px-4 py-3 text-xs font-medium">Area</th>
                        <th className="text-left px-4 py-3 text-xs font-medium">Dimensions</th>
                        <th className="text-left px-4 py-3 text-xs font-medium">Facing</th>
                        <th className="text-left px-4 py-3 text-xs font-medium">Road</th>
                        <th className="text-left px-4 py-3 text-xs font-medium">Price</th>
                        <th className="text-left px-4 py-3 text-xs font-medium">Status</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredPlots.map((plot) => (
                        <tr
                          key={plot.id}
                          onClick={() => setSelectedPlot(plot)}
                          className="hover:bg-[#B88A35]/5 cursor-pointer transition"
                        >
                          <td className="px-4 py-3 font-bold text-[#172544]">{plot.id}</td>
                          <td className="px-4 py-3">{plot.area} sq.yds</td>
                          <td className="px-4 py-3">{plot.dimensions}</td>
                          <td className="px-4 py-3">{plot.facing}</td>
                          <td className="px-4 py-3 text-xs">{plot.road}</td>
                          <td className="px-4 py-3 font-semibold text-[#B88A35]">{formatCurrency(plot.price)}</td>
                          <td className="px-4 py-3">
                            <Badge variant={plot.status}>{getStatusColor(plot.status).label}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Link to={`/plots/${plot.id}`} className="text-[#B88A35] text-xs hover:underline" onClick={(e) => e.stopPropagation()}>
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <AnimatePresence>
            {selectedPlot && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="w-full lg:w-80 lg:flex-shrink-0"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                  <div className="bg-[#172544] px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-lg">Plot {selectedPlot.number}</p>
                      <p className="text-[#D5B46B] text-xs">{selectedPlot.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedPlot.status}>{getStatusColor(selectedPlot.status).label}</Badge>
                      <button onClick={() => setSelectedPlot(null)} className="text-gray-400 hover:text-white transition">
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        { label: 'Area', value: `${selectedPlot.area} sq.yds` },
                        { label: 'Dimensions', value: selectedPlot.dimensions },
                        { label: 'Facing', value: selectedPlot.facing },
                        { label: 'Road', value: selectedPlot.road },
                      ].map((item) => (
                        <div key={item.label} className="bg-gray-50 rounded-lg p-2.5">
                          <p className="text-gray-400 text-xs">{item.label}</p>
                          <p className="font-semibold text-[#172544] text-sm">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#B88A35]/10 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Indicative Price</p>
                      <p className="text-xl font-bold text-[#B88A35]">{formatCurrency(selectedPlot.price)}</p>
                    </div>

                    {selectedPlot.features?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPlot.features.map((f) => (
                          <span key={f} className="text-xs bg-[#B88A35]/10 text-[#8B6520] px-2 py-0.5 rounded-full">{f}</span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2 pt-1">
                      <Link
                        to={`/plots/${selectedPlot.id}`}
                        className="block w-full bg-[#B88A35] hover:bg-[#D5B46B] text-white text-center py-2.5 rounded-lg text-sm font-semibold transition"
                      >
                        View Full Details
                      </Link>
                      <a
                        href={`https://wa.me/${config.company.whatsapp}?text=Hi, I'm interested in Plot ${selectedPlot.number} (${selectedPlot.id})`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full border border-green-500 text-green-600 hover:bg-green-50 py-2.5 rounded-lg text-sm font-medium transition"
                      >
                        <MessageCircle size={15} /> WhatsApp Enquiry
                      </a>
                      <Link
                        to="/contact"
                        className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium transition"
                      >
                        <Calendar size={15} /> Schedule Visit
                      </Link>
                      {session && (
                        <button
                          onClick={() => toggleSave(selectedPlot.id)}
                          className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-medium text-gray-600 transition"
                        >
                          <Heart size={15} className={savedPlots.includes(selectedPlot.id) ? 'fill-red-500 text-red-500' : ''} />
                          {savedPlots.includes(selectedPlot.id) ? 'Saved' : 'Save Plot'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
