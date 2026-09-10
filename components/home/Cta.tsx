
"use client";

import Link from "next/link";
import { FaArrowRight, FaMapMarkerAlt } from "react-icons/fa";

export default function CTA() {
  return (
    <section
      id="cta"
      dir="rtl"
      className="section-padding text-right"
    >
      <div className="container-narrow">
        <div className="relative overflow-hidden rounded-xl bg-primary px-6 py-16 sm:px-12 lg:px-16">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px]" />
          <div className="absolute inset-0 bg-dots opacity-30" />

          <div className="relative flex flex-col items-center text-center">
            <div className="max-w-3xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground tracking-tight mb-5 leading-[1.15]">
                اجعل عمليتك بالكامل في منصة واحدة
              </h2>

              <p className="text-base sm:text-lg text-primary-foreground/70 leading-relaxed mb-8 max-w-2xl mx-auto">
                ابدأ بشحناتك وفواتيرك الحالية. سنساعدك في نقل أسطولك،
                خطوطك، وفريقك إلينا.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3 mb-10">
                <Link
                  href="/company/login"
                  className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-7 py-3.5 rounded-lg font-medium text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                >
                  ابدأ مجاناً
                  <FaArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 border border-primary-foreground/30 text-primary-foreground px-7 py-3.5 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-primary-foreground/10 active:scale-[0.98]"
                >
                  اطلب عرضاً توضيحياً
                </a>
              </div>

              <div className="flex justify-center">
                <span className="flex items-center gap-2 text-sm text-primary-foreground/60">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  الرياض، السعودية
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

