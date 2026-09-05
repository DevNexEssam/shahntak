"use client";

import React, { useState, useEffect } from 'react';
import { useCreateCompanyShipment } from '@/hooks/company/useCompanyShipment';
import { useQueryClient } from '@tanstack/react-query';
import { COMPANY_ORDER_KEYS } from '@/hooks/company/useCompanyOrder';
import toast from 'react-hot-toast';
import {
    LuTruck,
    LuX,
    LuPackage,
    LuWeight,
    LuCoins,
    LuLayers
} from 'react-icons/lu';

interface GroupCompanyOrdersPopupProps {
    isOpen?: boolean;
    onClose: () => void;
    selectedOrders: any[];
    onSuccessGroup?: () => void;
}

export default function GroupCompanyOrdersPopup({
    isOpen = true,
    onClose,
    selectedOrders,
    onSuccessGroup
}: GroupCompanyOrdersPopupProps) {
    const [shipmentType, setShipmentType] = useState<'ftl' | 'ltl' | 'local_delivery'>('local_delivery');
    const [originCity, setOriginCity] = useState('الرياض');
    const [destinationCity, setDestinationCity] = useState(selectedOrders[0]?.recipientCity || 'الرياض');

    const totalWeight = selectedOrders.reduce((sum, ord) => sum + (Number(ord.weight) || 0), 0);
    const totalValue = selectedOrders.reduce((sum, ord) => sum + (Number(ord.orderValue) || 0), 0);

    const [shippingCost, setShippingCost] = useState<number>(0);
    const [customerPrice, setCustomerPrice] = useState<number>(totalValue);

    useEffect(() => {
        if (selectedOrders.length > 0) {
            const calculatedTotalValue = selectedOrders.reduce((sum, ord) => sum + (Number(ord.orderValue) || 0), 0);
            setCustomerPrice(calculatedTotalValue);
            if (selectedOrders[0]?.recipientCity) {
                setDestinationCity(selectedOrders[0].recipientCity);
            }
        }
    }, [selectedOrders]);

    const queryClient = useQueryClient();
    const { mutate: createCompanyShipment, isPending: isSubmitting } = useCreateCompanyShipment();

    if (!isOpen || selectedOrders.length === 0) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const orderIds = selectedOrders.map(o => o._id);
        const shipmentNumber = `SHP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        const payload = {
            shipmentNumber,
            type: shipmentType,
            origin: originCity,
            destination: destinationCity,
            shippingCost: Number(shippingCost) || 0,
            customerPrice: Number(customerPrice) || totalValue || 0,
            orderIds,
            status: 'created',
        };

        createCompanyShipment({ data: payload }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: COMPANY_ORDER_KEYS.lists() });
                toast.success(`تم تجميع ${selectedOrders.length} طلبات وإنشاء شحنة برقم ${shipmentNumber} بنجاح`);
                if (onSuccessGroup) onSuccessGroup();
                onClose();
            },
        });
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
                            <h2 className="text-xl font-extrabold text-heading">تجميع الطلبات في شحنة</h2>
                            <p className="text-xs text-body mt-0.5">دمج وتجميع الطلبات المحددة وتحويلها إلى شحنة مجمعة واحدة</p>
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

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-6 flex-1">

                        {/* Summary Box */}
                        <div className="p-5 rounded-2xl bg-accent-soft/40 border border-accent/20 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold text-accent flex items-center gap-2">
                                    <LuLayers className="w-4 h-4" />
                                    ملخص التجميع المباشر
                                </span>
                                <span className="px-3 py-1 rounded-full bg-accent text-white font-extrabold text-xs">
                                    {selectedOrders.length} طلبات محدده
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-2.5 rounded-xl bg-surface border border-border">
                                    <span className="text-[10px] text-body block font-medium">عدد الطلبات</span>
                                    <span className="font-extrabold text-heading font-latin">{selectedOrders.length}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-surface border border-border">
                                    <span className="text-[10px] text-body block font-medium">إجمالي الوزن</span>
                                    <span className="font-extrabold text-heading font-latin">{totalWeight} كجم</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-surface border border-border">
                                    <span className="text-[10px] text-body block font-medium">إجمالي القيمة</span>
                                    <span className="font-extrabold text-emerald-600 font-latin">{totalValue} ر.س</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipment Setup Form */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading">نوع الشحنة المجمعة</label>
                                <select
                                    value={shipmentType}
                                    onChange={(e) => setShipmentType(e.target.value as any)}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer"
                                >
                                    <option value="local_delivery">توصيل محلي (Local Delivery)</option>
                                    <option value="ltl">شحن جزئي </option>
                                    <option value="ftl">شحن كامل </option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading">مدينة الانطلاق (المصدر)</label>
                                    <input
                                        type="text"
                                        value={originCity}
                                        onChange={(e) => setOriginCity(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading">مدينة الوصول (الوجهة)</label>
                                    <input
                                        type="text"
                                        value={destinationCity}
                                        onChange={(e) => setDestinationCity(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading">تكلفة النقل الفعلي (ر.س)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={shippingCost}
                                        onChange={(e) => setShippingCost(Number(e.target.value) || 0)}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading">سعر الخدمة للعميل (ر.س)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={customerPrice}
                                        onChange={(e) => setCustomerPrice(Number(e.target.value) || 0)}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Selected Orders List preview */}
                        <div className="space-y-2 pt-2 border-t border-border">
                            <span className="text-xs font-bold text-body block">قائمة الطلبات المحددة للتجميع:</span>
                            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                                {selectedOrders.map((ord) => (
                                    <div key={ord._id} className="p-2.5 rounded-lg bg-surface-muted/60 border border-border flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <LuPackage className="w-3.5 h-3.5 text-accent" />
                                            <span className="font-extrabold text-heading font-latin">{ord.orderNumber}</span>
                                            <span className="text-body font-medium">- {ord.recipientName} ({ord.recipientCity})</span>
                                        </div>
                                        <span className="font-bold text-heading font-latin">{ord.weight} كجم</span>
                                    </div>
                                ))}
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
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[140px] justify-center"
                        >
                            {isSubmitting ? "جاري التجميع..." : "تجميع وإنشاء الشحنة"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
