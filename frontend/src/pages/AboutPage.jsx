import React from 'react';
import { motion } from 'framer-motion';
import { Award, Shield, Users, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const milestones = [
  { year: '2008', event: 'Sri Lalitha Infra founded in Andhra Pradesh with a vision for transparent real estate.' },
  { year: '2011', event: 'Completed first residential plotted development of 120 plots across Andhra Pradesh.' },
  { year: '2015', event: 'Expanded operations after identifying high-growth potential in the region.' },
  { year: '2018', event: 'Registered all projects with RERA for complete legal transparency and buyer protection.' },
  { year: '2022', event: 'Crossed 500+ happy families milestone with over 1000 plots sold across 8 projects.' },
  { year: '2024', event: 'Launched Sri Lalitha Enclave — our most ambitious project to date with premium amenities.' },
];

export function AboutPage() {
  useAnalytics('about');
  return (
    <div className="min-h-screen bg-[#F8F6F0] pt-16 lg:pt-20">
      <div className="bg-[#172544] text-white py-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#D5B46B] text-sm font-semibold uppercase tracking-widest mb-2">Our Story</p>
          <h1 className="text-4xl font-bold mb-3">About Sri Lalitha Infra</h1>
          <p className="text-gray-400 max-w-xl mx-auto">15+ years of building trust, one plot at a time.</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20"
        >
          <div>
            <h2 className="text-3xl font-bold text-[#172544] mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              At Sri Lalitha Infra, we believe that owning land is more than a financial investment — it's a generational legacy. Our mission is to make this dream accessible, transparent, and hassle-free for every family in Andhra Pradesh.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Since 2008, we have delivered every project with complete legal clarity, ready infrastructure, and post-sale support that most developers overlook. Our tagline, "Tradition of Trust," isn't just a phrase — it's our operating principle.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="bg-[#B88A35]/10 text-[#8B6520] px-4 py-2 rounded-full text-sm font-medium">RERA Registered</span>
              <span className="bg-[#B88A35]/10 text-[#8B6520] px-4 py-2 rounded-full text-sm font-medium">Clear Titles</span>
              <span className="bg-[#B88A35]/10 text-[#8B6520] px-4 py-2 rounded-full text-sm font-medium">Transparent Pricing</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Award, title: '15+ Years', sub: 'In Real Estate' },
              { icon: Users, title: '500+', sub: 'Happy Families' },
              { icon: Shield, title: '8 Projects', sub: 'Successfully Delivered' },
              { icon: Heart, title: '1000+', sub: 'Plots Sold' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-[#B88A35]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon size={22} className="text-[#B88A35]" />
                </div>
                <p className="text-2xl font-bold text-[#172544]">{item.title}</p>
                <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-[#172544] mb-10 text-center">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-[#B88A35]/30 hidden sm:block" />
            <div className="space-y-6">
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-[#172544] rounded-full flex items-center justify-center relative z-10">
                    <span className="text-[#D5B46B] font-bold text-sm">{m.year}</span>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1 mt-3">
                    <p className="text-gray-700 text-sm leading-relaxed">{m.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-[#172544] mb-8 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'Ravi Kumar', location: 'Andhra Pradesh', text: 'Bought a plot in 2019. The process was completely transparent and the infrastructure was ready on possession day. Highly recommended.' },
              { name: 'Sunitha Reddy', location: 'Bangalore', text: 'I was skeptical about buying land remotely but the team guided us through every step. Clear documentation and no surprises.' },
              { name: 'Mohammed Farouk', location: 'Dubai', text: 'Invested in Sri Lalitha Enclave as an NRI. The team handled all paperwork and kept me updated throughout. True professionals.' },
            ].map((t, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} className="text-[#B88A35] fill-[#B88A35]" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-[#172544] text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mt-12 text-center">
          <Link to="/contact" className="bg-[#B88A35] hover:bg-[#D5B46B] text-white font-semibold px-8 py-3.5 rounded-xl transition">
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
