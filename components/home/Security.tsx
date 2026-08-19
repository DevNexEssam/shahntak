import React from 'react';
import { LuShieldCheck, LuLayers, LuLock, LuRefreshCw, LuScale } from 'react-icons/lu';

export const Security: React.FC = () => {
    return (
        <section className="py-[100px]" id="security">
            <div className="max-w-[1240px] mx-auto px-6">
                <div className="bg-heading rounded-[40px] p-8 sm:p-[76px_40px] relative overflow-hidden">
                    {/* Radial Ambient Glow */}
                    <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(116,68,253,0.15),transparent_70%)] -top-[250px] -left-[150px] z-0" />

                    <div className="max-w-[1160px] mx-auto grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-[60px] items-center relative z-10">
                        <div>
                            <div className="w-16 h-16 rounded-[16px] bg-accent/20 text-[#b39bff] flex items-center justify-center mb-6">
                                <LuShieldCheck className="w-8 h-8" />
                            </div>
                            <h2 className="text-white text-3xl sm:text-[32px] font-extrabold mb-4 leading-snug">
                                بياناتك، وبيانات عملائك، محمية بالكامل
                            </h2>
                            <p className="text-white/60 text-[15.5px] max-w-[400px]">
                                كل شركة على شَحنتك تعمل في بيئة معزولة تماماً — بياناتك لا تختلط أبداً ببيانات أي شركة أخرى على المنصة.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
                            <div className="bg-white/5 border border-white/10 rounded-[18px] p-[22px]">
                                <span className="w-[38px] h-[38px] rounded-[10px] bg-white/10 text-white flex items-center justify-center mb-3.5">
                                    <LuLayers className="w-5 h-5" />
                                </span>
                                <b className="block text-white text-[15px] mb-1.5">عزل كامل لبيانات كل شركة</b>
                                <span className="text-white/55 text-[13.5px] leading-relaxed">مساحة عمل مستقلة لكل شركة شحن، بدون أي تداخل في الطلبات أو الفروع أو التقارير.</span>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-[18px] p-[22px]">
                                <span className="w-[38px] h-[38px] rounded-[10px] bg-white/10 text-white flex items-center justify-center mb-3.5">
                                    <LuLock className="w-5 h-5" />
                                </span>
                                <b className="block text-white text-[15px] mb-1.5">تشفير للبيانات</b>
                                <span className="text-white/55 text-[13.5px] leading-relaxed">تشفير أثناء النقل والتخزين، بما فيها بيانات العملاء ومعلومات الفواتير.</span>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-[18px] p-[22px]">
                                <span className="w-[38px] h-[38px] rounded-[10px] bg-white/10 text-white flex items-center justify-center mb-3.5">
                                    <LuRefreshCw className="w-5 h-5" />
                                </span>
                                <b className="block text-white text-[15px] mb-1.5">نسخ احتياطي يومي</b>
                                <span className="text-white/55 text-[13.5px] leading-relaxed">نسخ تلقائية لبياناتك يومياً مع إمكانية الاسترجاع الفوري عند الحاجة.</span>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-[18px] p-[22px]">
                                <span className="w-[38px] h-[38px] rounded-[10px] bg-white/10 text-white flex items-center justify-center mb-3.5">
                                    <LuScale className="w-5 h-5" />
                                </span>
                                <b className="block text-white text-[15px] mb-1.5">متوافقة مع الأنظمة السعودية</b>
                                <span className="text-white/55 text-[13.5px] leading-relaxed">ضوابط تتماشى مع نظام حماية البيانات الشخصية (PDPL) المعمول به في المملكة.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};