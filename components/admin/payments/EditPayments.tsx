"use client";

import React, { useState, useEffect } from 'react';
import { Payment, Invoice } from '@/types/data';
import { useAllInvoices } from '@/hooks/invoices/useInvoices';
import toast from 'react-hot-toast';
import {
    LuCreditCard,
    LuX,
    LuReceipt,
    LuCoins,
    LuCalendar,
    LuWallet,
    LuPencil
} from 'react-icons/lu';

interface EditPaymentsProps {
    isOpen?: boolean;
    payment: Payment | null;
    onClose: () => void;
}

export default function EditPayments({ isOpen = true, payment, onClose }: EditPaymentsProps) {
    const [formValues, setFormValues] = useState({
        amount: 0,
        method: 'bank_transfer' as 'bank_transfer' | 'card' | 'cash' | 'other',
        paidAt: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (payment) {
            setFormValues({
                amount: payment.amount || 0,
                method: payment.method || 'bank_transfer',
                paidAt: payment.paidAt ? new Date(payment.paidAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            });
        }
    }, [payment]);

    if (!isOpen || !payment) return null;

    const invoiceNumber = typeof payment.invoiceId === 'object' && payment.invoiceId !== null
        ? (payment.invoiceId as Invoice).invoiceNumber
        : 'Unspecified';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Payment record updated successfully");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="ltr">
            {/* Modal Container */}
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuPencil className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">Edit Payment Record</h2>
                            <p className="text-xs text-body mt-0.5">Payment linked to invoice: <span className="font-bold text-accent font-latin">{invoiceNumber}</span></p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer"
                        title="Close"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-5 flex-1 text-left">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCoins className="w-3.5 h-3.5 text-body" />
                                    Payment Amount (SAR)
                                </label>
                                <input
                                    type="number"
                                    value={formValues.amount}
                                    onChange={(e) => setFormValues({ ...formValues, amount: Number(e.target.value) })}
                                    min={0.01}
                                    step="any"
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuWallet className="w-3.5 h-3.5 text-body" />
                                    Payment Method
                                </label>
                                <select
                                    value={formValues.method}
                                    onChange={(e) => setFormValues({ ...formValues, method: e.target.value as any })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer font-medium"
                                >
                                    <option value="bank_transfer">Direct Bank Transfer</option>
                                    <option value="card">Credit Card / Mada</option>
                                    <option value="cash">Cash Payment</option>
                                    <option value="other">Other Method</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuCalendar className="w-3.5 h-3.5 text-body" />
                                Payment Date
                            </label>
                            <input
                                type="date"
                                value={formValues.paidAt}
                                onChange={(e) => setFormValues({ ...formValues, paidAt: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent cursor-pointer"
                            />
                        </div>

                    </div>

                    {/* Modal Footer */}
                    <div className="p-5 border-t border-border bg-surface-muted/40 flex items-center justify-between gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted font-bold text-sm transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer min-w-[130px] justify-center"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}