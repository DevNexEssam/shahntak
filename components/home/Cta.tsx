"use client"
import { FaArrowRight, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function CTA() {
  return (
    <section id="cta" className="section-padding">
      <div className="container-narrow">
        <div className="relative overflow-hidden rounded-xl bg-primary px-6 py-16 sm:px-12 lg:px-16">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px]" />
          <div className="absolute inset-0 bg-dots opacity-30" />

          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground tracking-tight mb-5 leading-[1.15]">
                اجعل عمليتك بالكامل في منصة واحدة
              </h2>
              <p className="text-base text-primary-foreground/70 leading-relaxed mb-8 max-w-lg">
                ابدأ بشحناتك وفواتيرك الحالية. سنساعدك في نقل أسطولك،
                خطوطك، وفريقك إلينا.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-7 py-3.5 rounded-lg font-medium text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                >
                  ابدأ مجاناً
                  <FaArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 border border-primary-foreground/30 text-primary-foreground px-7 py-3.5 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-primary-foreground/10 active:scale-[0.98]"
                >
                  اطلب عرضاً توضيحياً
                </a>
              </div>

              <div className="flex flex-wrap gap-6">
                <a href="tel:+966920000000" className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  <FaPhone className="w-4 h-4" />
                  +966 920 000 000
                </a>
                <a href="mailto:hello@shahnatak.sa" className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  <FaEnvelope className="w-4 h-4" />
                  hello@shahnatak.sa
                </a>
                <span className="flex items-center gap-2 text-sm text-primary-foreground/60">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  الرياض، السعودية
                </span>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-heading mb-1">اطلب عرضاً توضيحياً</h3>
              <p className="text-sm text-body mb-5">املأ بياناتنا وسنعود لك خلال ٢٤ ساعة.</p>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-body mb-1.5">الاسم الكامل</label>
                    <input
                      type="text"
                      placeholder="اسمك"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-surface-muted text-heading placeholder:text-body/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-body mb-1.5">الشركة</label>
                    <input
                      type="text"
                      placeholder="اسم الشركة"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-surface-muted text-heading placeholder:text-body/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-body mb-1.5">البريد الإلكتروني للعمل</label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-surface-muted text-heading placeholder:text-body/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-body mb-1.5">رقم الهاتف</label>
                  <input
                    type="tel"
                    placeholder="+966 5X XXX XXXX"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-surface-muted text-heading placeholder:text-body/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  طلب عرض توضيحي
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}