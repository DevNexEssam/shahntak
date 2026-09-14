import { FaBox, FaTruck, FaFileAlt, FaUsers, FaChartBar, FaUpload, FaMapMarkerAlt, FaWallet } from 'react-icons/fa';

const modules = [
  {
    icon: FaBox,
    title: 'Orders & Shipments',
    description:
      'Convert individual shipping requests into unified shipments — full truckload, less-than-truckload, or local delivery. Bulk import via Excel.',
    color: 'accent',
    features: ['FTL / LTL / Local Delivery', 'Bulk Import via Excel', 'Automatic Consolidation'],
  },
  {
    icon: FaTruck,
    title: 'Fleet & Routes',
    description:
      'Track contracted vehicles and carriers. Define routes and logistics lanes between cities with real-time visibility.',
    color: 'accent',
    features: ['Vehicle & Carrier Tracking', 'Route Optimization', 'Inter-City Lanes'],
  },
  {
    icon: FaFileAlt,
    title: 'Invoices & Finance',
    description:
      'Issue tax invoices compliant with ZATCA (15% / 0%), sync waybill numbers, and record operational expenses to automatically calculate net profit.',
    color: 'accent',
    features: ['ZATCA-Compliant Invoicing', 'Waybill Number Sync', 'Expense & Profit Tracking'],
  },
  {
    icon: FaUsers,
    title: 'Team & Employees',
    description:
      'Assign permissions and roles to employees within your company. Control who can view, edit, and manage each module.',
    color: 'accent',
    features: ['Role-Based Access Control', 'Permission Management', 'Team Activity Logs'],
  },
  {
    icon: FaChartBar,
    title: 'Analytics & Reports',
    description:
      'Track financial and operational performance, expenses, and tax compliance through real-time dashboards and exportable reports.',
    color: 'accent',
    features: ['Financial Dashboards', 'Operational Metrics', 'Tax Compliance Reports'],
  },
  {
    icon: FaUpload,
    title: 'Bulk Operations',
    description:
      'Import hundreds of orders at once via Excel. Export reports, invoices, and shipment data in standard formats.',
    color: 'accent',
    features: ['Bulk Import via Excel', 'One-Click Export', 'Standard Formats'],
  },
];

const secondaryFeatures = [
  { icon: FaMapMarkerAlt, title: 'Real-Time GPS Tracking', description: 'Know exactly where every vehicle is at any moment.' },
  { icon: FaWallet, title: 'Net Profit Calculator', description: 'Automatically calculate profitability per shipment after expenses.' },
  { icon: FaFileAlt, title: 'ZATCA E-Invoicing', description: 'Compliant tax invoices ready for Saudi regulations.' },
  { icon: FaTruck, title: 'Carrier Management', description: 'Manage contracted carriers with performance ratings.' },
];

export default function Features() {
  return (
    <section id="features" className="section-padding relative">
      <div className="container-narrow">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-accent font-extrabold text-[13.5px] tracking-[0.5px] mb-3.5 block">
             Platform Modules
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading tracking-tight mb-4">
            Everything Your Shipping Company Needs
          </h2>
          <p className="text-lg text-body leading-relaxed">
            Five integrated modules covering the complete logistics cycle — from order creation
            to final delivery and invoice issuance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="card p-6 hover:shadow-lg hover:border-accent/30 group transition-all duration-300"
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-accent-soft flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-heading mb-2">{mod.title}</h3>
                <p className="text-sm text-body leading-relaxed mb-4">{mod.description}</p>
                <ul className="space-y-1.5">
                  {mod.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-body">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {secondaryFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="flex items-start gap-3 p-5 rounded-xl bg-surface-muted border border-border hover:border-accent/30 transition-all duration-300"
                style={{ transitionDelay: `${idx * 60 + 200}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-heading mb-1">{feat.title}</h4>
                  <p className="text-xs text-body leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div> */}
      </div>
    </section>
  );
}