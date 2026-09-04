/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
    LuBuilding,
    LuMail,
    LuPhone,
    LuMapPin,
    LuFileText,
    LuSave,
    LuActivity,
    LuLock,
    LuInfo,
    LuKeyRound,
    LuEye,
    LuEyeOff,
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
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

export const CompanySettings: React.FC = () => {
    const { data: responseData, isLoading } = useCompanySettings();
    const updateMutation = useUpdateCompanySettings();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const companyProfile = responseData?.data?.profile || {};

    const {
        register,
        handleSubmit,
        reset,
        setValue,
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
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    }, [companyProfile, reset]);

    const onSubmit = (data: SettingsFormInputs) => {
        const payload: Record<string, any> = {
            phone: data.phone,
            city: data.city,
            address: data.address,
            facilityInfo: data.facilityInfo,
        };

        if (data.currentPassword || data.newPassword || data.confirmPassword) {
            if (!data.currentPassword) {
                toast.error("يرجى إدخال كلمة المرور الحالية لأتمتة التغيير");
                return;
            }
            if (!data.newPassword) {
                toast.error("يرجى إدخال كلمة المرور الجديدة");
                return;
            }
            if (data.newPassword.length < 6) {
                toast.error("كلمة المرور الجديدة يجب أن تكون على الأقل 6 أحرف");
                return;
            }
            if (data.newPassword !== data.confirmPassword) {
                toast.error("كلمة المرور الجديدة وتأكيدها غير متطابقين");
                return;
            }

            payload.currentPassword = data.currentPassword;
            payload.newPassword = data.newPassword;
        }

        updateMutation.mutate(
            { updates: payload },
            {
                onSuccess: () => {
                    setValue("currentPassword", "");
                    setValue("newPassword", "");
                    setValue("confirmPassword", "");
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <LuActivity className="w-8 h-8 animate-spin text-accent" />
                <span className="mr-3 font-medium">جاري تحميل إعدادات وحساب الشركة...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">إعدادات تفاصيل الشركة والأمان</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    إدارة الملف التعريفي، البيانات التشغيلية، وتغيير كلمة المرور الخاصة بمنشأتك اللوجستية.
                </p>
            </div>

            {/* Notice Banner */}
            <div className="w-full p-4 bg-accent-soft/40 border border-accent/20 rounded-md flex items-center gap-3 text-xs text-foreground">
                <LuInfo className="w-5 h-5 text-accent flex-shrink-0" />
                <span>
                    <strong>تنبيه قانوني:</strong> البيانات الرسمية والتجارية (اسم الشركة، البريد الإلكتروني، والرقم الضريبي) محمية وللقراءة فقط لحفظ حقوق الفواتير والتعاقدات. لتحديثها يرجى التواصل مع إدارة المنصة.
                </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                {/* Main Profile Form */}
                <div className="p-6 bg-surface border border-border rounded-md space-y-6">
                    <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border pb-4">
                        <LuBuilding className="w-5 h-5 text-accent" />
                        <span>بيانات الشركة والملف التعريفي</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company Name (Locked) */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center justify-between">
                                <span>اسم الشركة الرسمي</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <LuLock className="w-3 h-3 text-accent" /> موثق
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register("companyName")}
                                    disabled
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-border/20 text-muted-foreground cursor-not-allowed pl-9"
                                />
                                <LuBuilding className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                            </div>
                        </div>

                        {/* Email (Locked) */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center justify-between">
                                <span>البريد الإلكتروني الحسابي</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <LuLock className="w-3 h-3 text-accent" /> موثق
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    {...register("email")}
                                    disabled
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-border/20 text-muted-foreground cursor-not-allowed pl-9"
                                />
                                <LuMail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                            </div>
                        </div>

                        {/* Tax Number (Locked) */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center justify-between">
                                <span>الرقم الضريبي (VAT)</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <LuLock className="w-3 h-3 text-accent" /> موثق
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register("taxNumber")}
                                    disabled
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-border/20 text-muted-foreground cursor-not-allowed pl-9"
                                />
                                <LuFileText className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                            </div>
                        </div>

                        {/* Phone (Editable) */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                رقم الهاتف / الجوال <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register("phone", { required: true })}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent pl-9"
                                />
                                <LuPhone className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                            </div>
                        </div>

                        {/* City (Editable) */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                المدينة الرئيسية <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register("city", { required: true })}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent pl-9"
                                />
                                <LuMapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                            </div>
                        </div>

                        {/* Address (Editable) */}
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

                    {/* Facility Info (Editable) */}
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
                </div>

                {/* Password Change Section */}
                <div className="p-6 bg-surface border border-border rounded-md space-y-6">
                    <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border pb-4">
                        <LuKeyRound className="w-5 h-5 text-accent" />
                        <span>أمان الحساب وتغيير كلمة المرور</span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        اترك حقول كلمة المرور فارغة إذا كنت لا ترغب في تغيير كلمة المرور الحالية للحساب.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Current Password */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                كلمة المرور الحالية
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    {...register("currentPassword")}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent pl-9"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute left-3 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    {showCurrentPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                كلمة المرور الجديدة
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    {...register("newPassword")}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent pl-9"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute left-3 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    {showNewPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                تأكيد كلمة المرور الجديدة
                            </label>
                            <input
                                type="password"
                                {...register("confirmPassword")}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || updateMutation.isPending}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
                    >
                        <LuSave className="w-4 h-4" />
                        <span>{updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغيرات والأمان"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
