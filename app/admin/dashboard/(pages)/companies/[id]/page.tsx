"use client";

import React, { use } from "react";
import Link from "next/link";
import Loading from "@/components/ui/loading";
import ErrorMessege from "@/components/ui/ErrorMessege";
import { useCompanyFullDetails, useApproveCompany } from "@/hooks/companies/useCompanies";
import { Company } from "@/types/data";
import {
    LuBuilding2,
    LuArrowRight,
    LuRefreshCw,
    LuShieldCheck,
    LuMapPin,
    LuMail,
    LuPhone,
    LuCoins,
    LuClock,
    LuTruck,
    LuUsers,
    LuFileText,
    LuCheck,
    LuX,
    LuCalendar,
    LuHash,
    LuFileCheck
} from "react-icons/lu";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function CompanyDetailsPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const companyId = resolvedParams.id;

    const { data: res, isLoading, isError, error, refetch, isFetching } = useCompanyFullDetails(companyId);
    const { mutate: approveCompany, isPending: isApproving } = useApproveCompany();

    if (isLoading) return <Loading />;

    if (isError || !res || !res.company) {
        return (
            <div className="space-y-6 text-right font-arabic p-4">
                <Link
                    href="/admin/dashboard/companies"
                    className="inline-flex items-center gap-2 text-xs font-bold text-body hover:text-heading transition-colors"
                >
                    <LuArrowRight className="w-4 h-4" />
                    <span>العودة لقائمة الشركات</span>
                </Link>
                <ErrorMessege message={(error as any)?.message || res?.message || "الشركة غير موجودة أو تعذر جلب بياناتها"} />
            </div>
        );
    }

    const {
        company,
        employeesCount,
        ordersCount,
        shipmentsCount,
        completedShipmentsCount,
        activeShipmentsCount,
        totalRevenue,
        pendingAmount,
    } = res;

    const getStatusBadge = (status: Company["status"]) => {
        switch (status) {
            case "active":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        نشط ومتاح
                    </span>
                );
            case "inactive":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-200">
                        غير نشط
                    </span>
                );
            case "archived":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 border border-slate-200">
                        مؤرشف
                    </span>
                );
            case "banned":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-200">
                        محظور
                    </span>
                );
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface-muted text-body">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 text-right font-arabic">

            {/* Navigation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <Link
                        href="/admin/dashboard/companies"
                        className="inline-flex items-center gap-2 text-xs font-bold text-body hover:text-heading transition-colors mb-2"
                    >
                        <LuArrowRight className="w-4 h-4" />
                        <span>الرجوع إلى قائمة الشركات</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent font-extrabold text-xl flex items-center justify-center border border-accent/20 shadow-xs">
                            {company.companyName ? company.companyName.charAt(0) : "C"}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-extrabold text-heading">{company.companyName}</h1>
                                {getStatusBadge(company.status)}
                            </div>
                            <p className="text-xs text-body mt-0.5 flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                    <LuMapPin className="w-3.5 h-3.5 text-accent" />
                                    {company.city || "غير محدد"}
                                </span>
                                {company.taxNumber && (
                                    <span className="font-latin dir-ltr text-heading font-semibold">
                                        VAT: {company.taxNumber}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer disabled:opacity-50"
                        title="تحديث التفاصيل"
                    >
                        <LuRefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-accent" : ""}`} />
                    </button>

                    {!company.approvedBy ? (
                        <button
                            onClick={() => approveCompany({ id: company._id, approvedBy: "SuperAdmin" })}
                            disabled={isApproving}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
                        >
                            <LuShieldCheck className="w-4 h-4" />
                            <span>اعتماد التراخيص والشركة</span>
                        </button>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-200 text-emerald-600 font-bold text-xs">
                            <LuShieldCheck className="w-4 h-4" />
                            <span>معتمدة رسمياً</span>
                        </div>
                    )}
                </div>
            </div>

            {/* KPI Operational Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Total Revenue */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">إجمالي الإيرادات المسددة</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{totalRevenue.toLocaleString()} <span className="text-xs font-normal text-body">ر.س</span></h3>
                            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
                                <LuCheck className="w-3.5 h-3.5" />
                                <span>محصلة بالكامل</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                            <LuCoins className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Pending Amount */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">المستحقات المعلقة</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{pendingAmount.toLocaleString()} <span className="text-xs font-normal text-body">ر.س</span></h3>
                            <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-2">
                                <LuClock className="w-3.5 h-3.5" />
                                <span>فواتير قيد التحصيل</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                            <LuClock className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Logistics Shipments */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">الشحنات اللوجستية</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{shipmentsCount}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span className="font-latin text-emerald-600 font-bold">{completedShipmentsCount} مكتملة</span>
                                <span>/</span>
                                <span className="font-latin text-accent font-bold">{activeShipmentsCount} نشطة</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                            <LuTruck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Employees & Orders */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">الموظفون والطلبات</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{employeesCount} <span className="text-xs font-normal text-body">موظف</span></h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>إجمالي الطلبات:</span>
                                <b className="font-latin text-heading">{ordersCount}</b>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                            <LuUsers className="w-5 h-5" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Detailed Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Company Commercial & Contact Info */}
                <div className="bg-surface rounded-md border border-border p-6 space-y-5">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                        <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center font-bold">
                            <LuBuilding2 className="w-4 h-4" />
                        </div>
                        <h2 className="text-base font-extrabold text-heading">بيانات المنشأة والتواصل</h2>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-body font-medium flex items-center gap-2">
                                <LuBuilding2 className="w-4 h-4 text-body/60" />
                                اسم المنشأة / الشركة:
                            </span>
                            <span className="font-bold text-heading">{company.companyName}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-body font-medium flex items-center gap-2">
                                <LuMapPin className="w-4 h-4 text-body/60" />
                                المدينة / المقر الرئيسي:
                            </span>
                            <span className="font-bold text-heading">{company.city || "غير محدد"}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-body font-medium flex items-center gap-2">
                                <LuMail className="w-4 h-4 text-body/60" />
                                البريد الإلكتروني الرسمي:
                            </span>
                            <span className="font-latin font-bold text-heading">{company.email}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-body font-medium flex items-center gap-2">
                                <LuPhone className="w-4 h-4 text-body/60" />
                                رقم الهاتف المحمول:
                            </span>
                            <span className="font-latin font-bold text-heading">{company.phone}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-body font-medium flex items-center gap-2">
                                <LuHash className="w-4 h-4 text-body/60" />
                                الرقم الضريبي / السجل:
                            </span>
                            <span className="font-latin font-bold text-heading">{company.taxNumber || "غير مسجل"}</span>
                        </div>

                        {company.address && (
                            <div className="flex items-start justify-between py-2 border-b border-border/50">
                                <span className="text-body font-medium flex items-center gap-2 shrink-0">
                                    <LuMapPin className="w-4 h-4 text-body/60" />
                                    العنوان الوطني والتفصيلي:
                                </span>
                                <span className="font-bold text-heading text-left">{company.address}</span>
                            </div>
                        )}

                        {company.facilityInfo && (
                            <div className="flex items-start justify-between py-2">
                                <span className="text-body font-medium flex items-center gap-2 shrink-0">
                                    <LuFileText className="w-4 h-4 text-body/60" />
                                    معلومات ومواصفات المنشأة:
                                </span>
                                <span className="font-medium text-heading text-left">{company.facilityInfo}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Audit & Administrative Info */}
                <div className="bg-surface rounded-md border border-border p-6 space-y-5">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                        <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent flex items-center justify-center font-bold">
                            <LuShieldCheck className="w-4 h-4" />
                        </div>
                        <h2 className="text-base font-extrabold text-heading">حالة الاعتماد وسجل النظام</h2>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-body font-medium flex items-center gap-2">
                                حالة تفعيل الحساب:
                            </span>
                            {getStatusBadge(company.status)}
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-body font-medium flex items-center gap-2">
                                <LuShieldCheck className="w-4 h-4 text-body/60" />
                                جهة واعتماد التوثيق:
                            </span>
                            <span className="font-bold text-heading">
                                {company.approvedBy ? (
                                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                                        <LuCheck className="w-3.5 h-3.5" />
                                        معتمد ({typeof company.approvedBy === 'object' ? (company.approvedBy as any).name : company.approvedBy})
                                    </span>
                                ) : (
                                    <span className="text-amber-600 font-bold">في انتظار الاعتماد الإداري</span>
                                )}
                            </span>
                        </div>

                        {company.approvedAt && (
                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                <span className="text-body font-medium flex items-center gap-2">
                                    <LuCalendar className="w-4 h-4 text-body/60" />
                                    تاريخ اعتماد الحساب:
                                </span>
                                <span className="font-latin text-heading font-semibold">
                                    {new Date(company.approvedAt).toLocaleDateString('ar-SA')}
                                </span>
                            </div>
                        )}

                        {company.createdAt && (
                            <div className="flex items-center justify-between py-2 border-b border-border/50">
                                <span className="text-body font-medium flex items-center gap-2">
                                    <LuCalendar className="w-4 h-4 text-body/60" />
                                    تاريخ التسجيل بالمنصة:
                                </span>
                                <span className="font-latin text-heading font-semibold">
                                    {new Date(company.createdAt).toLocaleDateString('ar-SA')}
                                </span>
                            </div>
                        )}

                        {company.updatedAt && (
                            <div className="flex items-center justify-between py-2">
                                <span className="text-body font-medium flex items-center gap-2">
                                    <LuClock className="w-4 h-4 text-body/60" />
                                    آخر تحديث للملف:
                                </span>
                                <span className="font-latin text-heading font-semibold">
                                    {new Date(company.updatedAt).toLocaleDateString('ar-SA')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}
