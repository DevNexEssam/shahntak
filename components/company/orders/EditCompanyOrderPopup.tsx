"use client";

import React, { useState, useEffect } from 'react';
import { useUpdateCompanyOrder } from '@/hooks/company/useCompanyOrder';
import toast from 'react-hot-toast';
import {
    LuPackage,
    LuX,
    LuUser,
    LuPhone,
    LuMapPin,
    LuCoins,
    LuWeight,
    LuHash
} from 'react-icons/lu';

interface EditCompanyOrderPopupProps {
    isOpen?: boolean;
    onClose: () => void;
    orderData: any;
}

export default function EditCompanyOrderPopup({ isOpen = true, onClose, orderData }: EditCompanyOrderPopupProps) {
    const [formValues, setFormValues] = useState({
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
    });

    useEffect(() => {
        if (orderData) {
            setFormValues({
                recipientName: orderData.recipientName || '',
                recipientPhone: orderData.recipientPhone || '',
                recipientCity: orderData.recipientCity || '',
                recipientDistrict: orderData.recipientDistrict || '',
                recipientAddress: orderData.recipientAddress || '',
                description: orderData.description || '',
                quantity: orderData.quantity || 1,
                weight: orderData.weight || 1,
                orderValue: orderData.orderValue || 0,
                codAmount: orderData.codAmount || 0,
                status: orderData.status || 'pending',
            });
        }
    }, [orderData]);

    const { mutate: updateOrder, isPending: isSubmitting } = useUpdateCompanyOrder();

    if (!isOpen || !orderData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        updateOrder(
            { id: orderData._id, updates: formValues },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-3xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuPackage className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تعديل بيانات الطلب</h2>
                            <p className="text-xs text-body mt-0.5">تعديل بيانات المستلم والحالة والوزن والقيم اللوجستية</p>
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-6 flex-1">

                        {/* Order Code & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuHash className="w-3.5 h-3.5 text-accent" />
                                    رقم الطلب
                                </label>
                                <div className="w-full px-4 py-2.5 rounded-md bg-surface-muted/70 border border-border text-sm font-extrabold text-accent font-latin">
                                    {orderData.orderNumber}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading">حالة الطلب</label>
                                <select
                                    value={formValues.status}
                                    onChange={(e) => setFormValues({ ...formValues, status: e.target.value as any })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer"
                                >
                                    <option value="pending">قيد الانتظار</option>
                                    <option value="validated">مؤكد</option>
                                    <option value="grouped">مجمع بشحنة</option>
                                    <option value="shipped">تم الشحن</option>
                                    <option value="delivered">تم التوصيل</option>
                                    <option value="cancelled">ملغي</option>
                                    <option value="error">خطأ في البيانات</option>
                                </select>
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
                                        اسم المستلم
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.recipientName}
                                        onChange={(e) => setFormValues({ ...formValues, recipientName: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuPhone className="w-3.5 h-3.5 text-body" />
                                        جوال المستلم
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.recipientPhone}
                                        onChange={(e) => setFormValues({ ...formValues, recipientPhone: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuMapPin className="w-3.5 h-3.5 text-body" />
                                        المدينة
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.recipientCity}
                                        onChange={(e) => setFormValues({ ...formValues, recipientCity: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading">الحي</label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.recipientDistrict}
                                        onChange={(e) => setFormValues({ ...formValues, recipientDistrict: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading">العنوان التفصيلي</label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.recipientAddress}
                                    onChange={(e) => setFormValues({ ...formValues, recipientAddress: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        {/* Specs */}
                        <div className="space-y-4 pt-2 border-t border-border">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                المواصفات والقيم اللوجستية
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuWeight className="w-3.5 h-3.5 text-body" />
                                        الوزن (كجم)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        disabled={isSubmitting}
                                        value={formValues.weight}
                                        onChange={(e) => setFormValues({ ...formValues, weight: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading">الكمية</label>
                                    <input
                                        type="number"
                                        disabled={isSubmitting}
                                        value={formValues.quantity}
                                        onChange={(e) => setFormValues({ ...formValues, quantity: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuCoins className="w-3.5 h-3.5 text-body" />
                                        قيمة الطلب
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        disabled={isSubmitting}
                                        value={formValues.orderValue}
                                        onChange={(e) => setFormValues({ ...formValues, orderValue: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading">مبلغ COD</label>
                                    <input
                                        type="number"
                                        step="any"
                                        disabled={isSubmitting}
                                        value={formValues.codAmount}
                                        onChange={(e) => setFormValues({ ...formValues, codAmount: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
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
                            {isSubmitting ? "جاري التحديث..." : "حفظ التعديلات"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
