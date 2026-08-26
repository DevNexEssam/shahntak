import React from 'react';
import {
  HiMapPin,
  HiUsers,
  HiChartBar
} from 'react-icons/hi2';
import { LuPackage } from 'react-icons/lu';

export const Features: React.FC = () => {
  const features = [
    {
      icon: LuPackage,
      title: 'إدارة الطلبات',
      description: 'استقبل الطلبات من كل قنواتك، وزّعها على السائقين، وتابع حالتها لحظة بلحظة من مكان واحد.',
      color: 'accent',
    },
    {
      icon: HiMapPin,
      title: 'تتبع لحظي',
      description: 'خريطة مباشرة لموقع كل شحنة، مع إشعارات تلقائية للعميل عبر الرسائل النصية والواتساب.',
      color: 'lime',
    },
    {
      icon: HiUsers,
      title: 'السائقون والفروع',
      description: 'أضف فروعك في كل مدن المملكة، وأسند المناديب، وراقب أداء كل فرع وسائق بمؤشرات واضحة.',
      color: 'gold',
    },
    {
      icon: HiChartBar,
      title: 'تقارير وفواتير',
      description: 'فواتير متوافقة مع متطلبات الفوترة الإلكترونية، وتقارير إيرادات وتكاليف بالريال السعودي.',
      color: 'accent',
    },
  ];

  return (
    <section id="features" className="mx-auto max-w-[1200px] px-5 py-20 md:py-28">
      {/* Header */}
      <div className="max-w-155">
        <span className="text-sm font-bold text-accent">لماذا شحنتك؟</span>
        <h2 className="mt-3 text-[32px] font-bold text-heading md:text-[42px]">
          كل ما تحتاجه شركة الشحن في منصة واحدة
        </h2>
        <p className="mt-4 text-[17px] leading-7.5 text-muted-foreground">
          صممنا شحنتك خصيصاً لسوق الشحن السعودي، من أول طلب حتى آخر فاتورة.
        </p>
      </div>

      {/* Features Grid */}
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          const colorConfig = {
            accent: {
              bg: 'bg-accent-soft',
              text: 'text-accent',
              border: 'hover:border-accent/40',
            },
            lime: {
              bg: 'bg-lime/20',
              text: 'text-lime',
              border: 'hover:border-lime/40',
            },
            gold: {
              bg: 'bg-gold/20',
              text: 'text-gold',
              border: 'hover:border-gold/40',
            },
          };

          const colors = colorConfig[feature.color as keyof typeof colorConfig];

          return (
            <article
              key={index}
              className={`group rounded-[20px] border border-border bg-card p-8 transition-all hover:-translate-y-1 ${colors.border} hover:shadow-soft`}
            >
              <span className={`flex size-14 items-center justify-center rounded-[18px] ${colors.bg} ${colors.text}`}>
                <Icon className="size-6" />
              </span>
              <h3 className="mt-6 text-xl font-bold text-heading">
                {feature.title}
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
                {feature.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
};