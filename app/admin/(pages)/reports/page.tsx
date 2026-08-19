import React from 'react';
import { FaDownload } from 'react-icons/fa6';

export default function ReportsPage() {
    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading">التقارير التحليلية والنمو</h1>
                    <p className="text-sm text-body mt-0.5">مؤشرات الأداء الرئيسية (KPIs) لنمو العمليات وتوزيع الشحنات عبر المملكة.</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-xs">
                    <FaDownload className="w-4 h-4" />
                    <span>توليد تقرير شهري كامل</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-extrabold text-heading">معدل التوصيل في الوقت المحدد (SLA)</h2>
                        <span className="text-success font-bold text-xs bg-success-soft px-2.5 py-1 rounded-full">٩٨.٢٪ متوسط المنصة</span>
                    </div>
                    <div className="h-44 bg-surface-muted/50 rounded-xl flex items-center justify-center text-body text-xs">
                        [رسم بياني يوضح معدلات الالتزام الزمني لكل شركة شحن]
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-extrabold text-heading">نمو الاشتراكات الشهرية (MRR)</h2>
                        <span className="text-accent font-bold text-xs bg-accent-soft px-2.5 py-1 rounded-full">+١٨.٤٪ هذا الربع</span>
                    </div>
                    <div className="h-44 bg-surface-muted/50 rounded-xl flex items-center justify-center text-body text-xs">
                        [رسم بياني يوضح منحنى نمو الإيرادات المتكررة]
                    </div>
                </div>
            </div>

        </div>
    );
}