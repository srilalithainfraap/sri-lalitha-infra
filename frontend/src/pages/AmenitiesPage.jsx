import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

const amenities = [
  { emoji: '🏊', name: 'Swimming Pool', desc: 'Olympic-size pool with children\'s section and lounging area for residents.' },
  { emoji: '🏋️', name: 'Gym & Fitness Centre', desc: 'Fully-equipped gymnasium with modern equipment and certified trainers.' },
  { emoji: '🌳', name: 'Landscaped Garden', desc: '2-acre central park with jogging tracks, flower beds, and shaded seating areas.' },
  { emoji: '🔒', name: '24/7 Security', desc: 'Round-the-clock security guards, CCTV surveillance at all entry and exit points.' },
  { emoji: '⛺', name: 'Community Clubhouse', desc: 'Multipurpose hall for events, celebrations, and community meetings.' },
  { emoji: '🌐', name: 'High-Speed WiFi Zone', desc: 'Community WiFi coverage across common areas for all residents.' },
  { emoji: '⚡', name: 'Underground Electricity', desc: 'Concealed underground cabling throughout for cleaner aesthetics and safety.' },
  { emoji: '💧', name: 'Water Supply', desc: 'Dedicated borewell with overhead water tank ensuring 24/7 supply.' },
  { emoji: '🚦', name: 'Wide Roads', desc: '30-ft main road and 20-ft cross roads ensuring smooth traffic flow.' },
  { emoji: '🌿', name: 'Tree-Lined Streets', desc: 'Native tree species planted along every road for shade and cooling effect.' },
  { emoji: '🏫', name: 'Schools Nearby', desc: 'Top CBSE and ICSE schools within 5 km of the project.' },
  { emoji: '🏥', name: 'Medical Facilities', desc: 'Multi-speciality hospitals within 10 km for peace of mind.' },
];

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export function AmenitiesPage() {
  useAnalytics('amenities');
  return (
    <div className="min-h-screen bg-[#F8F6F0] pt-16 lg:pt-20">
      <div className="bg-[#172544] text-white py-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#D5B46B] text-sm font-semibold uppercase tracking-widest mb-2">World-Class</p>
          <h1 className="text-4xl font-bold mb-3">Premium Amenities</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Every facility designed to complement your lifestyle.</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {amenities.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#B88A35]/40 transition-all"
            >
              <div className="text-4xl mb-4">{item.emoji}</div>
              <h3 className="font-bold text-[#172544] mb-2">{item.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-[#172544] text-white rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-3">Experience it in Person</h2>
          <p className="text-gray-400 mb-6">Come for a free site visit and see all amenities first-hand.</p>
          <Link to="/contact" className="bg-[#B88A35] hover:bg-[#D5B46B] text-white font-semibold px-8 py-3.5 rounded-xl transition">
            Schedule a Free Site Visit
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
