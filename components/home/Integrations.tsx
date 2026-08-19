import React from 'react';
import { LuCreditCard, LuStore, LuTruck, LuCode } from 'react-icons/lu';

export const Integrations: React.FC = () => {
  return (
    <section className="py-[100px]" id="integrations">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-[60px] items-center">

          {/* Integrations Feature Column */}
          <div>
            <span className="text-accent font-extrabold text-[13.5px] tracking-[0.5px] mb-3.5 block">
              التكامل
            </span>
            <h2 className="text-3xl lg:text-[32px] font-extrabold text-heading tracking-[-0.4px] mb-3.5">
              يتكامل مع الأنظمة اللي شركتك تستخدمها فعلاً
            </h2>
            <p className="text-base text-body mb-[30px] max-w-[420px]">
              اربط شَحنتك ببوابات الدفع ومنصات المتاجر وشركات النقل الخارجية، أو ابنِ تكاملك الخاص عبر واجهة API مفتوحة.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface border border-border rounded-[18px] p-5 flex items-center gap-3.5 transition-all duration-200 hover:border-accent hover:-translate-y-1 hover:shadow-[0_16px_32px_-18px_rgba(116,68,253,0.35)]">
                <span className="w-11 h-11 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
                  <LuCreditCard className="w-5 h-5" />
                </span>
                <div>
                  <b className="block text-[14.5px] text-heading mb-0.5">بوابات الدفع</b>
                  <span className="text-[12.5px] text-body">مدى، STC Pay، آبل باي</span>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-[18px] p-5 flex items-center gap-3.5 transition-all duration-200 hover:border-accent hover:-translate-y-1 hover:shadow-[0_16px_32px_-18px_rgba(116,68,253,0.35)]">
                <span className="w-11 h-11 rounded-xl bg-warning-soft text-warning flex items-center justify-center shrink-0">
                  <LuStore className="w-5 h-5" />
                </span>
                <div>
                  <b className="block text-[14.5px] text-heading mb-0.5">المتاجر الإلكترونية</b>
                  <span className="text-[12.5px] text-body">سلة، زد، ووكومرس</span>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-[18px] p-5 flex items-center gap-3.5 transition-all duration-200 hover:border-accent hover:-translate-y-1 hover:shadow-[0_16px_32px_-18px_rgba(116,68,253,0.35)]">
                <span className="w-11 h-11 rounded-xl bg-success-soft text-success flex items-center justify-center shrink-0">
                  <LuTruck className="w-5 h-5" />
                </span>
                <div>
                  <b className="block text-[14.5px] text-heading mb-0.5">شركات النقل الخارجية</b>
                  <span className="text-[12.5px] text-body">سمسا، أرامكس، ناقل</span>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-[18px] p-5 flex items-center gap-3.5 transition-all duration-200 hover:border-accent hover:-translate-y-1 hover:shadow-[0_16px_32px_-18px_rgba(116,68,253,0.35)]">
                <span className="w-11 h-11 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
                  <LuCode className="w-5 h-5" />
                </span>
                <div>
                  <b className="block text-[14.5px] text-heading mb-0.5">API مفتوح و Webhooks</b>
                  <span className="text-[12.5px] text-body">ابنِ تكاملك الخاص</span>
                </div>
              </div>
            </div>
          </div>

          {/* Webhook & Code Sample Card */}
          <div className="bg-heading rounded-[24px] p-7 text-white shadow-[0_30px_60px_-25px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-accent/20 text-[#b39bff] text-xs font-bold px-3 py-1 rounded-full">
                مثال Webhook
              </span>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/20" />
                <span className="w-2 h-2 rounded-full bg-white/20" />
                <span className="w-2 h-2 rounded-full bg-white/20" />
              </div>
            </div>

            <div className="bg-[#0c0c0c] rounded-[14px] p-[18px] font-latin font-mono text-[12.5px] leading-relaxed overflow-x-auto text-left" dir="ltr">
              <span className="text-[#6a7280] block">// Shipment status update payload</span>
              <span className="text-[#b39bff] font-bold">POST</span> <span className="text-white">/webhooks/shipment.updated</span><br />
              &#123;<br />
              &nbsp;&nbsp;&quot;shipment_id&quot;: <span className="text-warning">&quot;SH-4421&quot;</span>,<br />
              &nbsp;&nbsp;&quot;status&quot;: <span className="text-warning">&quot;out_for_delivery&quot;</span>,<br />
              &nbsp;&nbsp;&quot;branch&quot;: <span className="text-warning">&quot;riyadh_north&quot;</span>,<br />
              &nbsp;&nbsp;&quot;driver&quot;: <span className="text-warning">&quot;عبدالله م.&quot;</span><br />
              &#125;
            </div>
            <p className="text-sm text-white/65 mt-4">
              كل حدث في المنصة — طلب جديد، تسليم، فاتورة — يوصلك فوراً لأنظمتك الخارجية.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};