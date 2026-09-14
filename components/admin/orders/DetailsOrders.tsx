"use client";

import React, { useState } from 'react';
import { Order, Company } from '@/types/data';
import {
    LuPackage,
    LuX,
    LuUser,
    LuBuilding2,
    LuCoins,
    LuDownload,
    LuLoader
} from 'react-icons/lu';

interface DetailsOrdersProps {
    isOpen?: boolean;
    order: Order | null;
    onClose: () => void;
}

export default function DetailsOrders({ isOpen = true, order, onClose }: DetailsOrdersProps) {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    if (!isOpen || !order) return null;

    const companyName = typeof order.companyId === 'object' && order.companyId !== null
        ? (order.companyId as Company).companyName
        : 'Unspecified Company';

    const handleDownloadPdf = async () => {
        try {
            setIsGeneratingPdf(true);
            const { pdf } = await import('@react-pdf/renderer');
            const { OrderPDFDocument } = await import('@/components/company/orders/OrderPDFDocument');
            const blob = await pdf(<OrderPDFDocument orderData={order} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Order_${order.orderNumber || 'details'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to generate Order PDF:', err);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-500/10 text-amber-600">
                        Pending
                    </span>
                );
            case 'validated':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-600">
                        Confirmed
                    </span>
                );
            case 'grouped':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-500/10 text-purple-600">
                        Grouped in Shipment
                    </span>
                );
            case 'shipped':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-sky-500/10 text-sky-600">
                        Shipped
                    </span>
                );
            case 'delivered':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600">
                        Delivered
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600">
                        Cancelled
                    </span>
                );
            case 'error':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600">
                        Data Error
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-surface-muted text-muted-foreground">
                        {status}
                    </span>
                );
        }
    };

    const orderValue = Number(order.orderValue || 0);
    const codAmount = Number(order.codAmount || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150" dir="ltr">
            <div className="printable-area w-full max-w-xl bg-surface border border-border rounded-md shadow-xs overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuPackage className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-foreground">Order Details</h2>
                                {getStatusBadge(order.status || 'pending')}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 font-latin">Order No.: <span className="font-semibold text-accent">{order.orderNumber}</span></p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md hover:bg-surface-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Close"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 text-left">

                    {/* Summary Info Row */}
                    <div className="p-4 rounded-md bg-surface-muted border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div>
                            <span className="text-muted-foreground block">Order Registration Date</span>
                            <span className="font-bold text-foreground font-latin text-sm">
                                {new Date(order.createdAt || Date.now()).toLocaleDateString('en-US')}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Order Owner Company</span>
                            <span className="font-bold text-foreground text-xs flex items-center gap-1.5 mt-0.5">
                                <LuBuilding2 className="w-3.5 h-3.5 text-accent" />
                                {companyName}
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
                                <span>{isGeneratingPdf ? 'Downloading...' : 'Download PDF'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Recipient & Location Details Box */}
                    <div className="p-4 rounded-md border border-border bg-surface space-y-3">
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                            <LuUser className="w-4 h-4 text-accent" />
                            <span>Recipient & Delivery Location Details</span>
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">Recipient Name</span>
                                <span className="font-semibold text-foreground">{order.recipientName}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">Phone Number</span>
                                <span className="font-semibold text-foreground font-latin">{order.recipientPhone}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">City & District</span>
                                <span className="font-semibold text-foreground">{order.recipientCity} {order.recipientDistrict ? `- ${order.recipientDistrict}` : ''}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-muted-foreground">Detailed Address</span>
                                <span className="font-semibold text-foreground">{order.recipientAddress}</span>
                            </div>
                        </div>
                    </div>

                    {/* Financial Breakdown & Specifications Box */}
                    <div className="p-4 rounded-md border border-border bg-surface space-y-3">
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                            <LuCoins className="w-4 h-4 text-accent" />
                            <span>Specifications & Financial Values</span>
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">Package Weight / Quantity</span>
                                <span className="font-semibold text-foreground font-latin">{order.weight || 1} kg ({order.quantity || 1} package(s))</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">Declared Order Value</span>
                                <span className="font-semibold text-emerald-600 font-latin">{orderValue.toFixed(2)} SAR</span>
                            </div>

                            <div className="flex justify-between items-center pt-1 text-sm font-bold">
                                <span className="text-foreground">Cash on Delivery Amount (COD)</span>
                                <span className="text-amber-600 font-latin text-base font-bold">{codAmount.toFixed(2)} SAR</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-surface-muted flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-semibold rounded-md border border-border bg-surface hover:bg-border/20 transition-colors text-foreground cursor-pointer"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}