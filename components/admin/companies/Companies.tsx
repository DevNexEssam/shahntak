'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    LuBuilding2,
    LuPlus,
    LuSearch,
    LuFilter,
    LuExternalLink,
    LuTruck,
    LuGitFork,
    LuPackageCheck,
    LuShieldAlert,
    LuLayoutGrid,
    LuTable,
    LuPencil
} from 'react-icons/lu';
import { FaMonero } from 'react-icons/fa6';
import AddCompanies from './AddCompanies';
import EditCompanies from './EditCompanies';

interface Company {
    id: string;
    name: string;
    domain: string;
    owner: string;
    phone: string;
    plan: 'البداية' | 'النمو' | 'المؤسسات';
    branches: number;
    drivers: number;
    ordersToday: string;
    quotaUsedPercent: number;
    status: 'active' | 'quota_warning' | 'pending';
    joinedDate: string;
}

const companiesData: Company[] = [
    {
        id: 'CMP-101',
        name: 'شركة الرياض السريع',
        domain: 'riyadh-express.shahnetak.sa',
        owner: 'سلطان العتيبي',
        phone: '0501234567',
        plan: 'المؤسسات',
        branches: 14,
        drivers: 89,
        ordersToday: '٣٬٤٢٠',
        quotaUsedPercent: 68,
        status: 'active',
        joinedDate: '١٥ يناير ٢٠٢٥',
    },
    {
        id: 'CMP-102',
        name: 'درب الشرق للنقل',
        domain: 'darb-alsharq.shahnetak.sa',
        owner: 'نورة القحطاني',
        phone: '0559876543',
        plan: 'النمو',
        branches: 6,
        drivers: 42,
        ordersToday: '١٬٨٩٠',
        quotaUsedPercent: 88,
        status: 'active',
        joinedDate: '٠٢ فبراير ٢٠٢٥',
    },
    {
        id: 'CMP-103',
        name: 'توصيل بلس اللوجستية',
        domain: 'tawseel-plus.shahnetak.sa',
        owner: 'عبدالعزيز الدوسري',
        phone: '0541122334',
        plan: 'البداية',
        branches: 1,
        drivers: 5,
        ordersToday: '٢٩٥',
        quotaUsedPercent: 98,
        status: 'quota_warning',
        joinedDate: '١٨ مارس ٢٠٢٥',
    },
    {
        id: 'CMP-104',
        name: 'نجم للنقل والتوزيع',
        domain: 'najm-cargo.shahnetak.sa',
        owner: 'محمد الحربي',
        phone: '0567788990',
        plan: 'النمو',
        branches: 8,
        drivers: 54,
        ordersToday: '١٬١٤٠',
        quotaUsedPercent: 54,
        status: 'active',
        joinedDate: '١٠ أبريل ٢٠٢٥',
    },
    {
        id: 'CMP-105',
        name: 'أفق الحجاز للشحن',
        domain: 'hejaz-horizon.shahnetak.sa',
        owner: 'خالد الغامدي',
        phone: '0533344556',
        plan: 'البداية',
        branches: 1,
        drivers: 0,
        ordersToday: '٠',
        quotaUsedPercent: 0,
        status: 'pending',
        joinedDate: 'اليوم',
    },
];

