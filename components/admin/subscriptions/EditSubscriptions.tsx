"use client";

import React, { useState, useEffect } from 'react';
import { useUpdateSubscription } from '@/hooks/subscriptions/useSubscriptions';
import { useAllPlans } from '@/hooks/plans/usePlans';
import { subscriptionUpdateValidationSchema } from '@/lib/validations/subscription.schema';
import { Subscription } from '@/types/data';
import toast from 'react-hot-toast';
import {
    LuCrown,
    LuX,
    LuCreditCard,
    LuCalendar
} from 'react-icons/lu';

interface EditSubscriptionsProps {
    isOpen?: boolean;
    subscription: Subscription | null;
    onClose: () => void;
}

export default function EditSubscriptions({ isOpen = true, subscription, onClose }: EditSubscriptionsProps) {
    const [formValues, setFormValues] = useState({
        planId: '',
        startDate: '',
        endDate: '',
        status: 'active' as 'active' | 'expired' | 'pending_payment' | 'cancelled',
        ordersUsedThisMonth: 0,
        shipmentsUsedThisMonth: 0,
        autoRenew: true,
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: updateSubscription, isPending: isSubmitting } = useUpdateSubscription();
    const { data: plansRes, isLoading: isLoadingPlans } = useAllPlans();

    useEffect(() => {
        if (subscription) {
            const pid = typeof subscription.planId === 'object' && subscription.planId !== null ? subscription.planId._id : (subscription.planId as string);
            setFormValues({
                planId: pid || '',
                startDate: subscription.startDate ? new Date(subscription.startDate).toISOString().split('T')[0] : '',
                endDate: subscription.endDate ? new Date(subscription.endDate).toISOString().split('T')[0] : '',
                status: subscription.status || 'active',
                ordersUsedThisMonth: subscription.ordersUsedThisMonth || 0,
                shipmentsUsedThisMonth: subscription.shipmentsUsedThisMonth || 0,
                autoRenew: subscription.autoRenew ?? true,
            });
            setFieldErrors({});
        }
    }, [subscription]);

    if (!isOpen || !subscription) return null;

    const plans = plansRes?.data || [];
    const companyName = typeof subscription.companyId === 'object' && subscription.companyId !== null ? subscription.companyId.companyName : 'الشركة المشتركة';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const validation = subscriptionUpdateValidationSchema.safeParse(formValues);
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

        updateSubscription({ id: subscription._id, updates: formValues }, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header (Identical to AddSubscriptions) */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuCrown className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تحديث اشتراك ({companyName})</h2>
                            <p className="text-xs text-body mt-0.5">تعديل الباقة، الترقية، وتجديد مدة الاشتراك والحصص</p>
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

                        {/* Plan Selection */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuCreditCard className="w-3.5 h-3.5 text-body" />
                                الباقة السحابية المشترك بها
                            </label>
                            <select
                                disabled={isSubmitting || isLoadingPlans}
                                value={formValues.planId}
                                onChange={(e) => setFormValues({ ...formValues, planId: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                            >
                                <option value="">اختر الباقة...</option>
                                {plans.map((pl) => (
                                    <option key={pl._id} value={pl._id}>
                                        {pl.name} - {pl.price} ر.س / {pl.billingCycle === 'monthly' ? 'شهرياً' : 'سنوياً'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCalendar className="w-3.5 h-3.5 text-body" />
                                    تاريخ بدء الاشتراك
                                </label>
                                <input
                                    type="date"
                                    disabled={isSubmitting}
                                    value={formValues.startDate}
                                    onChange={(e) => setFormValues({ ...formValues, startDate: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent cursor-pointer"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCalendar className="w-3.5 h-3.5 text-body" />
                                    تاريخ انتهاء الاشتراك
                                </label>
                                <input
                                    type="date"
                                    disabled={isSubmitting}
                                    value={formValues.endDate}
                                    onChange={(e) => setFormValues({ ...formValues, endDate: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Quota reset/edits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading block">
                                    الطلبات المستهلكة هذا الشهر
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.ordersUsedThisMonth}
                                    onChange={(e) => setFormValues({ ...formValues, ordersUsedThisMonth: Number(e.target.value) })}
                                    min={0}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading block">
                                    الشحنات المستهلكة هذا الشهر
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.shipmentsUsedThisMonth}
                                    onChange={(e) => setFormValues({ ...formValues, shipmentsUsedThisMonth: Number(e.target.value) })}
                                    min={0}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading block">
                                حالة الاشتراك
                            </label>
                            <select
                                disabled={isSubmitting}
                                value={formValues.status}
                                onChange={(e) => setFormValues({ ...formValues, status: e.target.value as any })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                            >
                                <option value="active">نشط وساري</option>
                                <option value="pending_payment">بانتظار التأكيد أو الدفع</option>
                                <option value="expired">منتهي الصلاحية</option>
                                <option value="cancelled">ملغى</option>
                            </select>
                        </div>

                    </div>

                    {/* Modal Footer (Identical to AddSubscriptions) */}
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
                            {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
