import React from 'react';
import { FaAngleRight } from 'react-icons/fa6';
import {
    LuBuilding2,
    LuPackageCheck,
    LuCircleDollarSign,
    LuTrendingUp,
    LuArrowUpRight,
    LuUsers,
} from 'react-icons/lu';

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">

            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading">مركز العمليات الرئيسي</h1>
                    <p className="text-sm text-body mt-1">نظرة عامة لحظية على أداء جميع شركات الشحن المسجلة على منصة شحنتك.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-body bg-surface px-3 py-1.5 rounded-lg border border-border">
                        آخر تحديث: قبل دقيقة واحدة
                    </span>
                </div>
            </div>

            {/* Core Platform Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                {/* Total Companies */}
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <span className="w-12 h-12 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                            <LuBuilding2 className="w-6 h-6" />
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success-soft px-2 py-0.5 rounded-full">
                            <LuTrendingUp className="w-3 h-3" /> +١٢٪
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-body block mb-1">الشركات المسجلة</span>
                    <b className="font-latin text-2xl sm:text-3xl font-extrabold text-heading">٢٤ شركة</b>
                </div>

                {/* Total Shipments Today */}
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <span className="w-12 h-12 rounded-xl bg-warning-soft text-warning flex items-center justify-center">
                            <LuPackageCheck className="w-6 h-6" />
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success-soft px-2 py-0.5 rounded-full">
                            <LuTrendingUp className="w-3 h-3" /> +٢٨٪
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-body block mb-1">شحنات اليوم (جميع الشركات)</span>
                    <b className="font-latin text-2xl sm:text-3xl font-extrabold text-heading">١٤٬٨٩٠</b>
                </div>

                {/* Platform Monthly Revenue */}
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <span className="w-12 h-12 rounded-xl bg-success-soft text-success flex items-center justify-center">
                            <LuCircleDollarSign className="w-6 h-6" />
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success-soft px-2 py-0.5 rounded-full">
                            <LuTrendingUp className="w-3 h-3" /> +١٥٪
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-body block mb-1">عوائد الاشتراكات (شهرياً)</span>
                    <b className="font-latin text-2xl sm:text-3xl font-extrabold text-heading">١٤٨٬٢٠٠ <span className="text-xs font-normal">ر.س</span></b>
                </div>

                {/* Active Drivers Platform-wide */}
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <span className="w-12 h-12 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                            <LuUsers className="w-6 h-6" />
                        </span>
                        <span className="text-xs font-bold text-body bg-surface-muted px-2 py-0.5 rounded-full border border-border">
                            متصل الآن
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-body block mb-1">إجمالي السائقين النشطين</span>
                    <b className="font-latin text-2xl sm:text-3xl font-extrabold text-heading">٩٤٢ سائق</b>
                </div>

            </div>

            {/* Main Grid: Companies Activity & System Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Companies Performance Table (2 cols) */}
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-extrabold text-heading">أعلى شركات الشحن نشاطاً</h2>
                            <p className="text-xs text-body mt-0.5">ترتيب الشركات حسب عدد الشحنات اليومية واستخدام الباقة.</p>
                        </div>
                        <button className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1">
                            عرض كل الشركات <LuArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead>
                                <tr className="border-b border-border text-body text-xs">
                                    <th className="pb-3 font-bold">الشركة</th>
                                    <th className="pb-3 font-bold">الخطة</th>
                                    <th className="pb-3 font-bold">شحنات اليوم</th>
                                    <th className="pb-3 font-bold">استهلاك الخطة</th>
                                    <th className="pb-3 font-bold">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {[
                                    { name: 'شركة الرياض السريع', plan: 'المؤسسات', shipments: '٣٬٤٢٠', usage: '٧٥٪', status: 'نشط' },
                                    { name: 'درب الشرق للنقل', plan: 'النمو', shipments: '١٬٨٩٠', usage: '٩٢٪', status: 'نشط' },
                                    { name: 'نجم للنقل والتوزيع', plan: 'النمو', shipments: '١٬١٤٠', usage: '٥٤٪', status: 'نشط' },
                                    { name: 'توصيل بلس اللوجستية', plan: 'البداية', shipments: '٢٨٠', usage: '٩٨٪', status: 'تنبيه تجاوز' },
                                    { name: 'مسار إكسبريس', plan: 'المؤسسات', shipments: '٤٬١٠٠', usage: '٤٠٪', status: 'نشط' },
                                ].map((co, idx) => (
                                    <tr key={idx} className="hover:bg-surface-muted/50 transition-colors">
                                        <td className="py-3.5 font-bold text-heading">{co.name}</td>
                                        <td className="py-3.5 text-xs text-body font-semibold">{co.plan}</td>
                                        <td className="py-3.5 font-latin font-bold text-heading">{co.shipments}</td>
                                        <td className="py-3.5">
                                            <div className="w-24 bg-surface-muted rounded-full h-2 overflow-hidden border border-border">
                                                <div
                                                    className={`h-full rounded-full ${co.usage === '٩٨٪' ? 'bg-warning' : 'bg-accent'}`}
                                                    style={{ width: '75%' }}
                                                />
                                            </div>
                                        </td>
                                        <td className="py-3.5">
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${co.status === 'نشط'
                                                    ? 'bg-success-soft text-success'
                                                    : 'bg-warning-soft text-warning'
                                                }`}>
                                                {co.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Operational Alerts & System Health (1 col) */}
                <div className="space-y-5">

                    {/* Action Required Card */}
                    <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs">
                        <div className="flex items-center gap-2 mb-4 text-heading">
                            <FaAngleRight className="w-5 h-5 text-warning" />
                            <h2 className="text-base font-extrabold">تنبيهات المنصة العاجلة</h2>
                        </div>

                        <div className="space-y-3.5">
                            <div className="p-3.5 rounded-xl bg-warning-soft/60 border border-warning/20">
                                <span className="block text-xs font-bold text-heading mb-1">طلب ترقية باقة</span>
                                <p className="text-xs text-body leading-relaxed">
                                    شركة &quot;توصيل بلس&quot; وصلت إلى ٩٨٪ من سعة خطة البداية وتطلب الترقية لخطة النمو.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-surface-muted border border-border">
                                <span className="block text-xs font-bold text-heading mb-1">تكامل API متوقف</span>
                                <p className="text-xs text-body leading-relaxed">
                                    فشل في استقبال Webhook من بوابة دفع تابعة لشركة &quot;درب الشرق&quot;.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-accent-soft/40 border border-accent/20">
                                <span className="block text-xs font-bold text-heading mb-1">طلب تسجيل شركة جديدة</span>
                                <p className="text-xs text-body leading-relaxed">
                                    شركة &quot;أفق الحجاز للشحن&quot; بانتظار مراجعة السجل التجاري والتفعيل.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Platform Controls */}
                    <div className="bg-heading text-white rounded-2xl p-6 shadow-md">
                        <h3 className="font-extrabold text-sm mb-2 text-white">إجراءات سريعة للمنصة</h3>
                        <p className="text-xs text-white/60 mb-4">أدوات التحكم الشاملة للعمليات والبنية التحتية.</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-center transition-colors">
                                توليد فواتير الشهر
                            </button>
                            <button className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-center transition-colors">
                                تصدير تقرير شامل
                            </button>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}