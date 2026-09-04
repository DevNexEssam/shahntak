"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    LuBuilding,
    LuMail,
    LuPhone,
    LuMapPin,
    LuCreditCard,
    LuFileText,
    LuSave,
    LuActivity,
    LuCalendar,
    LuShieldCheck,
} from "react-icons/lu";
import { useCompanySettings, useUpdateCompanySettings } from "@/hooks/company/useCompanySettings";

interface SettingsFormInputs {
    companyName: string;
    email: string;
    phone: string;
    city: string;
    taxNumber: string;
    address: string;
    facilityInfo: string;
}

export const CompanySettings: React.FC = () => {
    const { data: responseData, isLoading } = useCompanySettings();
    const updateMutation = useUpdateCompanySettings();

    const companyProfile = responseData?.data?.profile || {};
    const subscription = responseData?.data?.subscription || null;
    const plan = subscription?.planId || {};

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<SettingsFormInputs>();

    useEffect(() => {
        if (companyProfile) {
            reset({
                companyName: companyProfile.companyName || "",
                email: companyProfile.email || "",
                phone: companyProfile.phone || "",
                city: companyProfile.city || "",
                taxNumber: companyProfile.taxNumber || "",
                address: companyProfile.address || "",
                facilityInfo: companyProfile.facilityInfo || "",
            });
        }
    }, [companyProfile, reset]);

    const onSubmit = (data: SettingsFormInputs) => {
        updateMutation.mutate({ updates: data });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <LuActivity className="w-8 h-8 animate-spin text-accent" />
                <span className="mr-3 font-medium">جاري تحميل إعدادات وحساب الشركة...</span>
            </div>
        );
    }

    const maxOrders = plan.maxOrdersMonthly || 1000;
    const ordersUsed = subscription?.ordersUsedThisMonth || 0;
    const ordersPercent = Math.min(100, Math.round((ordersUsed / maxOrders) * 100));

    const maxShipments = plan.maxShipmentsMonthly || 500;
    const shipmentsUsed = subscription?.shipmentsUsedThisMonth || 0;
    const shipmentsPercent = Math.min(100, Math.round((shipmentsUsed / maxShipments) * 100));

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">إعدادات الشركة وحساب الاشتراك</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    إدارة الملف التعريفي للشركة، البيانات الضريبية، ومتابعة رصيد الباقة السحابية النشطة.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profile Form (2 Columns) */}
                <div className="lg:col-span-2 p-6 bg-surface border border-border rounded-md space-y-6">
                    <div className="flex items-center space-x-2 space-x-reverse text-foreground font-semibold border-b border-border pb-4">
                        <LuBuilding className="w-5 h-5 text-accent" />
                        <span>بيانات الشركة والملف التعريفي</span>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Company Name */}
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    اسم الشركة الرسمي <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        {...register("companyName", { required: true })}
                                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent"
                                    />
                                </div>
                            </div>

                            {/* Email (Readonly) */}
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    البريد الإلكتروني الحسابي
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        {...register("email")}
                                        disabled
                                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-border/20 text-muted-foreground cursor-not-allowed"
                                    />
                                    <LuMail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    رقم الهاتف / الجوال <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        {...register("phone", { required: true })}
                                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent"
                                    />
                                    <LuPhone className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                                </div>
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    المدينة الرئيسية <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        {...register("city", { required: true })}
                                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent"
                                    />
                                    <LuMapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                                </div>
                            </div>

                            {/* Tax Number */}
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    الرقم الضريبي (VAT)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        {...register("taxNumber")}
                                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent"
                                    />
                                    <LuFileText className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    العنوان التفصيلي المقر الرئيسي
                                </label>
                                <input
                                    type="text"
                                    {...register("address")}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        {/* Facility Info */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                السجل التجاري / وصف المنشأة
                            </label>
                            <textarea
                                rows={3}
                                {...register("facilityInfo")}
                                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent"
                            />
                        </div>

                        {/* Save Button */}
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting || updateMutation.isPending}
                                className="inline-flex items-center space-x-2 space-x-reverse px-5 py-2.5 text-sm font-semibold rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
                            >
                                <LuSave className="w-4 h-4" />
                                <span>{updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Subscription & Quota Card (1 Column) */}
                <div className="p-6 bg-surface border border-border rounded-md space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 space-x-reverse text-foreground font-semibold border-b border-border pb-4">
                            <LuCreditCard className="w-5 h-5 text-accent" />
                            <span>الباقة السحابية والحدود الشهرية</span>
                        </div>

                        {/* Subscription Info */}
                        <div className="p-4 bg-accent-soft/30 border border-accent/20 rounded-md space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">الباقة النشطة</span>
                                <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-500 flex items-center space-x-1 space-x-reverse">
                                    <LuShieldCheck className="w-3.5 h-3.5" />
                                    <span>نشط</span>
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground">
                                {plan.nameAr || plan.name || "الباقة الاحترافية Standard"}
                            </h3>
                            <div className="flex items-center space-x-1 space-x-reverse text-xs text-muted-foreground">
                                <LuCalendar className="w-3.5 h-3.5 text-accent" />
                                <span>
                                    تاريخ الانقضاء:{" "}
                                    {subscription?.endDate
                                        ? new Date(subscription.endDate).toLocaleDateString("ar-SA")
                                        : "غير متاح"}
                                </span>
                            </div>
                        </div>

                        {/* Monthly Usage Quotas */}
                        <div className="space-y-4 pt-2">
                            {/* Orders Limit */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">استهلاك الطلبات الشهرية</span>
                                    <span className="font-semibold text-foreground">
                                        {ordersUsed} / {maxOrders}
                                    </span>
                                </div>
                                <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${
                                            ordersPercent >= 90 ? "bg-red-500" : "bg-accent"
                                        }`}
                                        style={{ width: `${ordersPercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Shipments Limit */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">استهلاك الشحنات الشهرية</span>
                                    <span className="font-semibold text-foreground">
                                        {shipmentsUsed} / {maxShipments}
                                    </span>
                                </div>
                                <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${
                                            shipmentsPercent >= 90 ? "bg-red-500" : "bg-purple-500"
                                        }`}
                                        style={{ width: `${shipmentsPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border text-center text-xs text-muted-foreground">
                        لترقية الباقة أو تغيير الحدود تواصل مع الدعم الفني للمنصة.
                    </div>
                </div>
            </div>
        </div>
    );
};
