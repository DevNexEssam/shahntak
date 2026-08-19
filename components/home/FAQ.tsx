import React from 'react';
import { HiPlus } from 'react-icons/hi2';

const faqData = [
    {
        q: 'هل بيانات شركتنا منفصلة عن بيانات الشركات الأخرى على المنصة؟',
        a: 'نعم بالكامل. كل شركة تحصل على مساحة عمل معزولة تماماً — الطلبات والفروع والسائقين والتقارير خاصة بشركتك فقط ولا تظهر لأي شركة أخرى مسجّلة على شَحنتك.',
        defaultOpen: true,
    },
    {
        q: 'هل يوجد تطبيق منفصل للسائقين؟',
        a: 'نعم، السائقون يستخدمون تطبيق جوال مستقل لاستلام المهام، تحديث حالة الشحنة، والتواصل مع الفرع مباشرة أثناء التوصيل.',
    },
    {
        q: 'هل ينفع نلغي الاشتراك أو نغيّر الخطة في أي وقت؟',
        a: 'أكيد. تقدر ترفع أو تنزّل خطتك، أو تلغي اشتراكك في أي وقت من إعدادات الحساب مباشرة، بدون فترات التزام طويلة.',
    },
    {
        q: 'هل شَحنتك يتكامل مع المتجر الإلكتروني بتاعنا؟',
        a: 'نعم، تقدر تربط شَحنتك بمنصات زي سلة وزد وووكومرس، بالإضافة لواجهة API مفتوحة و Webhooks لبناء تكامل مخصص مع أي نظام تستخدمه.',
    },
    {
        q: 'هل نحتاج فريق تقني عشان نبدأ استخدام المنصة؟',
        a: 'لا. لوحة التحكم مصممة عشان تبدأ بدون خبرة تقنية — تسجّل شركتك، تضيف فروعك وسائقيك، وتبدأ خلال دقائق. فريق الدعم متاح لو احتجت مساعدة.',
    },
];

export const Faq: React.FC = () => {
    return (
        <section className="py-[100px] bg-surface-muted" id="faq">
            <div className="max-w-[1240px] mx-auto px-6">

                <div className="max-w-[640px] mx-auto text-center mb-14">
                    <span className="text-accent font-extrabold text-[13.5px] tracking-[0.5px] mb-3.5 block">
                        الأسئلة الشائعة
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-[-0.4px] mb-3.5">
                        عندك سؤال؟ غالباً عندنا الإجابة
                    </h2>
                    <p className="text-[16.5px] text-body">
                        ما لقيت إجابتك هنا؟ تواصل مع فريقنا وبنرد عليك بسرعة.
                    </p>
                </div>

                <div className="max-w-[760px] mx-auto flex flex-col gap-3.5">
                    {faqData.map((faq, i) => (
                        <details
                            key={i}
                            open={faq.defaultOpen}
                            className="group bg-surface border border-border open:border-accent rounded-[18px] px-[26px] py-1.5 transition-colors"
                        >
                            <summary className="cursor-pointer flex items-center justify-between gap-4 py-5 font-bold text-base text-heading list-none [&::-webkit-details-marker]:hidden">
                                <span>{faq.q}</span>
                                <span className="w-7 h-7 rounded-full bg-surface-muted group-open:bg-accent group-open:text-white group-open:rotate-45 transition-all duration-300 flex items-center justify-center shrink-0">
                                    <HiPlus className="w-4 h-4" />
                                </span>
                            </summary>
                            <p className="text-[14.5px] text-body pb-[22px] -mt-1.5 max-w-[640px] leading-relaxed">
                                {faq.a}
                            </p>
                        </details>
                    ))}
                </div>

            </div>
        </section>
    );
};