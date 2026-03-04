'use client';

export default function EPCServices() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-[#0a1628]/85" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          FULL EPC SERVICES
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Engineering, procurement and project management for every transformer need.
          Plus leasing, service and warranty support for the life of your equipment.
        </p>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-8 py-4 rounded font-semibold transition-colors text-lg"
        >
          Talk to Our Team
        </a>
      </div>
    </section>
  );
}
