"use client";

import React, { useState } from 'react';
import { useCreateOrder } from '@/hooks/orders/useOrders';
import AdminCompanySelect from '@/components/admin/common/AdminCompanySelect';
import AdminCompanySubscriptionWidget from '@/components/admin/common/AdminCompanySubscriptionWidget';
import { orderCreateValidationSchema } from '@/lib/validations/order.schema';
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

interface AddOrdersProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddOrders({ isOpen = true, onClose }: AddOrdersProps) {
    const [formValues, setFormValues] = useState({
        companyId: '',
        createdByUserId: '',
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
        source: 'manual' as const,
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: createOrder, isPending: isSubmitting } = useCreateOrder();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const payload = {
            ...formValues,
            createdByUserId: formValues.createdByUserId || undefined,
        };

        const validation = orderCreateValidationSchema.safeParse(payload);
        if (!validation.success) {
            const errors: Record<string, string> = {};
            validation.error.issues.forEach((issue) => {
                if (issue.path[0]) {
                    errors[issue.path[0].toString()] = issue.message;
                }
            });
            setFieldErrors(errors);
            toast.error("Please correct the errors highlighted in the form");
            return;
        }

        createOrder(payload, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="ltr">
            <div className="relative w-full max-w-3xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuPackage className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">Add New Shipment Order</h2>
                            <p className="text-xs text-body mt-0.5">Create a new order on behalf of the specified company and confirm the live plan quota</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer disabled:opacity-50"
                        title="Close"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">

                        {/* Order & Company Selection with Live Subscription Widget */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                Target Company & Quota Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuHash className="w-3.5 h-3.5 text-accent" />
                                        Order Number
                                    </label>
                                    <div className="w-full px-4 py-2.5 rounded-md bg-surface-muted/70 border border-border text-sm font-extrabold text-accent font-latin flex items-center justify-between">
                                        <span>Auto-generated unique (ORD-0001)</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent/10 text-accent font-bold">Auto-generated (Required)</span>
                                    </div>
                                    <span className="text-[11px] text-body/70 block">The order code is generated automatically by the server in the sequential pattern <b>ORD-0001</b></span>
                                </div>

                                <AdminCompanySelect
                                    value={formValues.companyId}
                                    onChange={(companyId) => setFormValues({ ...formValues, companyId })}
                                    disabled={isSubmitting}
                                    error={fieldErrors.companyId}
                                />
                            </div>

                            {/* Live Subscription Details Widget */}
                            {formValues.companyId && (
                                <AdminCompanySubscriptionWidget companyId={formValues.companyId} compact />
                            )}
                        </div>

                        {/* Recipient Details */}
                        <div className="space-y-4 pt-2 border-t border-border">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                Recipient & Delivery Location Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuUser className="w-3.5 h-3.5 text-body" />
                                        Recipient Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.recipientName}
                                        onChange={(e) => setFormValues({ ...formValues, recipientName: e.target.value })}
                                        placeholder="Full recipient name"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.recipientName ? 'border-rose-500' : 'border-border'
                                            }`}
                                    />
                                    {fieldErrors.recipientName && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.recipientName}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuPhone className="w-3.5 h-3.5 text-body" />
                                        Recipient Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.recipientPhone}
                                        onChange={(e) => setFormValues({ ...formValues, recipientPhone: e.target.value })}
                                        placeholder="0501234567"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.recipientPhone ? 'border-rose-500' : 'border-border'
                                            }`}
                                    />
                                    {fieldErrors.recipientPhone && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.recipientPhone}</span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuMapPin className="w-3.5 h-3.5 text-body" />
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.recipientCity}
                                        onChange={(e) => setFormValues({ ...formValues, recipientCity: e.target.value })}
                                        placeholder="Riyadh, Jeddah, Dammam..."
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.recipientCity ? 'border-rose-500' : 'border-border'
                                            }`}
                                    />
                                    {fieldErrors.recipientCity && (
                                        <span className="text-xs text-rose-500 font-medium block">{fieldErrors.recipientCity}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        District (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.recipientDistrict}
                                        onChange={(e) => setFormValues({ ...formValues, recipientDistrict: e.target.value })}
                                        placeholder="Al Narjis District..."
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    Detailed Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.recipientAddress}
                                    onChange={(e) => setFormValues({ ...formValues, recipientAddress: e.target.value })}
                                    placeholder="Takhassusi Street, Al Nasr Buildings..."
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.recipientAddress ? 'border-rose-500' : 'border-border'
                                        }`}
                                />
                                {fieldErrors.recipientAddress && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.recipientAddress}</span>
                                )}
                            </div>
                        </div>

                        {/* Shipment Metrics */}
                        <div className="space-y-4 pt-2 border-t border-border">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                Specifications & Logistics Values
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuWeight className="w-3.5 h-3.5 text-body" />
                                        Weight (kg) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        disabled={isSubmitting}
                                        value={formValues.weight}
                                        onChange={(e) => setFormValues({ ...formValues, weight: Number(e.target.value) })}
                                        min={0}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        Quantity (Packages)
                                    </label>
                                    <input
                                        type="number"
                                        disabled={isSubmitting}
                                        value={formValues.quantity}
                                        onChange={(e) => setFormValues({ ...formValues, quantity: Number(e.target.value) })}
                                        min={1}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuCoins className="w-3.5 h-3.5 text-body" />
                                        Order Value <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        disabled={isSubmitting}
                                        value={formValues.orderValue}
                                        onChange={(e) => setFormValues({ ...formValues, orderValue: Number(e.target.value) })}
                                        min={0}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        COD Amount on Delivery
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        disabled={isSubmitting}
                                        value={formValues.codAmount}
                                        onChange={(e) => setFormValues({ ...formValues, codAmount: Number(e.target.value) })}
                                        min={0}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Modal Footer */}
                    <div className="p-5 border-t border-border bg-surface-muted/40 flex items-center justify-between gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[130px] justify-center"
                        >
                            {isSubmitting ? "Adding..." : "Save Data"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}