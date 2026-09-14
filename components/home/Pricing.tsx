import { FaCheck, FaArrowRight, FaStar } from 'react-icons/fa';

const plans = [
  {
    name: 'Starter Plan',
    description: 'Ideal for small companies starting their digital operations.',
    price: '1',
    period: '/mo',
    badge: null,
    features: [
      'Feature One',
      'Feature Two',
      'Feature Three',
      'Feature Four',
      'Feature Five',
    ],
    cta: 'Get Started',
    ctaStyle: 'outline',
    highlighted: false,
  },
  {
    name: 'Growth Plan',
    description: 'Ideal for growing companies that need more features.',
    price: '1',
    period: '/mo',
    badge: 'Most Popular',
    features: [
      'Feature One',
      'Feature Two',
      'Feature Three',
      'Feature Four',
      'Feature Five',
    ],
    cta: 'Get Started',
    ctaStyle: 'accent',
    highlighted: true,
  },
  {
    name: 'Enterprise Plan',
    description: 'Ideal for large companies and advanced operations.',
    price: '1',
    period: '/mo',
    badge: null,
    features: [
      'Feature One',
      'Feature Two',
      'Feature Three',
      'Feature Four',
      'Feature Five',
    ],
    cta: 'Contact Us',
    ctaStyle: 'outline',
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="section-padding bg-surface-muted relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent-soft rounded-full blur-[150px] opacity-40" />

      <div className="container-narrow relative">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">
            Pricing Plans
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-body leading-relaxed">
            Choose the plan that fits your company's size. Upgrade or downgrade at any time —
            no long-term contracts.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative card p-7 transition-all duration-300 ${plan.highlighted
                ? 'border-accent shadow-lg lg:scale-[1.03] bg-surface'
                : 'hover:shadow-lg hover:border-border'
                }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge-accent text-xs px-4 py-1.5 shadow-sm">
                    <FaStar className="w-3 h-3 text-accent" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <h3 className="text-xl font-semibold text-heading mb-2">{plan.name}</h3>
              <p className="text-sm text-body leading-relaxed mb-5 min-h-[40px]">
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1 mb-1">
                {plan.price !== 'Custom' && (
                  <span className="text-lg font-secondary font-medium text-body">SAR</span>
                )}
                <span className="text-4xl font-bold text-heading font-secondary tracking-tight">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-body">{plan.period}</span>
                )}
              </div>
              <p className="text-xs text-body mb-6">
                {plan.price === 'Custom' ? 'Tailored to your needs' : 'Monthly billing, cancel anytime'}
              </p>

              <a
                href="/company/login"
                className={`w-full mb-6 ${plan.ctaStyle === 'accent' ? 'btn-accent' : 'btn-outline'}`}
              >
                {plan.cta}
                <FaArrowRight className="w-4 h-4" />
              </a>

              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-body">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.highlighted ? 'bg-accent-soft' : 'bg-surface-muted'
                        }`}
                    >
                      <FaCheck
                        className={`w-3 h-3 ${plan.highlighted ? 'text-accent' : 'text-heading'}`}
                      />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-body mt-10">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}