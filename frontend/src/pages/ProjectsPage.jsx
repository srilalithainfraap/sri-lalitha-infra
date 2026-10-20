import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Check, ChevronRight } from 'lucide-react';
import { config } from '../data/config';
import { getItem, setItem, KEYS } from '../utils/storage';
import plotsData from '../data/plots';
import { useAnalytics } from '../hooks/useAnalytics';

export function ProjectsPage() {
  useAnalytics('projects');
  const plots = getItem(KEYS.PLOTS, plotsData);
  const available = plots.filter((p) => p.status === 'available').length;

  const highlights = [
    'DTCP approved layout with clear title',
    '30 ft main road & 20 ft cross roads',
    'Underground drainage system',
    'Overhead water tank with connection',
    'Street lighting throughout',
    'Gated community with security cabin',
    '100% vastu-compliant plot dimensions',
    'Close to NH-44 highway',
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F0] pt-16 lg:pt-20">
      <div className="bg-[#172544] text-white py-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#D5B46B] text-sm font-semibold uppercase tracking-widest mb-2">Our Projects</p>
          <h1 className="text-4xl font-bold mb-3">{config.project.name}</h1>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <MapPin size={16} />
            <span>{config.project.location}</span>
          </div>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-[#172544] mb-4">A Legacy Built on Trust</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Sri Lalitha Enclave is a meticulously planned residential plotted development spanning 10 acres in Andhra Pradesh. Strategically located with excellent road connectivity, this project offers unmatched access while maintaining a serene, green environment.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Every plot has been designed with vastu principles in mind, offering east, west, north and south facing options to suit your preferences. The project features ready infrastructure — no waiting, no delays.
            </p>
            <Link to="/explore-plots" className="inline-flex items-center gap-2 bg-[#B88A35] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#D5B46B] transition">
              Explore Plots ({available} Available) <ChevronRight size={18} />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Total Area', value: config.project.totalArea },
                { label: 'Total Plots', value: config.project.totalPlots },
                { label: 'Road Width', value: config.project.roadWidth },
                { label: 'Project Status', value: config.project.status },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-bold text-[#B88A35]">{item.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold text-[#172544] mb-6">Project Highlights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-[#B88A35]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={13} className="text-[#B88A35]" />
                </div>
                <p className="text-sm text-gray-700">{h}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-12 bg-[#172544] text-white rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">Ready to Own Your Plot?</h3>
          <p className="text-gray-400 mb-6">With {available} plots still available, don't miss this opportunity.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/explore-plots" className="bg-[#B88A35] hover:bg-[#D5B46B] text-white font-semibold px-6 py-3 rounded-xl transition">View Plot Map</Link>
            <Link to="/contact" className="border border-white/30 hover:border-[#B88A35] text-white px-6 py-3 rounded-xl font-semibold transition">Book Site Visit</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
