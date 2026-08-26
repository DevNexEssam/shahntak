import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HiSparkles, HiArrowLeft, HiPlay } from 'react-icons/hi';
import { HiCheckBadge } from 'react-icons/hi2';

export const Hero: React.FC = () => {
    return (
        <section className="hero-glow relative overflow-hidden">
            <div className="mx-auto max-w-[1200px] px-5 pb-16 pt-16 md:pb-24 md:pt-24">
                <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
                    
                    {/* Right Column - Content (RTL) */}
                    <div className="text-right">
                        {/* Badge */}
                        <span className="inline-flex items-center gap-2 rounded-[100px] bg-accent-soft px-4 py-2 text-sm font-semibold text-accent">
                            <HiSparkles className="size-4" />
                            <span>منصة سعودية لشركات الشحن والتوصيل</span>
                        </span>

                        {/* Heading */}
                        <h1 className="mt-5 text-[40px] font-extrabold leading-[1.2] text-heading md:text-[58px]">
                            أدر شركة الشحن بالكامل
                            <br />
                            من <span className="text-accent">لوحة تحكم واحدة</span>
                        </h1>

                        {/* Description */}
                        <p className="mt-5 max-w-[540px] text-[17px] leading-[30px] text-muted-foreground">
                            شحنتك تمنح كل شركة شحن حسابها الخاص لإدارة الطلبات والسائقين والفروع، مع تتبع لحظي للشحنات وفوترة تلقائية بالريال السعودي.
                        </p>

                        {/* CTA Buttons */}
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Link
                                href="#"
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors rounded-[100px] bg-accent text-accent-foreground shadow-accent hover:bg-accent/90 h-14 px-9 text-base"
                            >
                                <span>ابدأ الآن مجاناً</span>
                                <HiArrowLeft className="size-5" />
                            </Link>

                            <Link
                                href="#"
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors rounded-[100px] border border-border bg-background text-heading hover:border-accent hover:text-accent h-14 px-9 text-base"
                            >
                                <HiPlay className="size-5" />
                                <span>شاهد العرض التوضيحي</span>
                            </Link>
                        </div>

                        {/* Features List */}
                        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-green-500"></span>
                                تجربة مجانية ١٤ يوم
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-yellow-600"></span>
                                بدون بطاقة ائتمانية
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-accent"></span>
                                دعم فني بالعربية
                            </span>
                        </div>
                    </div>

                    {/* Left Column - Image (Order first for RTL) */}
                    <div className="relative order-first lg:order-last">
                        {/* Glow Effect */}
                        <div className="absolute -inset-6 -z-10 rounded-[50px] bg-accent-soft/70 blur-2xl"></div>
                        
                        {/* Dashboard Image */}
                        <Image
                            src="/dashboard-mockup-B1-EGE9S.png"
                            alt="لوحة تحكم شحنتك لإدارة الطلبات وتتبع الشحنات"
                            width={1200}
                            height={912}
                            className="w-full rounded-[30px]"
                            priority
                        />
                    </div>

                </div>
            </div>
        </section>
    );
};