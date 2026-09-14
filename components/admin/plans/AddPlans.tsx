"use client";

import React, { useState } from 'react';
import { useCreatePlan } from '@/hooks/plans/usePlans';
import { planCreateValidationSchema } from '@/lib/validations/plan.schema';
import toast from 'react-hot-toast';
import {
    LuCreditCard,
    LuX,
    LuCoins,
    LuCheck,
    LuPlus,
    LuTrash2
} from 'react-icons/lu';

interface AddPlansProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddPlans({ isOpen = true, onClose }: AddPlansProps) {
    const [formValues, setFormValues] = useState({
        name: '',
        description: '',
        price: 299,
        billingCycle: 'monthly' as 'monthly' | 'yearly',
        maxOrdersPerMonth: 500,
        maxShipmentsPerMonth: 100,
        maxCompanyUsers: 5,
        features: ['تجميع الطلبات الآلي', 'طباعة بوالص الشحن 🖨️', 'دعم فني على مدار الساعة'],
        hasWaybillPdfExport: true,
        hasBulkExcelImport: true,
        hasZatcaInvoicing: true,
        hasExpensesTracking: true,
        hasCustomRoutes: true,
        hasAdvancedAnalytics: true,
        hasAuditLogs: true,
        isActive: true,
    });

    const [featureInput, setFeatureInput] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: createPlan, isPending: isSubmitting } = useCreatePlan();

    if (!isOpen) return null;

    const handleAddFeature = () => {
        if (!featureInput.trim()) return;
        setFormValues({ ...formValues, features: [...formValues.features, featureInput.trim()] });
        setFeatureInput('');
    };

    const handleRemoveFeature = (index: number) => {
        setFormValues({
            ...formValues,
            features: formValues.features.filter((_, i) => i !== index),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const validation = planCreateValidationSchema.safeParse(formValues);
        if (!validation.success) {
            const errors: Record<string, string> = {};
            validation.error.issues.forEach((issue) => {
                if (issue.path[0]) {
                    errors[issue.path[0].toString()] = issue.message;
                }
            });
            setFieldErrors(errors);
            toast.error("يرجى تصحيح الأخطاء الموضحة في النموذج");
            return;
        }

        createPlan(formValues, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuCreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">إضافة باقة سحابية جديدة</h2>
                            <p className="text-xs text-body mt-0.5">تحديد أسعار الباقة وحدود الطلبات والشحنات والميزات</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer disabled:opacity-50"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-5 flex-1 text-right">

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading">
                                اسم الباقة <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                disabled={isSubmitting}
                                value={formValues.name}
                                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                                placeholder="مثال: الباقة الاحترافية Pro"
                                className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.name ? 'border-rose-500' : 'border-border'
                                    }`}
                            />
                            {fieldErrors.name && (
                                <span className="text-xs text-rose-500 font-medium block">{fieldErrors.name}</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCoins className="w-3.5 h-3.5 text-body" />
                                    سعر الباقة (ر.س) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.price}
                                    onChange={(e) => setFormValues({ ...formValues, price: Number(e.target.value) })}
                                    min={0}
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.price ? 'border-rose-500' : 'border-border'
                                        }`}
                                />
                                {fieldErrors.price && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.price}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading block">
                                    دورة الفوترة
                                </label>
                                <select
                                    disabled={isSubmitting}
                                    value={formValues.billingCycle}
                                    onChange={(e) => setFormValues({ ...formValues, billingCycle: e.target.value as any })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                >
                                    <option value="monthly">شهري</option>
                                    <option value="yearly">سنوي</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading block">
                                    حد الطلبات شهرياً (-1 غير محدود)
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.maxOrdersPerMonth}
                                    onChange={(e) => setFormValues({ ...formValues, maxOrdersPerMonth: Number(e.target.value) })}
                                    className="w-full px-3.5 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading block">
                                    حد الشحنات شهرياً
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.maxShipmentsPerMonth}
                                    onChange={(e) => setFormValues({ ...formValues, maxShipmentsPerMonth: Number(e.target.value) })}
                                    className="w-full px-3.5 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading block">
                                    حد موظفي الشركة
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.maxCompanyUsers}
                                    onChange={(e) => setFormValues({ ...formValues, maxCompanyUsers: Number(e.target.value) })}
                                    className="w-full px-3.5 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        {/* Feature Flags Checkboxes Section */}
                        <div className="space-y-3 pt-3 border-t border-border bg-surface-muted/60 p-4 rounded-2xl border border-border">
                            <label className="text-xs font-extrabold text-heading block">
                                تحديد مميزات وصلاحيات الباقة الذكية
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                <label className="flex items-center gap-2.5 cursor-pointer bg-surface p-2.5 rounded-xl border border-border hover:border-accent transition-all">
                                    <input
                                        type="checkbox"
                                        checked={formValues.hasWaybillPdfExport}
                                        onChange={(e) => setFormValues({ ...formValues, hasWaybillPdfExport: e.target.checked })}
                                        className="w-4 h-4 accent-accent rounded cursor-pointer"
                                    />
                                    <span className="font-bold text-heading">تصدير وطباعة بوالص الـ PDF</span>
                                </label>

                                <label className="flex items-center gap-2.5 cursor-pointer bg-surface p-2.5 rounded-xl border border-border hover:border-accent transition-all">
                                    <input
                                        type="checkbox"
                                        checked={formValues.hasBulkExcelImport}
                                        onChange={(e) => setFormValues({ ...formValues, hasBulkExcelImport: e.target.checked })}
                                        className="w-4 h-4 accent-accent rounded cursor-pointer"
                                    />
                                    <span className="font-bold text-heading">الاستيراد الجماعي للطلبات عبر Excel</span>
                                </label>

                                <label className="flex items-center gap-2.5 cursor-pointer bg-surface p-2.5 rounded-xl border border-border hover:border-accent transition-all">
                                    <input
                                        type="checkbox"
                                        checked={formValues.hasZatcaInvoicing}
                                        onChange={(e) => setFormValues({ ...formValues, hasZatcaInvoicing: e.target.checked })}
                                        className="w-4 h-4 accent-accent rounded cursor-pointer"
                                    />
                                    <span className="font-bold text-heading">الفوترة الضريبية وإصدار فواتير ZATCA</span>
                                </label>

                                <label className="flex items-center gap-2.5 cursor-pointer bg-surface p-2.5 rounded-xl border border-border hover:border-accent transition-all">
                                    <input
                                        type="checkbox"
                                        checked={formValues.hasExpensesTracking}
                                        onChange={(e) => setFormValues({ ...formValues, hasExpensesTracking: e.target.checked })}
                                        className="w-4 h-4 accent-accent rounded cursor-pointer"
                                    />
                                    <span className="font-bold text-heading">إدارة المصروفات والنفقات التشغيلية</span>
                                </label>

                                <label className="flex items-center gap-2.5 cursor-pointer bg-surface p-2.5 rounded-xl border border-border hover:border-accent transition-all">
                                    <input
                                        type="checkbox"
                                        checked={formValues.hasCustomRoutes}
                                        onChange={(e) => setFormValues({ ...formValues, hasCustomRoutes: e.target.checked })}
                                        className="w-4 h-4 accent-accent rounded cursor-pointer"
                                    />
                                    <span className="font-bold text-heading">إدارة المسارات والخطوط اللوجستية</span>
                                </label>

                                <label className="flex items-center gap-2.5 cursor-pointer bg-surface p-2.5 rounded-xl border border-border hover:border-accent transition-all">
                                    <input
                                        type="checkbox"
                                        checked={formValues.hasAdvancedAnalytics}
                                        onChange={(e) => setFormValues({ ...formValues, hasAdvancedAnalytics: e.target.checked })}
                                        className="w-4 h-4 accent-accent rounded cursor-pointer"
                                    />
                                    <span className="font-bold text-heading">لوحة التحليلات والتقارير المتقدمة</span>
                                </label>

                                <label className="flex items-center gap-2.5 cursor-pointer bg-surface p-2.5 rounded-xl border border-border hover:border-accent transition-all sm:col-span-2">
                                    <input
                                        type="checkbox"
                                        checked={formValues.hasAuditLogs}
                                        onChange={(e) => setFormValues({ ...formValues, hasAuditLogs: e.target.checked })}
                                        className="w-4 h-4 accent-accent rounded cursor-pointer"
                                    />
                                    <span className="font-bold text-heading">سجل التدقيق والأنشطة التاريخي (Audit Logs)</span>
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* Modal Footer */}
                    <div className="p-5 border-t border-border bg-surface-muted/40 flex items-center justify-between gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                            إلغاء
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[130px] justify-center"
                        >
                            {isSubmitting ? "جاري الإضافة..." : "حفظ البيانات"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
