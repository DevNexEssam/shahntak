import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-[100px] bg-surface-muted" id="how">
      <div className="max-w-[1240px] mx-auto px-6">
        
        <div className="max-w-[640px] mx-auto text-center mb-14">
          <span className="text-accent font-extrabold text-[13.5px] tracking-[0.5px] mb-3.5 block">
            كيف يعمل؟
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-[-0.4px] mb-3.5">
            ابدأ خلال دقائق، بلا تعقيد
          </h2>
          <p className="text-[16.5px] text-body">
            ثلاث خطوات بسيطة تفصلك عن لوحة تحكم كاملة لإدارة شركتك.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-[34px] right-[12%] left-[12%] h-[2px] bg-[repeating-linear-gradient(to_left,var(--color-border)_0_10px,transparent_10px_20px)] z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="text-center">
              <div className="w-[68px] h-[68px] rounded-full bg-surface border-2 border-heading text-heading flex items-center justify-center font-bold text-[22px] mx-auto mb-[22px] font-latin">
                ١
              </div>
              <h3 className="text-[18.5px] font-extrabold text-heading mb-2.5">سجّل شركتك</h3>
              <p className="text-[14.5px] text-body max-w-[270px] mx-auto">أنشئ حسابك واحصل على مساحة عمل خاصة بشركتك خلال دقيقتين.</p>
            </div>

            <div className="text-center">
              <div className="w-[68px] h-[68px] rounded-full bg-accent border-2 border-accent text-white flex items-center justify-center font-bold text-[22px] mx-auto mb-[22px] font-latin">
                ٢
              </div>
              <h3 className="text-[18.5px] font-extrabold text-heading mb-2.5">أضف فروعك وسائقيك</h3>
              <p className="text-[14.5px] text-body max-w-[270px] mx-auto">اربط فروعك، وأضف فريق السائقين، وحدد صلاحيات كل عضو.</p>
            </div>

            <div className="text-center">
              <div className="w-[68px] h-[68px] rounded-full bg-surface border-2 border-heading text-heading flex items-center justify-center font-bold text-[22px] mx-auto mb-[22px] font-latin">
                ٣
              </div>
              <h3 className="text-[18.5px] font-extrabold text-heading mb-2.5">ابدأ إدارة الشحنات</h3>
              <p className="text-[14.5px] text-body max-w-[270px] mx-auto">استقبل الطلبات، تابع التسليم لحظياً، وأصدر الفواتير تلقائياً.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};