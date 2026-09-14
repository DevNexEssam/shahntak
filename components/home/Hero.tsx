import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';

const stats = [
  { label: 'Shipments Managed', value: '0M+' },
  { label: 'Active Companies', value: '0+' },
  { label: 'Cities Covered', value: '0+' },
  { label: 'Uptime', value: '0%' },
];

const checkItems = [
  'Support for full truckload and less-than-truckload shipments',
  'Tax invoicing compliant with ZATCA (Zakat, Tax and Customs Authority)',
  'Real-time fleet tracking and route planning',
];

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-soft rounded-full blur-[120px] opacity-60 -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-success-soft rounded-full blur-[100px] opacity-40 -z-10" />

      <div className="container-narrow relative">
        <div className="max-w-3xl mx-auto text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full  text-heading/40 text-xs font-secondary font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Trusted by shipping companies across Saudi Arabia
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-heading leading-[1.1] tracking-tight mb-6">
            Manage your shipments, fleet, and invoices from{' '}
            <span className="text-gradient">one place</span>
          </h1>

          <p className="text-lg text-body leading-relaxed mb-8 max-w-2xl mx-auto">
            Shahntak is a cloud platform for businesses to manage logistics,
            transportation, and shipping operations — with unified shipments,
            real-time fleet tracking, and ZATCA-compliant invoicing.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <a href="#cta" className="btn-primary">
              Get Started
              <FaArrowRight className="w-4 h-4" />
            </a>
            <a href="#features" className="btn-outline">
              Explore Features
            </a>
          </div>

          <ul className="flex flex-col sm:flex-row gap-2.5 sm:gap-6 sm:justify-center sm:flex-wrap max-w-2xl mx-auto">
            {checkItems.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-body text-left">
                <FaCheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-border">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl lg:text-4xl font-bold text-heading font-secondary tracking-tight">
                {stat.value}
              </p>
              <p className="text-sm text-body mt-1">{stat.label}</p>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  );
}