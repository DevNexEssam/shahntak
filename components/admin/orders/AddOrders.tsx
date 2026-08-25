"use client";

import React, { useState } from 'react';
import { useCreateOrder } from '@/hooks/orders/useOrders';
import { useAllCompanies } from '@/hooks/companies/useCompanies';
import { orderCreateValidationSchema } from '@/lib/validations/order.schema';
import toast from 'react-hot-toast';
import {
    LuPackage,
    LuX,
    LuUser,
    LuPhone,
    LuMapPin,
    LuBuilding2,
    LuCoins,
    LuWeight,
    LuHash
} from 'react-icons/lu';

interface AddOrdersProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddOrders({ isOpen = true, onClose }: AddOrdersProps) {
    const [formValues, setFormValues] = useState({
        orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        companyId: '',
        createdByUserId: '',
        recipientName: '',
        recipientPhone: '',
        recipientCity: '',
        recipientDistrict: '',
        recipientAddress: '',
        description: '',
        quantity: 1,
        weight: 1,
        orderValue: 0,
        codAmount: 0,
        status: 'pending' as const,
        source: 'manual' as const,
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: createOrder, isPending: isSubmitting } = useCreateOrder();
    const { data: companiesRes, isLoading: isLoadingCompanies } = useAllCompanies();

    if (!isOpen) return null;

    const companies = companiesRes?.data || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        // Fill createdByUserId with selected company ID if empty for system record integrity
        const payload = {
            ...formValues,
            createdByUserId: formValues.createdByUserId || formValues.companyId,
        };

        // 1. Zod Validation Check
        const validation = orderCreateValidationSchema.safeParse(payload);
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

        // 2. Trigger Mutation
        createOrder(payload, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            {/* Modal Container */}
            <div className="relative w-full max-w-3xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuPackage className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">إضافة طلب شحنة جديد</h2>
                            <p className="text-xs text-body mt-0.5">إنشاء طلب جديد وتحديد بيانات المستلم والمدينة والقيم اللوجستية</p>
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
                    <div className="p-6 overflow-y-auto space-y-6 flex-1">

                        {/* Order & Company Info */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                بيانات الطلب والشركة المنشئة
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuHash className="w-3.5 h-3.5 text-body" />
                                        رقم الطلب <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.orderNumber}
                                        onChange={(e) => setFormValues({ ...formValues, orderNumber: e.target.value })}
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${
                                            fieldErrors.orderNumber ? 'border-rose-500' : 'border-border'
                                        }`}
                                    />
                                    {fieldErrors.orderNumber && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.orderNumber}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuBuilding2 className="w-3.5 h-3.5 text-body" />
                                        الشركة المنشئة للطلب <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        disabled={isSubmitting || isLoadingCompanies}
                                        value={formValues.companyId}
                                        onChange={(e) => setFormValues({ ...formValues, companyId: e.target.value })}
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50 ${
                                            fieldErrors.companyId ? 'border-rose-500' : 'border-border'
                                        }`}
                                    >
                                        <option value="">اختر الشركة...</option>
                                        {companies.map((comp) => (
                                            <option key={comp._id} value={comp._id}>
                                                {comp.companyName} ({comp.city})
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.companyId && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.companyId}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recipient Details */}
                        <div className="space-y-4 pt-2 border-t border-border">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                بيانات المستلم وموقع التوصيل
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuUser className="w-3.5 h-3.5 text-body" />
                                        اسم المستلم <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.recipientName}
                                        onChange={(e) => setFormValues({ ...formValues, recipientName: e.target.value })}
                                        placeholder="اسم المستلم الثلاثي"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-50 ${
                                            fieldErrors.recipientName ? 'border-rose-500' : 'border-border'
                                        }`}
                                    />
                                    {fieldErrors.recipientName && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.recipientName}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuPhone className="w-3.5 h-3.5 text-body" />
                                        جوال المستلم <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.recipientPhone}
                                        onChange={(e) => setFormValues({ ...formValues, recipientPhone: e.target.value })}
                                        placeholder="0501234567"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${
                                            fieldErrors.recipientPhone ? 'border-rose-500' : 'border-border'
                                        }`}
                                    />
                                    {fieldErrors.recipientPhone && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.recipientPhone}</span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuMapPin className="w-3.5 h-3.5 text-body" />
                                        المدينة <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.recipientCity}
                                        onChange={(e) => setFormValues({ ...formValues, recipientCity: e.target.value })}
                                        placeholder="الرياض، جدة، الدمام..."
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-50 ${
                                            fieldErrors.recipientCity ? 'border-rose-500' : 'border-border'
                                        }`}
                                    />
                                    {fieldErrors.recipientCity && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.recipientCity}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        الحي (اختياري)
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.recipientDistrict}
                                        onChange={(e) => setFormValues({ ...formValues, recipientDistrict: e.target.value })}
                                        placeholder="حي النرجس..."
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    العنوان التفصيلي <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.recipientAddress}
                                    onChange={(e) => setFormValues({ ...formValues, recipientAddress: e.target.value })}
                                    placeholder="شارع التخصصي، عمائر النصر..."
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-50 ${
                                        fieldErrors.recipientAddress ? 'border-rose-500' : 'border-border'
                                    }`}
                                />
                                {fieldErrors.recipientAddress && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.recipientAddress}</span>
                                )}
                            </div>
                        </div>

                        {/* Shipment Metrics */}
                        <div className="space-y-4 pt-2 border-t border-border">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                المواصفات والقيم اللوجستية
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuWeight className="w-3.5 h-3.5 text-body" />
                                        الوزن (كجم) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        disabled={isSubmitting}
                                        value={formValues.weight}
                                        onChange={(e) => setFormValues({ ...formValues, weight: Number(e.target.value) })}
                                        min={0.1}
                                        step={0.5}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        الكمية (عدد الطرود)
                                    </label>
                                    <input
                                        type="number"
                                        disabled={isSubmitting}
                                        value={formValues.quantity}
                                        onChange={(e) => setFormValues({ ...formValues, quantity: Number(e.target.value) })}
                                        min={1}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuCoins className="w-3.5 h-3.5 text-body" />
                                        قيمة الطلب <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        disabled={isSubmitting}
                                        value={formValues.orderValue}
                                        onChange={(e) => setFormValues({ ...formValues, orderValue: Number(e.target.value) })}
                                        min={0}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        مبلغ COD عند الاستلام
                                    </label>
                                    <input
                                        type="number"
                                        disabled={isSubmitting}
                                        value={formValues.codAmount}
                                        onChange={(e) => setFormValues({ ...formValues, codAmount: Number(e.target.value) })}
                                        min={0}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50"
                                    />
                                </div>
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
