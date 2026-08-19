import React from 'react';
import { FaStar } from 'react-icons/fa6';

const testimonialsData = [
    {
        quote: 'قللنا وقت تجهيز الطلبات إلى النصف، وصار عندنا رؤية واضحة على كل فرع من فروعنا الخمسة.',
        name: 'سلطان العتيبي',
        role: 'مدير عمليات — الرياض السريع',
        letter: 'س',
        letterBg: 'bg-accent text-white',
    },
    {
        quote: 'عملاؤنا صاروا يتابعون شحناتهم بأنفسهم أول بأول، وقل عدد الاتصالات على خدمة العملاء بشكل ملحوظ.',
        name: 'نورة القحطاني',
        role: 'الشريك المؤسس — درب الشرق',
        letter: 'ن',
        letterBg: 'bg-warning text-heading',
    },
    {
        quote: 'الفوترة التلقائية وحدها وفرت علينا موظف كامل. الانتقال إلى شَحنتك كان من أفضل قراراتنا هالسنة.',
        name: 'محمد الحربي',
        role: 'المدير التنفيذي — نجم للنقل',
        letter: 'م',
        letterBg: 'bg-success text-heading',
    },
];

export const Testimonials: React.FC = () => {
    return (
        <section className="py-[100px] bg-surface-muted" id="testimonials">
            <div className="max-w-[1240px] mx-auto px-6">

                <div className="max-w-[640px] mx-auto text-center mb-14">
                    <span className="text-accent font-extrabold text-[13.5px] tracking-[0.5px] mb-3.5 block">
                        آراء العملاء
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-[-0.4px] mb-3.5">
                        شركات شحن حقيقية، نتائج حقيقية
                    </h2>
                    <p className="text-[16.5px] text-body">
                        هذا ما تقوله شركات الشحن التي تدير عملياتها اليوم عبر شَحنتك.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
                    {testimonialsData.map((item, index) => (
                        <div key={index} className="bg-surface border border-border rounded-[20px] p-7">
                            <div className="flex gap-1 mb-4 text-warning">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <p className="text-[15px] text-heading mb-[22px] leading-[1.8]">
                                &quot;{item.quote}&quot;
                            </p>
                            <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-[15px] shrink-0 ${item.letterBg}`}>
                                    {item.letter}
                                </div>
                                <div>
                                    <b className="block text-[14.5px] text-heading">{item.name}</b>
                                    <span className="text-[12.5px] text-body">{item.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};