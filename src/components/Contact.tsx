'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your inquiry. We will contact you shortly.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-20 bg-[#0f1d32]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Contact Info */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              LET'S TALK
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Ready to start your next transformer project? Contact our team for
              expert guidance and competitive pricing.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0ea5e9]/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-[#0ea5e9]" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Call us</div>
                  <a href="tel:+15128593335" className="text-white font-semibold hover:text-[#0ea5e9]">
                    (512) 859-3335
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0ea5e9]/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-[#0ea5e9]" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Email us</div>
                  <a href="mailto:sales@fluxco.com" className="text-white font-semibold hover:text-[#0ea5e9]">
                    sales@fluxco.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0ea5e9]/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#0ea5e9]" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Location</div>
                  <span className="text-white font-semibold">Austin, Texas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="bg-[#0a1628] border border-[#1e3a5f] rounded-lg p-8">
            <h3 className="text-xl font-bold text-white mb-6">Request a Quote</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#0f1d32] border border-[#1e3a5f] rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#0ea5e9]"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Company *</label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full bg-[#0f1d32] border border-[#1e3a5f] rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#0ea5e9]"
                    placeholder="Acme Energy"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#0f1d32] border border-[#1e3a5f] rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#0ea5e9]"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#0f1d32] border border-[#1e3a5f] rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#0ea5e9]"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Project Details</label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-[#0f1d32] border border-[#1e3a5f] rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#0ea5e9] resize-none"
                  placeholder="Tell us about your transformer requirements..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-3 rounded font-semibold transition-colors"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
