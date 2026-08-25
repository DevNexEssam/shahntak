"use client";

import React from 'react';
import { Order, Company } from '@/types/data';
import {
    LuPackage,
    LuX,
    LuUser,
    LuPhone,
    LuMapPin,
    LuBuilding2,
    LuCalendar,
    LuCoins,
    LuWeight,
    LuHash,
    LuFileText
} from 'react-icons/lu';

interface DetailsOrdersProps {
    isOpen?: boolean;
    order: Order | null;
    onClose: () => void;
}

export default function DetailsOrders({ isOpen = true, order, onClose }: DetailsOrdersProps) {
    if (!isOpen || !order) return null;

    const companyName = typeof order.companyId === 'object' && order.companyId !== null
        ? (order.companyId as Company).companyName
        : 'شركة غير محددة';

    const statusMap = {
        pending: { label: 'معلق (Pending)', bg: 'bg-amber-500/10 text-amber-600 border-amber-200' },
        validated: { label: 'مكتمل الفحص (Validated)', bg: 'bg-blue-500/10 text-blue-600 border-blue-200' },
        error: { label: 'خطأ بالبيانات (Error)', bg: 'bg-rose-500/10 text-rose-600 border-rose-200' },
        grouped: { label: 'مجمع بشحنة (Grouped)', bg: 'bg-purple-500/10 text-purple-600 border-purple-200' },
        shipped: { label: 'جاري الشحن (Shipped)', bg: 'bg-cyan-500/10 text-cyan-600 border-cyan-200' },
        delivered: { label: 'تم التسليم (Delivered)', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
        cancelled: { label: 'ملغي (Cancelled)', bg: 'bg-slate-500/10 text-slate-600 border-slate-200' },
    }[order.status || 'pending'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuPackage className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تفاصيل بيانات الطلب</h2>
                            <p className="text-xs text-body mt-0.5">عرض معلومات الشحنة والمستلم والمدينة والقيم المالية</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">

                    {/* Top Identity Card */}
                    <div className="p-4 rounded-2xl bg-surface-muted border border-border flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-md bg-accent-soft text-accent font-extrabold text-lg flex items-center justify-center border border-accent/20">
                                <LuHash className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xs text-body block font-medium">رقم الطلب</span>
                                <h3 className="text-lg font-extrabold text-heading font-latin">{order.orderNumber}</h3>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusMap.bg}`}>
                                {statusMap.label}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface border border-border text-body">
                                {order.source === 'bulk_upload' ? 'رفع جماعي' : 'إدخال يدوي'}
                            </span>
                        </div>
                    </div>

                    {/* Company & Recipient Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <LuBuilding2 className="w-4 h-4" />
                                الشركة المنشئة
                            </h4>
                            <div className="text-sm font-bold text-heading pt-1">
                                {companyName}
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <LuUser className="w-4 h-4" />
                                بيانات المستلم
                            </h4>
                            <div className="text-sm space-y-1 pt-1">
                                <div className="font-bold text-heading">{order.recipientName}</div>
                                <div className="text-xs text-body font-latin flex items-center gap-1">
                                    <LuPhone className="w-3 h-3 text-accent" />
                                    {order.recipientPhone}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border space-y-2">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-heading flex items-center gap-2">
                            <LuMapPin className="w-4 h-4 text-accent" />
                            عنوان وموقع التوصيل
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm pt-1">
                            <div>
                                <span className="text-xs text-body block font-medium">المدينة:</span>
                                <span className="font-bold text-heading">{order.recipientCity}</span>
                            </div>
                            {order.recipientDistrict && (
                                <div>
                                    <span className="text-xs text-body block font-medium">الحي:</span>
                                    <span className="font-bold text-heading">{order.recipientDistrict}</span>
                                </div>
                            )}
                            <div className="md:col-span-3">
                                <span className="text-xs text-body block font-medium">العنوان تفصيلاً:</span>
                                <span className="font-bold text-heading">{order.recipientAddress}</span>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-2xl bg-surface border border-border text-center">
                            <LuWeight className="w-5 h-5 text-accent mx-auto mb-1" />
                            <span className="text-xs text-body block font-medium">الوزن</span>
                            <span className="text-sm font-bold text-heading font-latin">{order.weight} كجم</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-surface border border-border text-center">
                            <LuPackage className="w-5 h-5 text-accent mx-auto mb-1" />
                            <span className="text-xs text-body block font-medium">الكمية</span>
                            <span className="text-sm font-bold text-heading font-latin">{order.quantity} طرد</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-surface border border-border text-center">
                            <LuCoins className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                            <span className="text-xs text-body block font-medium">قيمة الطلب</span>
                            <span className="text-sm font-bold text-heading font-latin">{order.orderValue} ر.س</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-surface border border-border text-center">
                            <LuCoins className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                            <span className="text-xs text-body block font-medium">مبلغ COD</span>
                            <span className="text-sm font-bold text-heading font-latin">{order.codAmount || 0} ر.س</span>
                        </div>
                    </div>

                    {/* Description if present */}
                    {order.description && (
                        <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                            <span className="text-xs font-bold text-body flex items-center gap-1.5">
                                <LuFileText className="w-3.5 h-3.5 text-accent" />
                                وصف محتوى الشحنة
                            </span>
                            <p className="text-sm text-heading">{order.description}</p>
                        </div>
                    )}

                    {/* Dates Footer */}
                    <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-body">
                        <div className="flex items-center gap-1.5">
                            <LuCalendar className="w-3.5 h-3.5 text-body/60" />
                            <span>تاريخ الإنشاء: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-latin">
                            <LuHash className="w-3.5 h-3.5 text-body/60" />
                            <span>ID: {order._id}</span>
                        </div>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-border bg-surface-muted/40 flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-xs hover:shadow transition-all cursor-pointer"
                    >
                        إغلاق
                    </button>
                </div>

            </div>
        </div>
    );
}
