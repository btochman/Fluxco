'use client';

import { ArrowRight, Globe, FileText, Activity } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=2000&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-[#0a1628]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-white">ONE CALL.</span>
            <br />
            <span className="text-[#0ea5e9]">GLOBAL POWER.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
            It doesn&apos;t make sense for your team to become transformer experts.
            We handle procurement, leasing, service and warranty so you don&apos;t have to.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-6 py-3 rounded font-semibold transition-colors"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-2 border border-gray-500 hover:border-[#0ea5e9] text-white px-6 py-3 rounded font-semibold transition-colors"
            >
              Our Services
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 md:gap-12">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-gray-500" />
              <div>
                <div className="text-2xl font-bold text-white">100+</div>
                <div className="text-sm text-gray-400">Global Partners</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-gray-500" />
              <div>
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  1,207
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                </div>
                <div className="text-sm text-gray-400">RFQs Created</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-gray-500" />
              <div>
                <div className="text-2xl font-bold text-white">Real-Time</div>
                <div className="text-sm text-gray-400">Order Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
