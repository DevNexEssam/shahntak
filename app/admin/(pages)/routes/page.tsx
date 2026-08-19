import React from 'react';
import {
    LuRoute,
    LuTruck,
    LuLayers,
    LuMapPin,
    LuRadio,
} from 'react-icons/lu';

const carrierIntegrations = [
    { name: 'سمسا إكسبريس (SMSA)', apiStatus: 'online', latency: '42ms', activeShipments: '٢٬١٤٠' },
    { name: 'أرامكس (Aramex)', apiStatus: 'online', latency: '68ms', activeShipments: '١٬٨٩٠' },
    { name: 'ناقل للخدمات اللوجستية', apiStatus: 'online', latency: '54ms', activeShipments: '٩٢٠' },
    { name: 'سبل | البريد السعودي', apiStatus: 'degraded', latency: '240ms', activeShipments: '٦١٠' },
];

export default function RoutesPage() {
    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-heading">المسارات، شركات النقل الخارجية، والأسطول</h1>
                <p className="text-sm text-body mt-0.5">إدارة خطوط الشحن بين المدن وربط شركات التوصيل الوسيطة (3PL).</p>
            </div>

            {/* 3PL Carriers Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {carrierIntegrations.map((carrier, idx) => (
                    <div key={idx} className="bg-surface p-5 rounded-2xl border border-border shadow-xs">
                        <div className="flex items-center justify-between mb-3">
                            <span className="w-9 h-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                                <LuTruck className="w-5 h-5" />
                            </span>
                            {carrier.apiStatus === 'online' ? (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-success bg-success-soft px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-success" /> مستقر
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-warning bg-warning-soft px-2 py-0.5 rounded-full">
                                    بطء استجابة
                                </span>
                            )}
                        </div>
                        <h3 className="font-extrabold text-sm text-heading mb-1">{carrier.name}</h3>
                        <div className="flex justify-between items-center text-xs text-body font-latin">
                            <span>شحنات اليوم: <b className="text-heading">{carrier.activeShipments}</b></span>
                            <span>{carrier.latency}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Hub Routes */}
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs">
                <h2 className="text-base font-extrabold text-heading mb-1">أكثر خطوط التوزيع نشاطاً بالمملكة</h2>
                <p className="text-xs text-body mb-5">كثافة النقل وحركة الشاحنات بين المناطق الرئيسية.</p>

                <div className="space-y-3">
                    {[
                        { from: 'الرياض (المستودع الرئيسي)', to: 'جدة (فرع المروة)', load: '٩٤٪', trips: '١٨ رحلة/يوم' },
                        { from: 'الرياض (المستودع الرئيسي)', to: 'الدمام (فرع الخالدية)', load: '٨٢٪', trips: '١٢ رحلة/يوم' },
                        { from: 'جدة (المركز اللوجستي)', to: 'مكة المكرمة', load: '٦٥٪', trips: '٢٤ رحلة/يوم' },
                        { from: 'القصيم', to: 'الرياض', load: '٤٥٪', trips: '٨ رحلات/يوم' },
                    ].map((route, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-surface-muted/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <LuMapPin className="w-5 h-5 text-accent shrink-0" />
                                <div>
                                    <span className="font-extrabold text-sm text-heading block">
                                        {route.from} ← {route.to}
                                    </span>
                                    <span className="text-xs text-body">{route.trips}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-heading font-latin">حمولة الخط: {route.load}</span>
                                <div className="w-24 bg-surface rounded-full h-2 overflow-hidden border border-border">
                                    <div className="bg-accent h-full rounded-full" style={{ width: route.load.replace('٪', '%') }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}