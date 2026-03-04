'use client';

import { PenTool, ShoppingCart, Truck, KeyRound, ShieldCheck, HeadphonesIcon } from 'lucide-react';

const services = [
  {
    icon: PenTool,
    title: 'Engineering',
    description: 'Custom specifications and technical design support',
  },
  {
    icon: ShoppingCart,
    title: 'Procurement',
    description: 'Global sourcing from certified manufacturers',
  },
  {
    icon: Truck,
    title: 'Logistics',
    description: 'End-to-end shipping and delivery coordination',
  },
  {
    icon: KeyRound,
    title: 'Leasing',
    description: 'Flexible lease and finance options to fit your budget and timeline',
  },
  {
    icon: ShieldCheck,
    title: 'Service & Warranty',
    description: 'Ongoing maintenance, repairs, and warranty management for the life of your equipment',
  },
  {
    icon: HeadphonesIcon,
    title: 'Ongoing Support',
    description: '24/7 technical support and maintenance services',
  },
];

export default function GlobalServices() {
  return (
    <section id="about" className="relative py-20 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-[#0a1628]/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            GLOBAL REACH, LOCAL SERVICE
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Procurement, leasing, and lifecycle support for every transformer
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-[#0f1d32]/80 backdrop-blur-sm border border-[#1e3a5f] rounded-lg p-6 hover:border-[#0ea5e9] transition-colors"
            >
              <service.icon className="w-10 h-10 text-[#0ea5e9] mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">{service.title}</h3>
              <p className="text-gray-400">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
