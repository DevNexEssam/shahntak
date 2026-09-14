/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { useCreateCompanyInvoice } from '@/hooks/company/useCompanyInvoice';
import { useCompanyShipments } from '@/hooks/company/useCompanyShipment';
import { useCompanySettings } from '@/hooks/company/useCompanySettings';
import toast from 'react-hot-toast';
import {
    LuReceipt,
    LuX,
    LuSave,
    LuCalendar,
    LuClock,
    LuTag,
    LuCoins,
    LuTruck,
    LuCheck,
    LuShieldAlert
} from 'react-icons/lu';

interface AddCompanyInvoicePopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddCompanyInvoicePopup({
    isOpen,
    onClose,
}: AddCompanyInvoicePopupProps) {
    const { mutate: createInvoice, isPending } = useCreateCompanyInvoice();
    const { data: shipmentsResponse, isLoading: isLoadingShipments } = useCompanyShipments(1, 100);
    const { data: settingsResponse } = useCompanySettings();

    const companyProfile = settingsResponse?.data?.profile;
    const companyTaxRate = companyProfile?.vatRate !== undefined ? Number(companyProfile.vatRate) : 15;

    const [selectedShipmentId, setSelectedShipmentId] = useState<string>('');
    const [status, setStatus] = useState<string>('issued');
    const [dueDate, setDueDate] = useState<string>('');
    const [discount, setDiscount] = useState<number | string>(0);
    const [customBasePrice, setCustomBasePrice] = useState<number | string>('');

    // Filter uninvoiced shipments only (those without an invoiceId)
    const allShipments = shipmentsResponse?.data || [];
    const eligibleShipments = allShipments.filter((shipment: any) => !shipment.invoiceId);

    const selectedShipment = eligibleShipments.find((s: any) => s._id === selectedShipmentId);

    useEffect(() => {
        if (selectedShipment) {
            const price = Number(selectedShipment.customerPrice || selectedShipment.shippingCost || 0);
            setCustomBasePrice(price);
        } else {
            setCustomBasePrice('');
        }
    }, [selectedShipmentId, selectedShipment]);

    if (!isOpen) return null;

    const basePrice = Number(customBasePrice || 0);
    const parsedDiscount = Math.max(0, Number(discount) || 0);
    const validDiscount = Math.min(basePrice, parsedDiscount);
    const discountedSubtotal = Math.max(0, basePrice - validDiscount);
    const vatAmount = Math.round(discountedSubtotal * (companyTaxRate / 100) * 100) / 100;
    const computedTotal = Math.round((discountedSubtotal + vatAmount) * 100) / 100;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedShipmentId) {
            toast.error("Please select an associated shipment to issue an invoice for");
            return;
        }

        if (basePrice <= 0) {
            toast.error("Base service subtotal before tax must be greater than zero");
            return;
        }

        const payload: any = {
            shipmentId: selectedShipmentId || undefined,
            subtotal: basePrice,
            discount: validDiscount,
            status,
        };

        if (dueDate) {
            payload.dueDate = dueDate;
        }

        createInvoice(payload, {
            onSuccess: () => {
                onClose();
                setSelectedShipmentId('');
                setDiscount(0);
                setCustomBasePrice('');
                setDueDate('');
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150 text-left">
            <div className="w-full max-w-lg bg-surface border border-border rounded-md shadow-lg overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuReceipt className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-heading">Create New Tax Invoice</h2>
                            <p className="text-xs text-body mt-0.5">Issue a new custom invoice or link it to a transport shipment</p>
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">

                    {/* Shipment Selection */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                            <LuTruck className="w-3.5 h-3.5 text-accent" />
                            Select Associated Shipment (Required / For Uninvoiced Shipments)
                        </label>
                        <select
                            value={selectedShipmentId}
                            onChange={(e) => setSelectedShipmentId(e.target.value)}
                            disabled={isLoadingShipments}
                            className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent disabled:opacity-50 cursor-pointer"
                        >
                            <option value="">-- Select Uninvoiced Shipment (Required) --</option>
                            {eligibleShipments.map((shipment: any) => (
                                <option key={shipment._id} value={shipment._id}>
                                    Shipment #{shipment.shipmentNumber || shipment._id.slice(-6)} - ({shipment.originCity} ➡️ {shipment.destinationCity}) - ({Number(shipment.customerPrice || shipment.shippingCost || 0).toFixed(2)} SAR)
                                </option>
                            ))}
                        </select>
                        {eligibleShipments.length === 0 && !isLoadingShipments && (
                            <p className="text-[11px] text-amber-600 flex items-center gap-1">
                                <LuShieldAlert className="w-3 h-3" />
                                No pending uninvoiced shipments available. You can manually enter the base price.
                            </p>
                        )}
                    </div>

                    {/* Base Price Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                            <LuCoins className="w-3.5 h-3.5 text-accent" />
                            Base Subtotal Before VAT (SAR) <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={customBasePrice}
                            onChange={(e) => setCustomBasePrice(e.target.value)}
                            placeholder="Enter base service subtotal"
                            className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent font-latin"
                        />
                    </div>

                    {/* Discount Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                            <LuTag className="w-3.5 h-3.5 text-accent" />
                            Optional Discount Amount (SAR)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            placeholder="Enter discount amount if applicable"
                            className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent font-latin"
                        />
                    </div>

                    {/* Status Select */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuClock className="w-3.5 h-3.5 text-accent" />
                                Initial Invoice Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer"
                            >
                                <option value="issued">Issued & Pending (Awaiting Payment)</option>
                                <option value="draft">New Draft</option>
                            </select>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuCalendar className="w-3.5 h-3.5 text-accent" />
                                Payment Due Date
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent font-latin"
                            />
                        </div>
                    </div>

                    {/* Live Calculation Preview */}
                    <div className="p-3.5 rounded-md border border-border bg-surface-muted space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-border pb-1.5">
                            <span className="font-bold text-heading flex items-center gap-1.5">
                                <LuCoins className="w-3.5 h-3.5 text-accent" />
                                Financial & Tax Calculation Preview
                            </span>
                            <span className="text-[10px] font-extrabold text-accent px-2 py-0.5 rounded bg-accent/10 font-latin">
                                Applied Rate: {companyTaxRate}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-body">
                            <span>Base Amount (before discount & VAT):</span>
                            <span className="font-bold text-heading font-latin">{basePrice.toFixed(2)} SAR</span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-600">
                            <span>Applied Discount:</span>
                            <span className="font-bold font-latin">-{validDiscount.toFixed(2)} SAR</span>
                        </div>
                        <div className="flex justify-between items-center text-body">
                            <span>Taxable Subtotal:</span>
                            <span className="font-bold text-heading font-latin">{discountedSubtotal.toFixed(2)} SAR</span>
                        </div>
                        <div className="flex justify-between items-center text-body">
                            <span>Value Added Tax ({companyTaxRate}%):</span>
                            <span className="font-bold text-heading font-latin">{vatAmount.toFixed(2)} SAR</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-accent pt-1.5 border-t border-border">
                            <span>Final Total Amount Due:</span>
                            <span className="font-latin text-base">{computedTotal.toFixed(2)} SAR</span>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold rounded-md border border-border bg-surface hover:bg-surface-muted transition-colors text-heading cursor-pointer"
                        >
                            Close
                        </button>

                        <button
                            type="submit"
                            disabled={isPending || basePrice <= 0}
                            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            <LuSave className="w-4 h-4" />
                            <span>{isPending ? 'Issuing...' : 'Issue Tax Invoice'}</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
