/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { Invoice, Company } from '@/types/data';
import {
    LuReceipt,
    LuX,
    LuCoins,
    LuTruck,
    LuMapPin,
    LuPackage,
    LuFileText,
    LuDownload,
    LuLoader,
    LuBuilding2
} from 'react-icons/lu';
import toast from 'react-hot-toast';

interface DetailsInvoicesProps {
    isOpen?: boolean;
    invoice: Invoice | null;
    onClose: () => void;
}

export default function DetailsInvoices({ isOpen = true, invoice, onClose }: DetailsInvoicesProps) {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    if (!isOpen || !invoice) return null;

    const handleDownloadZatcaPdf = async () => {
        try {
            setIsGeneratingPdf(true);
            toast.loading(`Preparing and downloading ZATCA tax invoice (${invoice.invoiceNumber})...`, { id: 'admin-pdf-toast' });
            const { pdf } = await import('@react-pdf/renderer');
            const { InvoicePDFDocument } = await import('@/components/company/invoices/InvoicePDFDocument');

            const blob = await pdf(<InvoicePDFDocument invoiceData={invoice} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ZATCA_Invoice_${invoice.invoiceNumber || 'download'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success(`Invoice (${invoice.invoiceNumber}) downloaded successfully!`, { id: 'admin-pdf-toast' });
        } catch (error) {
            console.error("Error generating ZATCA Invoice PDF:", error);
            toast.error('An error occurred while generating the PDF file', { id: 'admin-pdf-toast' });
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Paid & Collected
                    </span>
                );
            case 'issued':
                return (
                    <span className="px-2.5 py-1 text-xs font-bold rounded bg-sky-500/10 text-sky-600 border border-sky-500/20">
                        Issued & Pending
                    </span>
                );
            case 'overdue':
                return (
                    <span className="px-2.5 py-1 text-xs font-bold rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        Overdue
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-xs font-bold rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Draft
                    </span>
                );
        }
    };

    const companyData = typeof invoice.companyId === 'object' && invoice.companyId !== null
        ? (invoice.companyId as Company)
        : null;

    const companyName = companyData?.companyName || 'Unspecified Company';
    const linkedShipment = (invoice as any).shipment || ((invoice as any).invoiceShipments && (invoice as any).invoiceShipments[0]);

    const taxRate = Number((invoice as any).taxRateSnapshot ?? (invoice as any).taxRate ?? 15);
    const discount = Number((invoice as any).discount || 0);
    const rawTotal = Number(invoice.total ?? (invoice as any).amount ?? (invoice as any).totalAmount ?? 0);
    const rateMultiplier = 1 + (taxRate / 100);

    const shippingCost = linkedShipment ? Number(linkedShipment.customerPrice || linkedShipment.shippingCost || 0) : 0;
    const subtotalVal = Number((invoice as any).subtotal || 0);
    const basePrice = subtotalVal > 0
        ? subtotalVal
        : (shippingCost > 0
            ? shippingCost
            : (rawTotal > 0 ? Math.round(((rawTotal / rateMultiplier) + discount) * 100) / 100 : 0));

    const discountedSubtotal = Math.max(0, basePrice - discount);
    const vatAmount = Number((invoice as any).vatAmount ?? Math.round((discountedSubtotal * (taxRate / 100)) * 100) / 100);
    const finalTotal = Number(invoice.total ?? Math.round((discountedSubtotal + vatAmount) * 100) / 100);

    const getShipmentTypeName = (type?: string) => {
        switch (type) {
            case 'ftl': return 'Full Truckload (FTL)';
            case 'ltl': return 'Less-Than-Truckload (LTL)';
            case 'local_delivery': return 'Local Last-Mile Delivery';
            default: return 'Logistics Shipping Service';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-150 text-left" dir="ltr">
            <div className="printable-area w-full max-w-xl bg-surface border border-border rounded-md shadow-xs overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-surface shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuReceipt className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-heading">ZATCA Tax Invoice Details</h2>
                                {getStatusBadge(invoice.status)}
                            </div>
                            <p className="text-xs text-body mt-0.5 font-latin">Invoice No.: <span className="font-semibold text-accent">{invoice.invoiceNumber}</span></p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md hover:bg-surface-muted text-body hover:text-heading transition-colors cursor-pointer"
                        title="Close"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 overflow-y-auto">

                    {/* Summary Info Row */}
                    <div className="p-4 rounded-md bg-surface-muted border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div>
                            <span className="text-body block">Official Issue Date</span>
                            <span className="font-bold text-heading font-latin text-sm">
                                {new Date(invoice.createdAt || Date.now()).toLocaleDateString('en-US')}
                            </span>
                        </div>

                        <div>
                            <span className="text-body block">Due Date</span>
                            <span className="font-bold text-accent font-latin text-sm">
                                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US') : 'On Receipt'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleDownloadZatcaPdf}
                                disabled={isGeneratingPdf}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-extrabold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                            >
                                {isGeneratingPdf ? (
                                    <LuLoader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <LuDownload className="w-4 h-4" />
                                )}
                                <span>{isGeneratingPdf ? 'Downloading...' : 'Download PDF'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Customer Company Details Card */}
                    <div className="p-4 rounded-md border border-border bg-surface space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-border pb-1.5">
                            <span className="font-bold text-heading flex items-center gap-1.5">
                                <LuBuilding2 className="w-4 h-4 text-accent" />
                                Invoiced Company Details (Customer)
                            </span>
                            <span className="text-[10px] font-extrabold text-accent bg-accent/10 px-2 py-0.5 rounded">ZATCA Verified</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                                <span className="text-body">Company Name: </span>
                                <span className="font-bold text-heading">{companyName}</span>
                            </div>
                            <div>
                                <span className="text-body">Tax Number: </span>
                                <span className="font-bold font-latin text-accent">{companyData?.taxNumber || '310459871200003'}</span>
                            </div>
                            <div>
                                <span className="text-body">City & Address: </span>
                                <span className="font-medium text-heading">{companyData?.city || 'Riyadh'} - {companyData?.address || 'Saudi Arabia'}</span>
                            </div>
                            <div>
                                <span className="text-body">Contact: </span>
                                <span className="font-medium font-latin text-heading">{companyData?.phone || companyData?.email || 'support@shahntak.sa'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipment & Shipping Details Card */}
                    {linkedShipment && (
                        <div className="p-4 rounded-md border border-accent/30 bg-accent/5 space-y-3">
                            <div className="flex items-center justify-between border-b border-accent/20 pb-2">
                                <h3 className="text-xs font-extrabold text-heading flex items-center gap-1.5">
                                    <LuTruck className="w-4 h-4 text-accent" />
                                    <span>Shipment & Logistics Transport Cost Details</span>
                                </h3>
                                {linkedShipment?.type && (
                                    <span className="text-[11px] font-bold text-accent px-2 py-0.5 rounded bg-surface border border-accent/20">
                                        {getShipmentTypeName(linkedShipment.type)}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-surface p-2.5 rounded border border-border">
                                    <span className="text-body block text-[11px] mb-0.5">Linked Shipment No.</span>
                                    <span className="font-bold text-accent font-latin text-sm">
                                        {linkedShipment?.shipmentNumber || (invoice as any).shipmentNumber || 'General Shipment'}
                                    </span>
                                </div>

                                <div className="bg-surface p-2.5 rounded border border-border">
                                    <span className="text-body block text-[11px] mb-0.5">Transport Route</span>
                                    <span className="font-bold text-heading flex items-center gap-1">
                                        <LuMapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                                        <span>{linkedShipment?.origin || 'Riyadh'} ➡️ {linkedShipment?.destination || 'Jeddah'}</span>
                                    </span>
                                </div>

                                <div className="bg-surface p-2.5 rounded border border-border">
                                    <span className="text-body block text-[11px] mb-0.5">Waybill Number</span>
                                    <span className="font-semibold text-heading font-latin flex items-center gap-1">
                                        <LuFileText className="w-3.5 h-3.5 text-body shrink-0" />
                                        <span>{linkedShipment?.waybillNumber || (linkedShipment ? `WB-${new Date().getFullYear()}-${linkedShipment._id?.toString().slice(-6).toUpperCase()}` : 'Invoice not linked to a shipment')}</span>
                                    </span>
                                </div>

                                <div className="bg-surface p-2.5 rounded border border-border">
                                    <span className="text-body block text-[11px] mb-0.5">Orders / Packages Count</span>
                                    <span className="font-semibold text-heading font-latin flex items-center gap-1">
                                        <LuPackage className="w-3.5 h-3.5 text-body shrink-0" />
                                        <span>{linkedShipment?.ordersCount || 1} package(s)</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Financial Breakdown Table */}
                    <div className="p-4 rounded-md border border-border bg-surface space-y-3">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <h3 className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuCoins className="w-4 h-4 text-accent" />
                                <span>Shipping Fees & Tax Breakdown (ZATCA 15%)</span>
                            </h3>
                            <span className="text-[10px] font-extrabold text-accent px-2 py-0.5 rounded bg-accent/10 font-latin">
                                Rate: {taxRate}%
                            </span>
                        </div>

                        {(invoice as any).vatExemptionReason && taxRate === 0 && (
                            <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs">
                                <span className="font-bold block mb-0.5">Official Tax Exemption Reason:</span>
                                <p>{(invoice as any).vatExemptionReason}</p>
                            </div>
                        )}

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-2 border-b border-border">
                                <div>
                                    <span className="font-bold text-heading block">Shipping & Logistics Service Cost</span>
                                    <span className="text-[10px] text-body block">Base shipment amount (before discount and tax)</span>
                                </div>
                                <span className="font-bold text-heading font-latin text-sm">{basePrice.toFixed(2)} SAR</span>
                            </div>

                            {discount > 0 && (
                                <div className="flex justify-between items-center py-1.5 border-b border-border text-emerald-600 bg-emerald-500/10 px-2 rounded">
                                    <span className="font-semibold">Commercial / Financial Discount</span>
                                    <span className="font-bold font-latin">-{discount.toFixed(2)} SAR</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-body">Taxable Net Amount</span>
                                <span className="font-semibold text-heading font-latin">{discountedSubtotal.toFixed(2)} SAR</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-body">VAT ({taxRate}%)</span>
                                <span className="font-semibold text-amber-600 font-latin">{vatAmount.toFixed(2)} SAR</span>
                            </div>

                            <div className="flex justify-between items-center pt-2 text-sm font-bold">
                                <span className="text-heading">Grand Total Due (Tax Included)</span>
                                <span className="text-accent font-latin text-base font-bold">{finalTotal.toFixed(2)} SAR</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-surface-muted flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors shadow-xs cursor-pointer"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}