export default function Companies() {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading">الشركات المشتركة (Tenants)</h1>
                    <p className="text-sm text-body mt-0.5">متابعة حسابات شركات الشحن، رصد استهلاك الباقات، وإدارة الوصول المباشر.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="bg-surface border border-border p-1 rounded-xl flex items-center gap-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg text-xs font-bold transition-colors ${viewMode === 'grid' ? 'bg-heading text-white' : 'text-body hover:text-heading'}`}
                            title="عرض البطاقات"
                        >
                            <LuLayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg text-xs font-bold transition-colors ${viewMode === 'table' ? 'bg-heading text-white' : 'text-body hover:text-heading'}`}
                            title="عرض الجدول المدمج"
                        >
                            <LuTable className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>تسجيل شركة شحن</span>
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        placeholder="بحث باسم الشركة، المالك، أو النطاق..."
                        className="w-full pl-4 pr-10 py-2 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-heading hover:bg-surface-muted transition-colors">
                        <LuFilter className="w-3.5 h-3.5 text-body" />
                        <span>الخطة: الكل</span>
                    </button>
                    <span className="text-xs font-bold text-body bg-surface-muted px-3 py-2 rounded-xl border border-border">
                        إجمالي: {companiesData.length} شركة
                    </span>
                </div>
            </div>

            {/* VIEW 1: Grid Cards (Recommended) */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {companiesData.map((company) => (
                        <div
                            key={company.id}
                            className="bg-surface rounded-2xl border border-border hover:border-accent/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                        >
                            <div className="p-5 space-y-4">

                                {/* Card Top: Logo & Basic Info */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-accent-soft text-accent font-extrabold text-lg flex items-center justify-center shrink-0">
                                            {company.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-base text-heading leading-tight">{company.name}</h3>
                                            <span className="text-xs text-body font-latin block mt-0.5" dir="ltr">
                                                {company.domain}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Plan Badge */}
                                    <span className="px-2.5 py-1 rounded-lg bg-surface-muted border border-border text-xs font-bold text-heading shrink-0">
                                        {company.plan}
                                    </span>
                                </div>

                                {/* Quota Progress Bar */}
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-body">استهلاك باقة الشهر</span>
                                        <span className={`font-latin font-bold ${company.quotaUsedPercent >= 90 ? 'text-warning' : 'text-heading'
                                            }`}>
                                            ٪{company.quotaUsedPercent}
                                        </span>
                                    </div>
                                    <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden border border-border">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${company.quotaUsedPercent >= 90
                                                    ? 'bg-warning'
                                                    : 'bg-accent'
                                                }`}
                                            style={{ width: `${company.quotaUsedPercent}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Operations Counters */}
                                <div className="grid grid-cols-3 gap-2 py-2 border-y border-border text-center bg-surface-muted/30 rounded-xl p-2">
                                    <div>
                                        <span className="text-[11px] text-body block">الفروع</span>
                                        <b className="font-latin text-sm font-extrabold text-heading">{company.branches}</b>
                                    </div>
                                    <div className="border-x border-border">
                                        <span className="text-[11px] text-body block">السائقين</span>
                                        <b className="font-latin text-sm font-extrabold text-heading">{company.drivers}</b>
                                    </div>
                                    <div>
                                        <span className="text-[11px] text-body block">شحنات اليوم</span>
                                        <b className="font-latin text-sm font-extrabold text-accent">{company.ordersToday}</b>
                                    </div>
                                </div>

                                {/* Owner & Status Row */}
                                <div className="flex items-center justify-between text-xs pt-1">
                                    <div className="text-body">
                                        <span>المالك: </span>
                                        <b className="text-heading">{company.owner}</b>
                                    </div>

                                    {company.status === 'active' && (
                                        <span className="inline-flex items-center gap-1.5 font-bold text-success text-[11px] bg-success-soft px-2.5 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                            نشط
                                        </span>
                                    )}
                                    {company.status === 'quota_warning' && (
                                        <span className="inline-flex items-center gap-1 font-bold text-warning text-[11px] bg-warning-soft px-2.5 py-0.5 rounded-full">
                                            <LuShieldAlert className="w-3 h-3" />
                                            تجاوز الباقة
                                        </span>
                                    )}
                                    {company.status === 'pending' && (
                                        <span className="inline-flex items-center gap-1 font-bold text-body text-[11px] bg-surface-muted px-2.5 py-0.5 rounded-full border border-border">
                                            قيد المراجعة
                                        </span>
                                    )}
                                </div>

                            </div>

                            {/* Card Footer: Quick Impersonate & Actions */}
                            <div className="px-5 py-3 bg-surface-muted border-t border-border flex items-center justify-between gap-3">
                                <button
                                    title="تسجيل الدخول إلى لوحة تحكم الشركة مباشرة"
                                    className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-surface hover:bg-heading hover:text-white border border-border text-heading text-xs font-bold transition-colors"
                                >
                                    <span>دخول لوحة الشركة</span>
                                    <LuExternalLink className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedCompany(company);
                                        setIsEditModalOpen(true);
                                    }}
                                    title="تعديل بيانات الشركة"
                                    className="p-2 rounded-xl hover:bg-surface border border-transparent hover:border-border text-body hover:text-heading transition-colors cursor-pointer"
                                >
                                    <LuPencil className="w-4 h-4" />
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* VIEW 2: Clean High-Density Table */}
            {viewMode === 'table' && (
                <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-surface-muted/60 border-b border-border text-xs text-body font-bold">
                                <tr>
                                    <th className="py-3.5 px-5">الشركة</th>
                                    <th className="py-3.5 px-4">المالك والاتصال</th>
                                    <th className="py-3.5 px-4">الخطة</th>
                                    <th className="py-3.5 px-4">الأسطول</th>
                                    <th className="py-3.5 px-4">استهلاك الباقة</th>
                                    <th className="py-3.5 px-4">الحالة</th>
                                    <th className="py-3.5 px-5 text-center">إجراء سريع</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {companiesData.map((company) => (
                                    <tr key={company.id} className="hover:bg-surface-muted/30 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent font-bold flex items-center justify-center shrink-0">
                                                    {company.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <b className="text-heading block">{company.name}</b>
                                                    <span className="text-xs text-body font-latin block" dir="ltr">{company.domain}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-xs">
                                            <b className="text-heading block">{company.owner}</b>
                                            <span className="text-body font-latin">{company.phone}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-2.5 py-1 rounded-lg bg-surface-muted border border-border text-xs font-bold text-heading">
                                                {company.plan}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-xs font-latin">
                                            <span className="font-bold text-heading">{company.branches} فروع</span> · <span className="text-body">{company.drivers} سائق</span>
                                        </td>
                                        <td className="py-4 px-4 w-44">
                                            <div className="flex items-center justify-between text-[11px] mb-1 font-latin">
                                                <span className="text-body font-arabic">شحنات: {company.ordersToday}</span>
                                                <b className={company.quotaUsedPercent >= 90 ? 'text-warning' : 'text-heading'}>٪{company.quotaUsedPercent}</b>
                                            </div>
                                            <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden border border-border">
                                                <div
                                                    className={`h-full ${company.quotaUsedPercent >= 90 ? 'bg-warning' : 'bg-accent'}`}
                                                    style={{ width: `${company.quotaUsedPercent}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {company.status === 'active' && (
                                                <span className="text-[11px] font-bold text-success bg-success-soft px-2.5 py-1 rounded-full">نشط</span>
                                            )}
                                            {company.status === 'quota_warning' && (
                                                <span className="text-[11px] font-bold text-warning bg-warning-soft px-2.5 py-1 rounded-full">تجاوز الباقة</span>
                                            )}
                                            {company.status === 'pending' && (
                                                <span className="text-[11px] font-bold text-body bg-surface-muted border border-border px-2.5 py-1 rounded-full">قيد المراجعة</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCompany(company);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    title="تعديل"
                                                    className="p-1.5 rounded-lg bg-surface border border-border hover:bg-heading hover:text-white text-xs font-bold transition-colors cursor-pointer"
                                                >
                                                    <LuPencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-heading hover:text-white text-xs font-bold transition-colors cursor-pointer">
                                                    <span>دخول</span>
                                                    <LuExternalLink className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Add Companies */}
            <AddCompanies isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

            {/* Modal Edit Companies */}
            <EditCompanies
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCompany(null);
                }}
                companyData={selectedCompany}
            />

        </div>
    );
}