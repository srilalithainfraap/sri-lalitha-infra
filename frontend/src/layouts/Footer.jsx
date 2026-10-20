import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { config } from '../data/config';

export function Footer() {
  return (
    <footer className="bg-[#101B35] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/assets/sri-lalitha-logo.jpeg"
                alt="Sri Lalitha Infra"
                className="h-12 w-12 rounded-full object-cover border-2 border-[#B88A35]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <p className="font-bold text-white">{config.company.name}</p>
                <p className="text-[#D5B46B] text-xs tracking-wide">{config.company.tagline}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Building trust through quality plots and transparent dealings in Andhra Pradesh's growing real estate market.
            </p>
            <a
              href={`https://wa.me/${config.company.whatsapp}?text=${encodeURIComponent('Hello Sri Lalitha Infra! I am interested in your plots and would like more information.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <MessageCircle size={16} /> WhatsApp Us
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-[#D5B46B] mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/projects', label: 'Our Projects' },
                { to: '/explore-plots', label: 'Explore Plots' },
                { to: '/amenities', label: 'Amenities' },
                { to: '/gallery', label: 'Gallery' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-gray-400 hover:text-[#D5B46B] text-sm transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h3 className="font-semibold text-[#D5B46B] mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-2">
              {[
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact Us' },
                { to: '/login', label: 'Login' },
                { to: '/register', label: 'Register' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-gray-400 hover:text-[#D5B46B] text-sm transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-[#D5B46B] mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin size={15} className="mt-0.5 text-[#B88A35] flex-shrink-0" />
                <span>{config.company.address}</span>
              </li>
              <li>
                <a href={`tel:${config.company.phoneTel}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#D5B46B] transition">
                  <Phone size={15} className="text-[#B88A35]" />
                  {config.company.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${config.company.email}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#D5B46B] transition">
                  <Mail size={15} className="text-[#B88A35]" />
                  {config.company.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} {config.company.name}. All rights reserved.</p>
            <p className="text-center italic">{config.project.disclaimer}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
