"use client"
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
    LuPercent,
    LuShieldAlert,
    LuHistory,
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
    vatRate: number;
    vatExemptionReason?: string;
    vatRateReason?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

export const CompanySettings: React.FC = () => {
    const { data: responseData, isLoading } = useCompanySettings();
    const updateMutation = useUpdateCompanySettings();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [selectedVatRate, setSelectedVatRate] = useState<number>(15);

    const profile = responseData?.data?.profile;
    const auditLogs = profile?.taxRateAuditLog || [];

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { isSubmitting },
    } = useForm<SettingsFormInputs>();

    const watchedVatRate = watch("vatRate", selectedVatRate);

    useEffect(() => {
        if (profile) {
            const currentRate = profile.vatRate !== undefined ? profile.vatRate : 15;
            setSelectedVatRate(currentRate);
            reset({
                companyName: profile.companyName || "",
                email: profile.email || "",
                phone: profile.phone || "",
                city: profile.city || "",
                taxNumber: profile.taxNumber || "",
                address: profile.address || "",
                facilityInfo: profile.facilityInfo || "",
                vatRate: currentRate,
                vatExemptionReason: profile.vatExemptionReason || "خدمات نقل لوجستي معفاة بموجب اللائحة",
                vatRateReason: "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    }, [profile, reset]);

    const onSubmit = (data: SettingsFormInputs) => {
        const payload: Record<string, any> = {
            phone: data.phone,
            city: data.city,
            address: data.address,
            facilityInfo: data.facilityInfo,
        };

        const targetRate = Number(data.vatRate);
        const originalRate = profile?.vatRate !== undefined ? profile.vatRate : 15;

        // Check if rate changed
        if (targetRate !== originalRate) {
            if (!data.vatRateReason || data.vatRateReason.trim().length < 3) {
                toast.error("حماية النزاهة الضريبية : يجب إدخال سبب تعديل نسبة الضريبة حتمياً توثيقاً للسجل التاريخي");
                return;
            }
            payload.vatRate = targetRate;
            payload.vatRateReason = data.vatRateReason.trim();

            if (targetRate === 0) {
                if (!data.vatExemptionReason || data.vatExemptionReason.trim().length < 3) {
                    toast.error("يرجى إدخال أو اختيار سبب الإعفاء الضريبي الرسمي عند تفعيل نسبة 0%");
                    return;
                }
                payload.vatExemptionReason = data.vatExemptionReason.trim();
            }
        }

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
                    setValue("vatRateReason", "");
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

                {/* VAT & ZATCA Governance Section */}
                <div className="p-6 bg-surface border border-border rounded-md space-y-6">
                    <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border pb-4">
                        <LuPercent className="w-5 h-5 text-accent" />
                        <span>إعدادات ضريبة القيمة المضافة </span>
                    </div>

                    <div className="p-4 rounded-md bg-accent-soft/30 border border-accent/20 text-xs text-foreground space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-accent">
                            <LuShieldAlert className="w-4 h-4" />
                            <span>تنبيه أمني وإشعار الحماية الضريبية:</span>
                        </div>
                        <p className="leading-relaxed">
                            تعديل نسبة الضريبة التشغيلية للشركة ينطبق **حصرياً على الفواتير المستقبلية الجديدة**. الفواتير الصادرة مسبقاً والمسددة تحتفظ بنسبتها ومبالغها التاريخية المطبوعة فور الإصدار دون تأثر.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* VAT Rate Selection */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                نسبة ضريبة القيمة المضافة التشغيلية المعتمدة <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("vatRate", { valueAsNumber: true })}
                                onChange={(e) => setSelectedVatRate(Number(e.target.value))}
                                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent cursor-pointer"
                            >
                                <option value={15}>15% - النسبة الأساسية القياسية (المملكة العربية السعودية)</option>
                                <option value={0}>0% - معفى ضريبياً / نسبة صفرية</option>
                            </select>
                        </div>

                        {/* Exemption Reason (Shows when rate is 0%) */}
                        {Number(watchedVatRate) === 0 && (
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    سبب الإعفاء الضريبي الرسمي <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("vatExemptionReason")}
                                    placeholder="مثال: تصدير خدمات لوجستية، منشأة معفاة..."
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent"
                                />
                            </div>
                        )}
                    </div>

                    {/* Tax Rate Change Reason (Shows when changing rate) */}
                    {Number(watchedVatRate) !== (profile?.vatRate !== undefined ? profile.vatRate : 15) && (
                        <div className="p-4 rounded-md border border-rose-500/30 bg-rose-500/5 space-y-2">
                            <label className="block text-xs font-bold text-rose-600 flex items-center gap-1.5">
                                <LuShieldAlert className="w-4 h-4" />
                                سبب تعديل نسبة الضريبة <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("vatRateReason")}
                                placeholder="اكتب سبب تغيير نسبة الضريبة بالشركة (مثال: صدور شهادة التسجيل الضريبي أو الإعفاء)..."
                                className="w-full px-3 py-2 text-sm rounded-md border border-rose-500/40 bg-surface text-foreground focus:outline-none focus:border-rose-500"
                            />
                        </div>
                    )}

                    {/* Audit Log Table */}
                    {auditLogs.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground border-t border-border pt-4">
                                <LuHistory className="w-4 h-4 text-accent" />
                                <span>سجل تدقيق وتغييرات نسبة الضريبة التاريخية (Tax Rate Audit Log)</span>
                            </div>

                            <div className="overflow-x-auto border border-border rounded-md">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-surface-muted text-muted-foreground font-semibold border-b border-border">
                                        <tr>
                                            <th className="p-2.5">تاريخ التعديل</th>
                                            <th className="p-2.5">النسبة الجديدة</th>
                                            <th className="p-2.5">سبب التعديل</th>
                                            <th className="p-2.5">المنفذ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border text-foreground">
                                        {auditLogs.map((log: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-surface-muted/50">
                                                <td className="p-2.5 font-latin">{new Date(log.changedAt).toLocaleString('ar-SA')}</td>
                                                <td className="p-2.5 font-bold font-latin text-accent">{log.rate}%</td>
                                                <td className="p-2.5">{log.reason}</td>
                                                <td className="p-2.5 text-muted-foreground">{log.changedByName || 'مالك الشركة'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
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
