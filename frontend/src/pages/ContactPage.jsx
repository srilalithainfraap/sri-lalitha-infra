import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, CheckCircle, AlertCircle, Navigation } from 'lucide-react';
import { Input, Textarea, Select } from '../components/Input';
import { Button } from '../components/Button';
import { config } from '../data/config';
import { validatePhone, validateRequired, sanitizePhone } from '../utils/validation';
import { createVisit } from '../api/visits';
import { useAuth } from '../features/auth/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';

export function ContactPage() {
  useAnalytics('contact');
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    mobile: currentUser?.mobile || '',
    email: currentUser?.email || '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field) => (e) => {
    const value = field === 'mobile' ? sanitizePhone(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!validateRequired(form.name)) errs.name = 'Name is required';
    if (!validateRequired(form.mobile)) errs.mobile = 'Mobile is required';
    else if (!validatePhone(form.mobile)) errs.mobile = 'Enter a valid 10-digit number';
    if (!validateRequired(form.preferredDate)) errs.preferredDate = 'Please select a preferred date';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      await createVisit({ ...form });
      setSubmitted(true);
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to submit. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] pt-16 lg:pt-20">
      <div className="bg-[#172544] text-white py-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#D5B46B] text-sm font-semibold uppercase tracking-widest mb-2">We'd love to meet you</p>
          <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-gray-400">Schedule a site visit or drop us a message.</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-[#172544]">Get in Touch</h2>
            {[
              { icon: Phone, label: 'Call Us', value: config.company.phone, href: `tel:${config.company.phoneTel}` },
              { icon: Mail, label: 'Email Us', value: config.company.email, href: `mailto:${config.company.email}` },
              { icon: MapPin, label: 'Location', value: config.company.address, href: null },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-[#B88A35]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-[#B88A35]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-medium text-[#172544] hover:text-[#B88A35] transition">{item.value}</a>
                  ) : (
                    <p className="text-sm font-medium text-[#172544]">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            <a
              href={`https://wa.me/${config.company.whatsapp}?text=${encodeURIComponent('Hello Sri Lalitha Infra! I am interested in your plots in Andhra Pradesh and would like more information.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-5 py-3.5 rounded-xl font-semibold transition w-full justify-center"
            >
              <MessageCircle size={20} /> Chat on WhatsApp
            </a>

            <a
              href={config.company.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 border-2 border-[#B88A35] text-[#B88A35] hover:bg-[#B88A35] hover:text-white px-5 py-3.5 rounded-xl font-semibold transition w-full justify-center"
            >
              <Navigation size={20} /> Get Directions
            </a>

            <div className="bg-[#172544] text-white rounded-xl p-4 text-sm">
              <p className="font-semibold text-[#D5B46B] mb-1">Office Hours</p>
              <p className="text-gray-400">Monday – Saturday: 9 AM – 7 PM</p>
              <p className="text-gray-400">Sunday: 10 AM – 5 PM</p>
            </div>
          </div>

          {/* Site Visit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-[#172544] mb-6">Schedule a Free Site Visit</h2>
              {submitted ? (
                <div className="text-center py-10">
                  <CheckCircle size={50} className="text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#172544] mb-2">Visit Scheduled!</h3>
                  <p className="text-gray-500">Our team will call you within 2 hours to confirm the appointment.</p>
                  <p className="text-xs text-gray-400 mt-2">{config.project.disclaimer}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Full Name *" value={form.name} onChange={handleChange('name')} error={errors.name} placeholder="Your full name" />
                    <Input label="Mobile Number *" type="tel" inputMode="numeric" maxLength={10} value={form.mobile} onChange={handleChange('mobile')} error={errors.mobile} placeholder="10-digit number" />
                  </div>
                  <Input label="Email (optional)" type="email" value={form.email} onChange={handleChange('email')} error={errors.email} placeholder="email@example.com" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Preferred Date *" type="date" value={form.preferredDate} onChange={handleChange('preferredDate')} error={errors.preferredDate} min={new Date().toISOString().split('T')[0]} />
                    <Select label="Preferred Time" value={form.preferredTime} onChange={handleChange('preferredTime')}>
                      <option value="">Any Time</option>
                      <option value="9 AM - 11 AM">9 AM – 11 AM</option>
                      <option value="11 AM - 1 PM">11 AM – 1 PM</option>
                      <option value="2 PM - 4 PM">2 PM – 4 PM</option>
                      <option value="4 PM - 6 PM">4 PM – 6 PM</option>
                    </Select>
                  </div>
                  <Textarea label="Message (optional)" value={form.message} onChange={handleChange('message')} rows={3} placeholder="Any specific plots you're interested in, or questions for our team..." />

                  <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <AlertCircle size={15} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700">{config.project.disclaimer}</p>
                  </div>

                  {errors.submit && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors.submit}</p>
                  )}
                  <Button type="submit" size="lg" className="w-full">
                    Book My Free Site Visit
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
