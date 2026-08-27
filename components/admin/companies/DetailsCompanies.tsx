"use client";

import React from "react";
import Link from "next/link";
import {
    LuBuilding2,
    LuX,
    LuMail,
    LuPhone,
    LuMapPin,
    LuHash,
    LuFileText,
    LuShieldCheck,
    LuCalendar,
    LuUsers,
    LuPackage,
    LuTruck,
    LuWallet,
    LuExternalLink,
    LuRefreshCw
} from "react-icons/lu";
import { Company } from "@/types/data";
import { useCompany } from "@/hooks/companies/useCompanies";
import { format } from "date-fns";

interface DetailsCompaniesProps {
    isOpen?: boolean;
    onClose: () => void;
    company: Company | null;
    companyId?: string | null;
}

export default function DetailsCompanies({
    isOpen = true,
    onClose,
    company: initialCompany,
    companyId: propCompanyId,
}: DetailsCompaniesProps) {
    const targetId = propCompanyId || initialCompany?._id || "";

    // Fetch live company data & statistics from GET /api/admin/companies/[id]
    const { data: companyRes, isLoading, isFetching, refetch } = useCompany(targetId);

    if (!isOpen || (!initialCompany && !propCompanyId)) return null;

    // Active company object (fallback to initialCompany prop if query is pending)
    const company = companyRes?.data || initialCompany;

    const employeesCount = companyRes?.employeesCount ?? 0;
    const ordersCount = companyRes?.ordersCount ?? 0;
    const shipmentsCount = companyRes?.shipmentsCount ?? 0;
    const completedShipmentsCount = companyRes?.completedShipmentsCount ?? 0;
    const activeShipmentsCount = companyRes?.activeShipmentsCount ?? 0;
    const totalRevenue = companyRes?.totalRevenue ?? 0;
    const pendingAmount = companyRes?.pendingAmount ?? 0;

    const getCompanyStatusBadge = (status?: Company["status"]) => {
        switch (status) {
            case "active":
                return (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                        نشط
                    </span>
                );
            case "inactive":
                return (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-600 border border-amber-200">
                        غير نشط
                    </span>
                );
            case "archived":
                return (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-500/10 text-slate-600 border border-slate-200">
                        مؤرشف (Archived)
                    </span>
                );
            case "banned":
                return (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-500/10 text-rose-600 border border-rose-200">
                        محظور (Banned)
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-surface-muted text-body">
                        {status || "غير معروف"}
                    </span>
                );
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200"
            dir="rtl"
        >
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
                            <LuBuilding2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-extrabold text-heading">
                                    {company?.companyName || "تفاصيل الشركة"}
                                </h2>
                                {isFetching && (
                                    <LuRefreshCw className="w-3.5 h-3.5 animate-spin text-accent" title="جاري تحديث البيانات..." />
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-5 text-sm text-right flex-1">
                    {isLoading && !company ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                            <LuRefreshCw className="w-8 h-8 animate-spin text-accent" />
                            <p className="text-xs font-bold text-body">جاري جلب تفاصيل وإحصائيات الشركة...</p>
                        </div>
                    ) : company ? (
                        <>
                            {/* KPI Metrics fetched from /api/admin/companies/[id] */}
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-body/80 block">الإحصائيات الحالية :</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                                    {/* Employees Count */}
                                    <div className="p-3 bg-surface-muted/70 rounded-2xl border border-border flex flex-col justify-between">
                                        <div className="flex items-center justify-between text-body/70 mb-1">
                                            <span className="text-xs font-semibold">الموظفون</span>
                                            <LuUsers className="w-4 h-4 text-accent" />
                                        </div>
                                        <p className="text-xl font-extrabold text-heading font-mono">{employeesCount}</p>
                                    </div>

                                    {/* Orders Count */}
                                    <div className="p-3 bg-surface-muted/70 rounded-2xl border border-border flex flex-col justify-between">
                                        <div className="flex items-center justify-between text-body/70 mb-1">
                                            <span className="text-xs font-semibold">الطلبات</span>
                                            <LuPackage className="w-4 h-4 text-accent" />
                                        </div>
                                        <p className="text-xl font-extrabold text-heading font-mono">{ordersCount}</p>
                                    </div>

                                    {/* Shipments Count */}
                                    <div className="p-3 bg-surface-muted/70 rounded-2xl border border-border flex flex-col justify-between">
                                        <div className="flex items-center justify-between text-body/70 mb-1">
                                            <span className="text-xs font-semibold">الشحنات</span>
                                            <LuTruck className="w-4 h-4 text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-extrabold text-heading font-mono">{shipmentsCount}</p>
                                            <span className="text-[10px] text-body/70 block">
                                                {completedShipmentsCount} مكتملة | {activeShipmentsCount} نشطة
                                            </span>
                                        </div>
                                    </div>

                                    {/* Total Revenue */}
                                    <div className="p-3 bg-surface-muted/70 rounded-2xl border border-border flex flex-col justify-between">
                                        <div className="flex items-center justify-between text-body/70 mb-1">
                                            <span className="text-xs font-semibold">الإيرادات</span>
                                            <LuWallet className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-extrabold text-emerald-600 font-mono">
                                                {totalRevenue.toLocaleString()} <span className="text-xs">ر.س</span>
                                            </p>
                                            {pendingAmount > 0 && (
                                                <span className="text-[10px] text-amber-600 font-bold block">
                                                    معلق: {pendingAmount.toLocaleString()} ر.س
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="h-px bg-border" />

                            {/* Basic Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div className="p-3.5 bg-surface-muted rounded-2xl border border-border space-y-1">
                                    <span className="text-xs font-semibold text-body/70 flex items-center gap-1.5">
                                        <LuMail className="w-3.5 h-3.5 text-accent" />
                                        البريد الإلكتروني
                                    </span>
                                    <p className="font-mono font-bold text-heading dir-ltr text-right">{company.email}</p>
                                </div>

                                <div className="p-3.5 bg-surface-muted rounded-2xl border border-border space-y-1">
                                    <span className="text-xs font-semibold text-body/70 flex items-center gap-1.5">
                                        <LuPhone className="w-3.5 h-3.5 text-accent" />
                                        رقم الهاتف
                                    </span>
                                    <p className="font-mono font-bold text-heading dir-ltr text-right">{company.phone}</p>
                                </div>

                                <div className="p-3.5 bg-surface-muted rounded-2xl border border-border space-y-1">
                                    <span className="text-xs font-semibold text-body/70 flex items-center gap-1.5">
                                        <LuMapPin className="w-3.5 h-3.5 text-accent" />
                                        المدينة / الفرع الرئيسي
                                    </span>
                                    <p className="font-bold text-heading">{company.city || "غير محدد"}</p>
                                </div>

                                <div className="p-3.5 bg-surface-muted rounded-2xl border border-border space-y-1">
                                    <span className="text-xs font-semibold text-body/70 flex items-center gap-1.5">
                                        <LuHash className="w-3.5 h-3.5 text-accent" />
                                        الرقم الضريبي (VAT)
                                    </span>
                                    <p className="font-mono font-bold text-heading">{company.taxNumber || "غير مسجل"}</p>
                                </div>
                            </div>

                            {/* Address & Facility Info */}
                            {company.address && (
                                <div className="p-3.5 bg-surface-muted rounded-2xl border border-border space-y-1">
                                    <span className="text-xs font-semibold text-body/70 flex items-center gap-1.5">
                                        <LuMapPin className="w-3.5 h-3.5 text-accent" />
                                        العنوان التفصيلي
                                    </span>
                                    <p className="text-heading font-medium">{company.address}</p>
                                </div>
                            )}

                            {company.facilityInfo && (
                                <div className="p-3.5 bg-surface-muted rounded-2xl border border-border space-y-1">
                                    <span className="text-xs font-semibold text-body/70 flex items-center gap-1.5">
                                        <LuFileText className="w-3.5 h-3.5 text-accent" />
                                        معلومات المنشأة
                                    </span>
                                    <p className="text-heading leading-relaxed">{company.facilityInfo}</p>
                                </div>
                            )}

                            {/* Status & Approval */}
                            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-surface-muted/60 rounded-2xl border border-border">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-body">حالة الشركة:</span>
                                    {getCompanyStatusBadge(company.status)}
                                </div>

                                {company.approvedBy ? (
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200">
                                        <LuShieldCheck className="w-4 h-4" />
                                        <span>معتمدة بالنظام</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-200">
                                        <span>بانتظار الاعتماد الإداري</span>
                                    </div>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="flex justify-between items-center text-xs text-body/70 pt-1 px-1">
                                <span className="flex items-center gap-1">
                                    <LuCalendar className="w-3.5 h-3.5 text-accent" />
                                    تاريخ التسجيل: {company.createdAt ? format(new Date(company.createdAt), "dd MMMM yyyy") : "غير متوفر"}
                                </span>
                                {company.updatedAt && (
                                    <span>آخر تحديث: {format(new Date(company.updatedAt), "dd MMM yyyy")}</span>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="py-8 text-center text-rose-600 font-bold text-xs">
                            تعذر تحميل بيانات هذه الشركة.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-surface-muted/40 flex items-center justify-between shrink-0">
                    {company ? (
                        <Link
                            href={`/admin/dashboard/companies/${company._id}`}
                            className="inline-flex items-center gap-2 text-xs font-bold text-accent hover:underline cursor-pointer"
                        >
                            <LuExternalLink className="w-4 h-4" />
                            <span>عرض الصفحة التفصيلية المتقدمة</span>
                        </Link>
                    ) : <div />}

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-xs hover:shadow transition-all cursor-pointer"
                    >
                        إغلاق
                    </button>
                </div>

            </div>
        </div>
    );
}
