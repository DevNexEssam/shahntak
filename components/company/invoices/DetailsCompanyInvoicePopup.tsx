/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import {
    LuReceipt,
    LuX,
    LuCoins,
    LuTruck,
    LuMapPin,
    LuPackage,
    LuFileText,
    LuDownload,
    LuLoader
} from 'react-icons/lu';
import { InvoicePDFDocument } from './InvoicePDFDocument';

interface DetailsCompanyInvoicePopupProps {
    isOpen?: boolean;
    onClose: () => void;
    invoiceData: any;
}

export default function DetailsCompanyInvoicePopup({
    isOpen = true,
    onClose,
    invoiceData
}: DetailsCompanyInvoicePopupProps) {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    if (!isOpen || !invoiceData) return null;

    const handleDownloadPdf = async () => {
        try {
            setIsGeneratingPdf(true);
            const { pdf } = await import('@react-pdf/renderer');
            const blob = await pdf(<InvoicePDFDocument invoiceData={invoiceData} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Invoice_${invoiceData.invoiceNumber || 'details'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to generate PDF:', err);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600">
                        مسدد ومحصل
                    </span>
                );
            case 'issued':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-accent/10 text-accent">
                        صادرة ومعلقة
                    </span>
                );
            case 'overdue':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600">
                        متأخرة السداد
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-surface-muted text-muted-foreground">
                        مسودة
                    </span>
                );
        }
    };

    const linkedShipment = invoiceData.shipment || (invoiceData.invoiceShipments && invoiceData.invoiceShipments[0]);

    const taxRate = Number(invoiceData.taxRateSnapshot ?? invoiceData.taxRate ?? 15);
    const discount = Number(invoiceData.discount || 0);
    const rawTotal = Number(invoiceData.total ?? invoiceData.amount ?? invoiceData.totalAmount ?? 0);
    const rateMultiplier = 1 + (taxRate / 100);

    const shippingCost = linkedShipment ? Number(linkedShipment.customerPrice || linkedShipment.shippingCost || 0) : 0;
    const subtotalVal = Number(invoiceData.subtotal || 0);
    const basePrice = subtotalVal > 0
        ? subtotalVal
        : (shippingCost > 0
            ? shippingCost
            : (rawTotal > 0 ? Math.round(((rawTotal / rateMultiplier) + discount) * 100) / 100 : 0));

    const discountedSubtotal = Math.max(0, basePrice - discount);
    const vatAmount = Number(invoiceData.vatAmount ?? Math.round((discountedSubtotal * (taxRate / 100)) * 100) / 100);
    const finalTotal = Number(invoiceData.total ?? Math.round((discountedSubtotal + vatAmount) * 100) / 100);

    const getShipmentTypeName = (type?: string) => {
        switch (type) {
            case 'ftl': return 'شحن نقل كامل (FTL)';
            case 'ltl': return 'شحن طرود جزئية (LTL)';
            case 'local_delivery': return 'توصيل محلي للميل الأخير';
            default: return 'خدمة نقل شحن لوجستي';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150" dir="rtl">
            <div className="printable-area w-full max-w-xl bg-surface border border-border rounded-md shadow-xs overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-surface shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuReceipt className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-foreground">تفاصيل الفاتورة الضريبية</h2>
                                {getStatusBadge(invoiceData.status)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 font-latin">رقم الفاتورة: <span className="font-semibold text-accent">{invoiceData.invoiceNumber}</span></p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md hover:bg-surface-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 overflow-y-auto">

                    {/* Summary Info Row */}
                    <div className="p-4 rounded-md bg-surface-muted border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div>
                            <span className="text-muted-foreground block">تاريخ الإصدار الرسمي</span>
                            <span className="font-bold text-foreground font-latin text-sm">
                                {new Date(invoiceData.createdAt || Date.now()).toLocaleDateString('ar-SA')}
                            </span>
                        </div>

                        <div>
                            <span className="text-muted-foreground block">تاريخ الاستحقاق</span>
                            <span className="font-bold text-accent font-latin text-sm">
                                {invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('ar-SA') : 'عند الاستلام'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleDownloadPdf}
                                disabled={isGeneratingPdf}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                            >
                                {isGeneratingPdf ? (
                                    <LuLoader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <LuDownload className="w-4 h-4" />
                                )}
                                <span>{isGeneratingPdf ? 'جاري التحميل...' : 'تنزيل PDF'}</span>
                            </button>


                        </div>
                    </div>

                    {/* Issuer Company Details Card */}
                    <div className="p-4 rounded-md border border-border bg-surface space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-border pb-1.5">
                            <span className="font-bold text-foreground">بيانات المنشأة الموردة / الشركة</span>
                            <span className="text-[10px] font-extrabold text-accent bg-accent/10 px-2 py-0.5 rounded">ZATCA Verified</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                                <span className="text-muted-foreground">اسم الشركة: </span>
                                <span className="font-bold text-foreground">{invoiceData.companyId?.companyName || invoiceData.companyName || 'شركة الشحن المشتركة'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">الرقم الضريبي: </span>
                                <span className="font-bold font-latin text-accent">{invoiceData.companyId?.taxNumber || '310459871200003'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">المدينة والعنوان: </span>
                                <span className="font-medium text-foreground">{invoiceData.companyId?.city || 'الرياض'} - {invoiceData.companyId?.address || 'المملكة العربية السعودية'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">التواصل: </span>
                                <span className="font-medium font-latin text-foreground">{invoiceData.companyId?.phone || invoiceData.companyId?.email || 'support@shahntak.sa'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipment & Shipping Details Card */}
                    <div className="p-4 rounded-md border border-accent/30 bg-accent/5 space-y-3">
                        <div className="flex items-center justify-between border-b border-accent/20 pb-2">
                            <h3 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                                <LuTruck className="w-4 h-4 text-accent" />
                                <span>تفاصيل الشحنة وتكلفة النقل اللوجستي</span>
                            </h3>
                            {linkedShipment?.type && (
                                <span className="text-[11px] font-bold text-accent px-2 py-0.5 rounded bg-surface border border-accent/20">
                                    {getShipmentTypeName(linkedShipment.type)}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-surface p-2.5 rounded border border-border">
                                <span className="text-muted-foreground block text-[11px] mb-0.5">رقم الشحنة المربوطة</span>
                                <span className="font-bold text-accent font-latin text-sm">
                                    {linkedShipment?.shipmentNumber || invoiceData.shipmentNumber || 'شحنة عامة'}
                                </span>
                            </div>

                            <div className="bg-surface p-2.5 rounded border border-border">
                                <span className="text-muted-foreground block text-[11px] mb-0.5">مسار النقل</span>
                                <span className="font-bold text-foreground flex items-center gap-1">
                                    <LuMapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                                    <span>{linkedShipment?.origin || 'الرياض'} ⬅️ {linkedShipment?.destination || 'جدة'}</span>
                                </span>
                            </div>

                            <div className="bg-surface p-2.5 rounded border border-border">
                                <span className="text-muted-foreground block text-[11px] mb-0.5">رقم بوليسة الشحن</span>
                                <span className="font-semibold text-foreground font-latin flex items-center gap-1">
                                    <LuFileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span>{linkedShipment?.waybillNumber || (linkedShipment ? `WB-${new Date().getFullYear()}-${linkedShipment._id?.toString().slice(-6).toUpperCase()}` : 'فاتورة غير مرتبطة بشحنة')}</span>
                                </span>
                            </div>

                            <div className="bg-surface p-2.5 rounded border border-border">
                                <span className="text-muted-foreground block text-[11px] mb-0.5">عدد الطلبات / الطرود</span>
                                <span className="font-semibold text-foreground font-latin flex items-center gap-1">
                                    <LuPackage className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span>{linkedShipment?.ordersCount || 1} طرد</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Financial Breakdown Table */}
                    <div className="p-4 rounded-md border border-border bg-surface space-y-3">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <LuCoins className="w-4 h-4 text-accent" />
                                <span>جدول رسوم الشحن والضريبة المستحقة</span>
                            </h3>
                            <span className="text-[10px] font-extrabold text-accent px-2 py-0.5 rounded bg-accent/10 font-latin">
                                النسبة وقت الإصدار: {taxRate}%
                            </span>
                        </div>

                        {taxRate === 0 && invoiceData.vatExemptionReason && (
                            <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs">
                                <span className="font-bold block mb-0.5">سبب الإعفاء الضريبي الرسمي ( Exemption):</span>
                                <p>{invoiceData.vatExemptionReason}</p>
                            </div>
                        )}

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-2 border-b border-border">
                                <div>
                                    <span className="font-bold text-foreground block">تكلفة خدمة الشحن والنقل اللوجستي</span>
                                    <span className="text-[10px] text-muted-foreground block">المبلغ الأساسي للشحنة (قبل الخصم والضريبة)</span>
                                </div>
                                <span className="font-bold text-foreground font-latin text-sm">{basePrice.toFixed(2)} ر.س</span>
                            </div>

                            {discount > 0 && (
                                <div className="flex justify-between items-center py-1.5 border-b border-border text-emerald-600 bg-emerald-500/10 px-2 rounded">
                                    <span className="font-semibold">مبلغ الخصم التجاري/المالي</span>
                                    <span className="font-bold font-latin">-{discount.toFixed(2)} ر.س</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">الصافي الخاضع للضريبة</span>
                                <span className="font-semibold text-foreground font-latin">{discountedSubtotal.toFixed(2)} ر.س</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">ضريبة القيمة المضافة ({taxRate}%)</span>
                                <span className="font-semibold text-foreground font-latin">{vatAmount.toFixed(2)} ر.س</span>
                            </div>

                            <div className="flex justify-between items-center pt-2 text-sm font-bold">
                                <span className="text-foreground">الإجمالي الكلي المستحق (شامل الشحن والضريبة)</span>
                                <span className="text-accent font-latin text-base font-bold">{finalTotal.toFixed(2)} ر.س</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-surface-muted flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-semibold rounded-md border border-border bg-surface hover:bg-border/20 transition-colors text-foreground cursor-pointer"
                    >
                        إغلاق
                    </button>
                </div>

            </div>
        </div>
    );
}

