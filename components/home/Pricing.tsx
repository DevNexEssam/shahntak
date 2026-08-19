import React from 'react';
import Link from 'next/link';
import { FaCheck } from 'react-icons/fa6';

export const Pricing: React.FC = () => {
  return (
    <section className="py-[100px]" id="pricing">
      <div className="max-w-[1240px] mx-auto px-6">
        
        <div className="max-w-[640px] mx-auto text-center mb-14">
          <span className="text-accent font-extrabold text-[13.5px] tracking-[0.5px] mb-3.5 block">
            الأسعار
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-[-0.4px] mb-3.5">
            خطط تناسب حجم شركتك
          </h2>
          <p className="text-[16.5px] text-body">
            ابدأ مجاناً، وارتقِ بخطتك مع نمو عملياتك. جميع الأسعار بالريال السعودي.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[420px] lg:max-w-none mx-auto items-stretch">
          {/* Starter Tier */}
          <div className="bg-surface border-[1.5px] border-border rounded-[24px] p-[36px_30px] flex flex-col transition-all duration-300 hover:-translate-y-1.5">
            <h3 className="text-[19px] font-extrabold text-heading mb-1.5">البداية</h3>
            <p className="text-[13.5px] text-body mb-[22px]">لشركات الشحن الناشئة وفرع واحد</p>
            
            <div className="flex items-baseline gap-1.5 mb-[26px]">
              <b className="font-latin text-[42px] font-bold text-heading">٢٩٩</b>
              <span className="text-sm font-semibold text-body">ر.س / شهرياً</span>
            </div>

            <ul className="mb-[30px] flex-grow space-y-[13px]">
              {['حتى ٣٠٠ طلب شهرياً', 'فرع واحد و٥ سائقين', 'تتبع لحظي أساسي', 'فوترة تلقائية'].map((feat, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[14.5px] text-body">
                  <span className="w-[18px] h-[18px] rounded-full bg-success-soft text-success flex items-center justify-center shrink-0">
                    <FaCheck className="w-2.5 h-2.5" />
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <Link href="#" className="w-full inline-flex items-center justify-center py-3.5 rounded-full border-[1.5px] border-border text-heading hover:border-heading font-bold text-[15px] transition-colors">
              ابدأ مجاناً
            </Link>
          </div>

          {/* Pro / Featured Tier */}
          <div className="bg-heading border-[1.5px] border-heading rounded-[24px] p-[36px_30px] flex flex-col text-white shadow-[0_40px_70px_-25px_rgba(0,0,0,0.35)] relative transition-all duration-300 hover:-translate-y-1.5">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[12.5px] font-bold px-[18px] py-1.5 rounded-full whitespace-nowrap">
              الأكثر طلباً
            </span>
            
            <h3 className="text-[19px] font-extrabold text-white mb-1.5">النمو</h3>
            <p className="text-[13.5px] text-white/60 mb-[22px]">لشركات الشحن متعددة الفروع</p>
            
            <div className="flex items-baseline gap-1.5 mb-[26px]">
              <b className="font-latin text-[42px] font-bold text-white">٧٩٩</b>
              <span className="text-sm font-semibold text-white/55">ر.س / شهرياً</span>
            </div>

            <ul className="mb-[30px] flex-grow space-y-[13px]">
              {['طلبات غير محدودة', 'حتى ١٠ فروع و٥٠ سائق', 'تتبع لحظي متقدم + خرائط', 'تقارير أداء تفصيلية', 'دعم فني مخصص'].map((feat, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[14.5px] text-white/80">
                  <span className="w-[18px] h-[18px] rounded-full bg-white/15 text-white flex items-center justify-center shrink-0">
                    <FaCheck className="w-2.5 h-2.5" />
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <Link href="#" className="w-full inline-flex items-center justify-center py-3.5 rounded-full bg-accent text-white font-bold text-[15px] hover:shadow-[0_12px_28px_rgba(116,68,253,0.4)] transition-all">
              ابدأ الآن
            </Link>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-surface border-[1.5px] border-border rounded-[24px] p-[36px_30px] flex flex-col transition-all duration-300 hover:-translate-y-1.5">
            <h3 className="text-[19px] font-extrabold text-heading mb-1.5">المؤسسات</h3>
            <p className="text-[13.5px] text-body mb-[22px]">لشركات الشحن الكبرى والشبكات الوطنية</p>
            
            <div className="flex items-baseline gap-1.5 mb-[26px]">
              <b className="font-latin text-[42px] font-bold text-heading">مخصص</b>
            </div>

            <ul className="mb-[30px] flex-grow space-y-[13px]">
              {['فروع وسائقين غير محدودين', 'واجهة API مخصصة', 'إدارة صلاحيات متقدمة', 'مدير حساب مخصص'].map((feat, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[14.5px] text-body">
                  <span className="w-[18px] h-[18px] rounded-full bg-success-soft text-success flex items-center justify-center shrink-0">
                    <FaCheck className="w-2.5 h-2.5" />
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <Link href="#" className="w-full inline-flex items-center justify-center py-3.5 rounded-full border-[1.5px] border-border text-heading hover:border-heading font-bold text-[15px] transition-colors">
              تواصل مع المبيعات
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};