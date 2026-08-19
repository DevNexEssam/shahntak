import React from 'react';

const featuresData = [
  {
    title: 'إدارة الطلبات',
    description: 'استقبل الطلبات ووزّعها على الفروع والسائقين تلقائياً، مع حالة واضحة لكل شحنة من لحظة إنشائها.',
    iconBg: 'bg-accent-soft text-accent',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 9H17M7 13H14M7 17H11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'تتبع لحظي',
    description: 'راقب مواقع الشحنات والسائقين على الخريطة لحظة بلحظة، وأرسل روابط تتبع مباشرة للعملاء.',
    iconBg: 'bg-warning-soft text-warning',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 21C12 21 19 15.5 19 10A7 7 0 0 0 5 10C5 15.5 12 21 12 21Z" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: 'السائقون والفروع',
    description: 'أضف فروعك وسائقيك، ووزّع الصلاحيات والمهام حسب كل فرع بمرونة كاملة.',
    iconBg: 'bg-success-soft text-success',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17" cy="9" r="2.6" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 20C3 16.5 5.5 14.5 8.5 14.5C11.5 14.5 13.5 16.3 13.8 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14.5 15C17.2 15 19.5 16.6 20 19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'تقارير وفواتير',
    description: 'فواتير تلقائية بالريال السعودي وتقارير أداء تفصيلية تساعدك تتخذ قرارات أدق كل شهر.',
    iconBg: 'bg-accent-soft text-accent',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M6 3H15L19 7V21H6V3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 12H16M9 16H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const Features: React.FC = () => {
  return (
    <section className="py-[100px]" id="features">
      <div className="max-w-[1240px] mx-auto px-6">

        <div className="max-w-[640px] mb-14">
          <span className="text-accent font-extrabold text-[13.5px] tracking-[0.5px] mb-3.5 block">
            لماذا شَحنتك؟
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-[-0.4px] mb-3.5">
            كل أداة تحتاجها شركتك لإدارة الشحن
          </h2>
          <p className="text-[16.5px] text-body">
            من استلام الطلب إلى التسليم والفوترة، شَحنتك توحّد عمليات شركتك في مكان واحد مصمم لطبيعة السوق السعودي.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuresData.map((item, index) => (
            <div
              key={index}
              className="bg-surface-muted border border-border rounded-[20px] p-[30px_26px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.15)] hover:border-transparent"
            >
              <div className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center mb-5 ${item.iconBg}`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-extrabold text-heading mb-2.5">{item.title}</h3>
              <p className="text-[14.5px] text-body">{item.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};