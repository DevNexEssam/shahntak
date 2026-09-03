"use client";

import React, { useState } from 'react';
import { useCreateCompanyShipment } from '@/hooks/company/useCompanyShipment';
import toast from 'react-hot-toast';
import {
    LuTruck,
    LuX,
    LuMapPin,
    LuCoins,
    LuHash,
    LuReceipt,
    LuLayers
} from 'react-icons/lu';

interface AddCompanyShipmentPopupProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddCompanyShipmentPopup({ isOpen = true, onClose }: AddCompanyShipmentPopupProps) {
    const [formValues, setFormValues] = useState({
        type: 'local_delivery' as 'ftl' | 'ltl' | 'local_delivery',
        origin: 'الرياض',
        destination: 'جدة',
        ordersCount: 1,
        shippingCost: 0,
        customerPrice: 0,
        status: 'created' as const,
    });

    const { mutate: createShipment, isPending: isSubmitting } = useCreateCompanyShipment();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const shipmentNumber = `SHP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const waybillNumber = `WB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const trackingNumber = `TRK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        const payload = {
            ...formValues,
            shipmentNumber,
            waybillNumber,
            trackingNumber,
        };

        createShipment({ data: payload }, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuTruck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">إنشاء شحنة جديدة</h2>
                            <p className="text-xs text-body mt-0.5">تأطير بيانات الشحنة والمسار والتكلفة المالية لشركتك</p>
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

                        {/* Shipment Auto Numbers */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                التوليد الآلي لأرقام البوليصة والشحنة
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuHash className="w-3.5 h-3.5 text-accent" />
                                        رقم الشحنة التلقائي
                                    </label>
                                    <div className="w-full px-4 py-2.5 rounded-md bg-surface-muted/70 border border-border text-sm font-extrabold text-accent font-latin flex items-center justify-between">
                                        <span>توليد تلقائي (SHP-XXXXX)</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuReceipt className="w-3.5 h-3.5 text-accent" />
                                        رقم البوليصة الرسمية
                                    </label>
                                    <div className="w-full px-4 py-2.5 rounded-md bg-surface-muted/70 border border-border text-sm font-extrabold text-accent font-latin flex items-center justify-between">
                                        <span>توليد تلقائي (WB-XXXXX)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Route & Type Details */}
                        <div className="space-y-4 pt-2 border-t border-border">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                نوع الشحنة والمسار اللوجستي
                            </h3>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading">نوع الشحنة <span className="text-red-500">*</span></label>
                                <select
                                    value={formValues.type}
                                    onChange={(e) => setFormValues({ ...formValues, type: e.target.value as any })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer"
                                >
                                    <option value="local_delivery">توصيل محلي (Local Delivery)</option>
                                    <option value="ltl">شحن جزئي (LTL)</option>
                                    <option value="ftl">شحن كامل (FTL)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuMapPin className="w-3.5 h-3.5 text-body" />
                                        مدينة الانطلاق (المصدر) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.origin}
                                        onChange={(e) => setFormValues({ ...formValues, origin: e.target.value })}
                                        placeholder="الرياض"
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuMapPin className="w-3.5 h-3.5 text-body" />
                                        مدينة الوصول (الوجهة) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.destination}
                                        onChange={(e) => setFormValues({ ...formValues, destination: e.target.value })}
                                        placeholder="جدة، الدمام..."
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Financial Metrics */}
                        <div className="space-y-4 pt-2 border-t border-border">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                المواصفات المالية للعميل والناقل
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuLayers className="w-3.5 h-3.5 text-body" />
                                        عدد الطلبات المرفقة
                                    </label>
                                    <input
                                        type="number"
                                        disabled={isSubmitting}
                                        value={formValues.ordersCount}
                                        onChange={(e) => setFormValues({ ...formValues, ordersCount: Number(e.target.value) })}
                                        min={1}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuCoins className="w-3.5 h-3.5 text-body" />
                                        التكلفة التشغيلية (ر.س)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        disabled={isSubmitting}
                                        value={formValues.shippingCost}
                                        onChange={(e) => setFormValues({ ...formValues, shippingCost: Number(e.target.value) })}
                                        min={0}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuCoins className="w-3.5 h-3.5 text-body" />
                                        سعر العميل النهائي (ر.س)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        disabled={isSubmitting}
                                        value={formValues.customerPrice}
                                        onChange={(e) => setFormValues({ ...formValues, customerPrice: Number(e.target.value) })}
                                        min={0}
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
                            {isSubmitting ? "جاري الإنشـاء..." : "حفظ الشحنة"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
