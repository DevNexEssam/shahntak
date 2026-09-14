import { FaUserPlus, FaUsers, FaBox } from 'react-icons/fa';

const steps = [
  {
    number: '01',
    icon: FaUserPlus,
    title: 'Register Your Company',
    body: 'Create your company account in minutes. Add your business details, branches, and logistics lanes — no setup fees, no long-term contracts.',
  },
  {
    number: '02',
    icon: FaUsers,
    title: 'Add Employees & Drivers',
    body: 'Invite your team members, define roles and permissions, and register your drivers and contracted carriers. Everyone gets their own access level.',
  },
  {
    number: '03',
    icon: FaBox,
    title: 'Start Managing Shipments',
    body: 'Create or import orders, consolidate them into shipments, assign them to vehicles and routes, track delivery in real time, and issue ZATCA-compliant invoices.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding bg-surface-muted">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-[720px] text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl font-semibold text-heading md:text-4xl">
            Get Started in Three Steps
          </h2>
          <p className="mt-4 text-lg">
            From sign-up to your first shipment — Shahntak gets your operation up and running fast.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.number}
              className="relative rounded-lg border border-border bg-surface p-7 shadow-sm"
            >
              <span className="numeric text-4xl font-bold text-accent">{s.number}</span>
              <h3 className="mt-4 text-xl font-bold text-heading">{s.title}</h3>
              <p className="mt-2.5 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}