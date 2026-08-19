import React from 'react';
import { FaVectorSquare } from 'react-icons/fa6';
import {
    LuBuilding2,
    LuPlus,
    LuSearch,
    LuFilter,
    LuExternalLink,
    LuUsers,
    LuTruck,
    LuShieldCheck
} from 'react-icons/lu';

const companiesList = [
    {
        id: 'CMP-101',
        name: 'شركة الرياض السريع',
        domain: 'riyadh-express.shahnetak.sa',
        owner: 'سلطان العتيبي',
        plan: 'المؤسسات',
        branchesCount: 14,
        driversCount: 89,
        ordersToday: '٣٬٤٢٠',
        status: 'active',
        joinedDate: '١٥ يناير ٢٠٢٥',
    },
    {
        id: 'CMP-102',
        name: 'درب الشرق للنقل',
        domain: 'darb-alsharq.shahnetak.sa',
        owner: 'نورة القحطاني',
        plan: 'النمو',
        branchesCount: 6,
        driversCount: 42,
        ordersToday: '١٬٨٩٠',
        status: 'active',
        joinedDate: '٠٢ فبراير ٢٠٢٥',
    },
    {
        id: 'CMP-103',
        name: 'توصيل بلس اللوجستية',
        domain: 'tawseel-plus.shahnetak.sa',
        owner: 'عبدالعزيز الدوسري',
        plan: 'البداية',
        branchesCount: 1,
        driversCount: 5,
        ordersToday: '٢٨٠',
        status: 'warning',
        joinedDate: '١٨ مارس ٢٠٢٥',
    },
    {
        id: 'CMP-104',
        name: 'نجم للنقل والتوزيع',
        domain: 'najm-cargo.shahnetak.sa',
        owner: 'محمد الحربي',
        plan: 'النمو',
        branchesCount: 8,
        driversCount: 54,
        ordersToday: '١٬١٤٠',
        status: 'active',
        joinedDate: '١٠ أبريل ٢٠٢٥',
    },
    {
        id: 'CMP-105',
        name: 'أفق الحجاز للشحن',
        domain: 'hejaz-horizon.shahnetak.sa',
        owner: 'خالد الغامدي',
        plan: 'البداية',
        branchesCount: 1,
        driversCount: 0,
        ordersToday: '٠',
        status: 'pending',
        joinedDate: 'اليوم',
    },
];

export default function CompaniesPage() {
    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading">إدارة الشركات المشتركة</h1>
                    <p className="text-sm text-body mt-0.5">متابعة حسابات المستأجرين (Tenants)، الخطط، وصلاحيات كل شركة شحن.</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:shadow-md hover:shadow-accent/20 transition-all">
                    <LuPlus className="w-4 h-4" />
                    <span>تسجيل شركة شحن جديدة</span>
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        placeholder="بحث بالاسم، النطاق الفرعي، أو المالك..."
                        className="w-full pl-4 pr-10 py-2 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-heading hover:bg-surface-muted transition-colors">
                        <LuFilter className="w-3.5 h-3.5 text-body" />
                        <span>تصفية حسب الخطة</span>
                    </button>
                    <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-heading hover:bg-surface-muted transition-colors">
                        <span>الحالة: الكل</span>
                    </button>
                </div>
            </div>

            {/* Companies Table */}
            <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-surface-muted/50 border-b border-border text-xs text-body font-bold">
                            <tr>
                                <th className="py-3.5 px-5">معلومات الشركة</th>
                                <th className="py-3.5 px-4">المالك</th>
                                <th className="py-3.5 px-4">الخطة الحالية</th>
                                <th className="py-3.5 px-4">الفروع والسائقين</th>
                                <th className="py-3.5 px-4">شحنات اليوم</th>
                                <th className="py-3.5 px-4">الحالة</th>
                                <th className="py-3.5 px-5 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {companiesList.map((company) => (
                                <tr key={company.id} className="hover:bg-surface-muted/40 transition-colors">
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center font-bold shrink-0">
                                                <LuBuilding2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="font-extrabold text-heading block">{company.name}</span>
                                                <span className="text-xs text-body font-latin flex items-center gap-1 dir-ltr text-right">
                                                    {company.domain}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 font-semibold text-heading text-xs">
                                        {company.owner}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="inline-block px-2.5 py-1 rounded-lg bg-surface-muted border border-border text-xs font-bold text-heading">
                                            {company.plan}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-xs font-latin">
                                        <span className="inline-flex items-center gap-1 font-bold text-heading">
                                            <LuBuilding2 className="w-3.5 h-3.5 text-body" /> {company.branchesCount}
                                        </span>
                                        <span className="mx-2 text-border">|</span>
                                        <span className="inline-flex items-center gap-1 font-bold text-heading">
                                            <LuTruck className="w-3.5 h-3.5 text-body" /> {company.driversCount}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 font-latin font-bold text-heading">
                                        {company.ordersToday}
                                    </td>
                                    <td className="py-4 px-4">
                                        {company.status === 'active' && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-success-soft text-success">
                                                <span className="w-1.5 h-1.5 rounded-full bg-success" /> نشط
                                            </span>
                                        )}
                                        {company.status === 'warning' && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-warning-soft text-warning">
                                                تجاوز الباقة
                                            </span>
                                        )}
                                        {company.status === 'pending' && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface-muted text-body border border-border">
                                                قيد المراجعة
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button title="الدخول للوحة الشركة" className="p-1.5 rounded-lg hover:bg-surface-muted text-body hover:text-heading transition-colors">
                                                <LuExternalLink className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 rounded-lg hover:bg-surface-muted text-body hover:text-heading transition-colors">
                                                <FaVectorSquare className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}