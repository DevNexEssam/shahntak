"use client";

import React, { useState, useEffect } from 'react';
import { useUpdateCompanyShipment } from '@/hooks/company/useCompanyShipment';
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

interface EditCompanyShipmentPopupProps {
    isOpen?: boolean;
    onClose: () => void;
    shipmentData: any;
}

export default function EditCompanyShipmentPopup({ isOpen = true, onClose, shipmentData }: EditCompanyShipmentPopupProps) {
    const [formValues, setFormValues] = useState({
        type: 'local_delivery' as 'ftl' | 'ltl' | 'local_delivery',
        origin: '',
        destination: '',
        shippingCost: 0,
        customerPrice: 0,
        status: 'created' as const,
    });

    useEffect(() => {
        if (shipmentData) {
            setFormValues({
                type: shipmentData.type || 'local_delivery',
                origin: shipmentData.origin || '',
                destination: shipmentData.destination || '',
                shippingCost: shipmentData.shippingCost || 0,
                customerPrice: shipmentData.customerPrice || 0,
                status: shipmentData.status || 'created',
            });
        }
    }, [shipmentData]);

    const { mutate: updateShipment, isPending: isSubmitting } = useUpdateCompanyShipment();

    if (!isOpen || !shipmentData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        updateShipment(
            { id: shipmentData._id, updates: formValues },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuTruck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تعديل بيانات وتعيين الشحنة</h2>
                            <p className="text-xs text-body mt-0.5">تعديل المسارات وحالة الشحنة والتكاليف</p>
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

                        {/* Shipment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuHash className="w-3.5 h-3.5 text-accent" />
                                    رقم الشحنة
                                </label>
                                <div className="w-full px-4 py-2.5 rounded-md bg-surface-muted/70 border border-border text-sm font-extrabold text-accent font-latin">
                                    {shipmentData.shipmentNumber}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading">حالة الشحنة والتتبع</label>
                                <select
                                    value={formValues.status}
                                    onChange={(e) => setFormValues({ ...formValues, status: e.target.value as any })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer font-bold"
                                >
                                    <option value="created">حديثة / تم الإنشاء</option>
                                    <option value="confirmed">مؤكدة</option>
                                    <option value="assigned">معينة لناقل</option>
                                    <option value="ready_for_pickup">جاهزة للاستلام</option>
                                    <option value="picked_up">تم الاستلام</option>
                                    <option value="in_transit">في الطريق / جاري الشحن</option>
                                    <option value="arrived">وصلت للمركز</option>
                                    <option value="out_for_delivery">خرجت للتوصيل</option>
                                    <option value="delivered">تم التوصيل بنجاح</option>
                                    <option value="delivery_failed">فشل التوصيل</option>
                                    <option value="cancelled">ملغية</option>
                                    <option value="returned">مرتجعة</option>
                                    <option value="exception">حالة استثنائية</option>
                                </select>
                            </div>
                        </div>

                        {/* Type & Route */}
                        <div className="space-y-4 pt-2 border-t border-border">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                نوع الشحنة والمسار اللوجستي
                            </h3>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading">نوع الشحنة</label>
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
                                        المصدر
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.origin}
                                        onChange={(e) => setFormValues({ ...formValues, origin: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuMapPin className="w-3.5 h-3.5 text-body" />
                                        الوجهة
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.destination}
                                        onChange={(e) => setFormValues({ ...formValues, destination: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="space-y-4 pt-2 border-t border-border">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                التكاليف والأسعار
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuCoins className="w-3.5 h-3.5 text-body" />
                                        سعر العميل (ر.س)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        disabled={isSubmitting}
                                        value={formValues.customerPrice}
                                        onChange={(e) => setFormValues({ ...formValues, customerPrice: Number(e.target.value) })}
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
