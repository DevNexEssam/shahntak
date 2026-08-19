import React from 'react';
import Link from 'next/link';

export const FinalCta: React.FC = () => {
    return (
        <section className="py-[100px]">
            <div className="max-w-[1240px] mx-auto px-6">
                <div className="bg-accent rounded-[40px] p-10 sm:p-[80px_40px] text-center relative overflow-hidden">
                    {/* Decorative Backdrop Circles */}
                    <div className="absolute w-[500px] h-[500px] rounded-full bg-white/8 -top-[250px] -right-[150px] pointer-events-none" />
                    <div className="absolute w-[400px] h-[400px] rounded-full bg-white/6 -bottom-[220px] -left-[120px] pointer-events-none" />

                    <h2 className="text-white text-3xl sm:text-[38px] font-extrabold mb-4 relative z-10">
                        جاهز تنظّم شحنات شركتك؟
                    </h2>
                    <p className="text-white/80 text-[17px] max-w-[520px] mx-auto mb-[34px] relative z-10 leading-relaxed">
                        انضم إلى مئات شركات الشحن السعودية التي تدير عملياتها اليوم عبر شَحنتك — التسجيل مجاني ولا يحتاج بطاقة ائتمان.
                    </p>

                    <div className="flex flex-wrap justify-center gap-3.5 relative z-10">
                        <Link
                            href="#"
                            className="inline-flex items-center justify-center px-[30px] py-3.5 rounded-full bg-primary hover:bg-heading text-primary-foreground font-bold text-[15px] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.25)] transition-all"
                        >
                            ابدأ مجاناً الآن
                        </Link>
                        <Link
                            href="#"
                            className="inline-flex items-center justify-center px-[30px] py-3.5 rounded-full bg-transparent hover:bg-white/10 text-white border-[1.5px] border-white/40 font-bold text-[15px] transition-colors"
                        >
                            تحدث مع فريق المبيعات
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};