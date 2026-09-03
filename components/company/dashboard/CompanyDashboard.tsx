"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCompanyOrders } from '@/hooks/company/useCompanyOrder';
import { useCompanyShipments } from '@/hooks/company/useCompanyShipment';
import { useCompanyInvoices } from '@/hooks/company/useCompanyInvoice';
import { useCompanyEmployees } from '@/hooks/company/useCompanyEmployee';
import {
    LuPackage,
    LuTruck,
    LuReceipt,
    LuUsers,
    LuPlus,
    LuArrowUpRight,
    LuTrendingUp,
    LuClock,
    LuCheck,
    LuCrown,
    LuMapPin,
    LuLayers,
    LuSettings
} from 'react-icons/lu';

export default function CompanyDashboard() {
    const { data: session } = useSession();
    const companyName = session?.user?.name || 'الشركة المشتركة';

    // Live Queries from Custom React Query Hooks
    const { data: ordersData } = useCompanyOrders(1, 5, '');
    const { data: shipmentsData } = useCompanyShipments(1, 5, '');
    const { data: invoicesData } = useCompanyInvoices(1, 5, '');
    const { data: employeesData } = useCompanyEmployees(1, 5, '');

    const recentOrders = ordersData?.data || [];
    const ordersStats = ordersData?.stats || { total: ordersData?.pagination?.totalRecords || 0, pending: 0, shipped: 0, delivered: 0 };
    const shipmentsStats = shipmentsData?.stats || { total: shipmentsData?.pagination?.totalRecords || 0, in_transit: 0, delivered: 0 };
    const invoicesStats = invoicesData?.stats || { total: invoicesData?.pagination?.totalRecords || 0, paid: 0, issued: 0 };
    const employeesStats = employeesData?.stats || { total: employeesData?.pagination?.totalRecords || 0, active: 0 };

    const statusBadge = (status?: string) => {
        switch (status) {
            case 'pending':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">قيد الانتظار</span>;
            case 'shipped':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">تم الشحن</span>;
            case 'delivered':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">تم التوصيل</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 border border-slate-500/20">{status || 'جديد'}</span>;
        }
    };

    return (
        <div className="space-y-8 text-right font-arabic" dir="rtl">

            {/* Operational Hero & Header */}
            <div className="bg-gradient-to-r from-heading via-heading/95 to-accent-dark/90 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white/90 mb-3 border border-white/15">
                            <LuCrown className="w-3.5 h-3.5 text-amber-400" />
                            <span>حساب شركة شحن موثق</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                            أهلاً بك، {companyName} 👋
                        </h1>
                        <p className="text-sm text-white/70 mt-1.5 max-w-xl leading-relaxed">
                            مركز العمليات اللوجستية المباشر. مراقبة الطلبات والشحنات المعزولة بحساب شركتك وإدارة الموظفين والفواتير.
                        </p>
                    </div>

                    {/* Fast Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/company/dashboard/orders"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                            <LuPlus className="w-4 h-4" />
                            <span>إضافة طلب جديد</span>
                        </Link>

                        <Link
                            href="/company/dashboard/shipments"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                        >
                            <LuLayers className="w-4 h-4" />
                            <span>إدارة الشحنات</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Core KPI Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                {/* Total Orders Card */}
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs hover:border-accent/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
                            <LuPackage className="w-6 h-6" />
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <LuTrendingUp className="w-3 h-3" /> نشط
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-body block mb-1">إجمالي طلبات الشركة</span>
                    <b className="font-latin text-2xl sm:text-3xl font-extrabold text-heading">{ordersStats.total}</b>
                    <p className="text-[11px] text-body mt-2 flex items-center gap-1">
                        <LuClock className="w-3 h-3 text-amber-500" />
                        <span>قيد الانتظار: {ordersStats.pending}</span>
                    </p>
                </div>

                {/* Active Shipments Card */}
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs hover:border-accent/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                            <LuTruck className="w-6 h-6" />
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                            ترانزيت
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-body block mb-1">الشحنات في الطريق</span>
                    <b className="font-latin text-2xl sm:text-3xl font-extrabold text-heading">{shipmentsStats.in_transit || 0}</b>
                    <p className="text-[11px] text-body mt-2 flex items-center gap-1">
                        <LuCheck className="w-3 h-3 text-emerald-500" />
                        <span>إجمالي الشحنات: {shipmentsStats.total}</span>
                    </p>
                </div>

                {/* Invoices Card */}
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs hover:border-accent/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <LuReceipt className="w-6 h-6" />
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            محصلة
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-body block mb-1">الفواتير المحصلة</span>
                    <b className="font-latin text-2xl sm:text-3xl font-extrabold text-heading">{invoicesStats.paid || 0}</b>
                    <p className="text-[11px] text-body mt-2 flex items-center gap-1">
                        <span>إجمالي الصادرة: {invoicesStats.total}</span>
                    </p>
                </div>

                {/* Team & Staff Card */}
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs hover:border-accent/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                            <LuUsers className="w-6 h-6" />
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                            فريق العمل
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-body block mb-1">الموظفين النشطين</span>
                    <b className="font-latin text-2xl sm:text-3xl font-extrabold text-heading">{employeesStats.active || employeesStats.total}</b>
                    <p className="text-[11px] text-body mt-2 flex items-center gap-1">
                        <span>حسابات مسجلة</span>
                    </p>
                </div>

            </div>

            {/* Main Content Grid: Recent Activity & Shortcuts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Orders Table (2 cols) */}
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-extrabold text-heading">أحدث طلبات الشركة</h2>
                            <p className="text-xs text-body mt-0.5">آخر الطلبات المسجلة في السيستم والمخصصة لشركتك</p>
                        </div>
                        <Link
                            href="/company/dashboard/orders"
                            className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
                        >
                            <span>عرض كل الطلبات</span>
                            <LuArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="p-8 text-center bg-surface-muted/50 rounded-xl border border-border">
                            <p className="text-xs text-body font-medium">لا توجد طلبات مسجلة حديثاً</p>
                            <Link
                                href="/company/dashboard/orders"
                                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-bold"
                            >
                                <LuPlus className="w-3.5 h-3.5" />
                                <span>إضافة أول طلب</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead>
                                    <tr className="border-b border-border text-body text-xs font-bold">
                                        <th className="pb-3 px-2">رقم الطلب</th>
                                        <th className="pb-3 px-2">المستلم والمدينة</th>
                                        <th className="pb-3 px-2">الوزن / طرود</th>
                                        <th className="pb-3 px-2">القيمة</th>
                                        <th className="pb-3 px-2">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border font-medium">
                                    {recentOrders.map((ord: any) => (
                                        <tr key={ord._id} className="hover:bg-surface-muted/40 transition-colors">
                                            <td className="py-3.5 px-2 font-latin font-bold text-accent">
                                                {ord.orderNumber}
                                            </td>
                                            <td className="py-3.5 px-2">
                                                <div>
                                                    <span className="font-bold text-heading block">{ord.recipientName}</span>
                                                    <span className="text-xs text-body flex items-center gap-1">
                                                        <LuMapPin className="w-3 h-3 text-accent" />
                                                        {ord.recipientCity}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-2 font-latin text-xs text-heading">
                                                {ord.weight} كجم
                                            </td>
                                            <td className="py-3.5 px-2 font-latin text-xs font-bold text-emerald-600">
                                                {ord.orderValue} ر.س
                                            </td>
                                            <td className="py-3.5 px-2">
                                                {statusBadge(ord.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right Column: Subscription Quota & Quick Shortcuts (1 col) */}
                <div className="space-y-6">

                    {/* Subscription Quota Card */}
                    <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                                    <LuCrown className="w-4 h-4" />
                                </span>
                                <h3 className="text-sm font-extrabold text-heading">باقة الشركة النشطة</h3>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-accent-soft text-accent text-[11px] font-bold">
                                الباقة الاحترافية
                            </span>
                        </div>

                        <div className="space-y-3 pt-1">
                            <div>
                                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                    <span className="text-body">استهلاك الطلبات الشهري</span>
                                    <span className="text-heading font-latin">{ordersStats.total} / 1,000</span>
                                </div>
                                <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden border border-border">
                                    <div
                                        className="h-full rounded-full bg-accent transition-all duration-500"
                                        style={{ width: `${Math.min((ordersStats.total / 1000) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/company/dashboard/settings"
                            className="w-full py-2.5 rounded-xl border border-border bg-surface-muted hover:bg-surface text-center font-bold text-xs text-heading block transition-all cursor-pointer"
                        >
                            تفاصيل الاشتراك والترقية
                        </Link>
                    </div>

                    {/* Shortcuts Grid */}
                    <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                            <LuLayers className="w-4 h-4" />
                            الوصول السريع للأقسام
                        </h3>

                        <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
                            <Link
                                href="/company/dashboard/orders"
                                className="p-3 rounded-xl bg-surface-muted/60 hover:bg-accent-soft hover:text-accent border border-border transition-all flex items-center gap-2 text-heading"
                            >
                                <LuPackage className="w-4 h-4 text-accent" />
                                <span>الطلبات</span>
                            </Link>

                            <Link
                                href="/company/dashboard/shipments"
                                className="p-3 rounded-xl bg-surface-muted/60 hover:bg-accent-soft hover:text-accent border border-border transition-all flex items-center gap-2 text-heading"
                            >
                                <LuTruck className="w-4 h-4 text-accent" />
                                <span>الشحنات</span>
                            </Link>

                            <Link
                                href="/company/dashboard/invoices"
                                className="p-3 rounded-xl bg-surface-muted/60 hover:bg-accent-soft hover:text-accent border border-border transition-all flex items-center gap-2 text-heading"
                            >
                                <LuReceipt className="w-4 h-4 text-accent" />
                                <span>الفواتير</span>
                            </Link>

                            <Link
                                href="/company/dashboard/employees"
                                className="p-3 rounded-xl bg-surface-muted/60 hover:bg-accent-soft hover:text-accent border border-border transition-all flex items-center gap-2 text-heading"
                            >
                                <LuUsers className="w-4 h-4 text-accent" />
                                <span>الموظفين</span>
                            </Link>

                            <Link
                                href="/company/dashboard/vehicles"
                                className="p-3 rounded-xl bg-surface-muted/60 hover:bg-accent-soft hover:text-accent border border-border transition-all flex items-center gap-2 text-heading"
                            >
                                <LuTruck className="w-4 h-4 text-accent" />
                                <span>المركبات</span>
                            </Link>

                            <Link
                                href="/company/dashboard/settings"
                                className="p-3 rounded-xl bg-surface-muted/60 hover:bg-accent-soft hover:text-accent border border-border transition-all flex items-center gap-2 text-heading"
                            >
                                <LuSettings className="w-4 h-4 text-accent" />
                                <span>الإعدادات</span>
                            </Link>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
