import React from 'react';

export const Stats: React.FC = () => {
  return (
    <section className="py-[100px]">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="bg-heading rounded-[40px] overflow-hidden relative">
          <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none z-0" viewBox="0 0 1200 400" fill="none" preserveAspectRatio="none">
            <path d="M-20 350 C 200 350, 220 100, 450 100 S 650 300, 900 250 S 1050 50, 1250 50" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="2 12" strokeLinecap="round" />
          </svg>
          <div className="max-w-[1192px] mx-auto py-[76px] px-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[30px] text-center">
              <div>
                <b className="block font-latin text-4xl sm:text-[44px] font-bold text-white mb-2 tracking-tight">٢٠٠+</b>
                <span className="text-white/55 text-[14.5px] font-semibold">شركة شحن مسجّلة</span>
              </div>
              <div>
                <b className="block font-latin text-4xl sm:text-[44px] font-bold text-white mb-2 tracking-tight">٤.٦ مليون</b>
                <span className="text-white/55 text-[14.5px] font-semibold">شحنة تمت إدارتها</span>
              </div>
              <div>
                <b className="block font-latin text-4xl sm:text-[44px] font-bold text-white mb-2 tracking-tight">١٬٨٥٠+</b>
                <span className="text-white/55 text-[14.5px] font-semibold">سائق نشط على المنصة</span>
              </div>
              <div>
                <b className="block font-latin text-4xl sm:text-[44px] font-bold text-white mb-2 tracking-tight">٪٩٩.٩</b>
                <span className="text-white/55 text-[14.5px] font-semibold">نسبة استقرار المنصة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};