/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { useUpdateCompanyExpense, useDeleteCompanyExpense } from '@/hooks/company/useCompanyExpenses';
import { defaultExpenseCategories } from '@/lib/validations/expense.schema';
import toast from 'react-hot-toast';
import {
    LuCoins,
    LuX,
    LuSave,
    LuCalendar,
    LuTag,
    LuFileText,
    LuFileCheck,
    LuPencil,
    LuTrash2
} from 'react-icons/lu';

interface EditExpensePopupProps {
    isOpen: boolean;
    expenseData: any;
    onClose: () => void;
}

export default function EditExpensePopup({ isOpen, expenseData, onClose }: EditExpensePopupProps) {
    const { mutate: updateExpense, isPending: isUpdating } = useUpdateCompanyExpense();
    const { mutate: deleteExpense, isPending: isDeleting } = useDeleteCompanyExpense();

    const [title, setTitle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>(defaultExpenseCategories[0]);
    const [customCategory, setCustomCategory] = useState('');
    const [amount, setAmount] = useState<number | string>('');
    const [expenseDate, setExpenseDate] = useState<string>('');
    const [receiptNumber, setReceiptNumber] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (expenseData) {
            setTitle(expenseData.title || '');
            const category = expenseData.category || '';
            if (defaultExpenseCategories.includes(category as any)) {
                setSelectedCategory(category);
                setCustomCategory('');
            } else {
                setSelectedCategory("Other / Custom");
                setCustomCategory(category);
            }
            setAmount(expenseData.amount || '');
            if (expenseData.expenseDate) {
                setExpenseDate(new Date(expenseData.expenseDate).toISOString().split('T')[0]);
            }
            setReceiptNumber(expenseData.receiptNumber || '');
            setNotes(expenseData.notes || '');
        }
    }, [expenseData]);

    if (!isOpen || !expenseData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Please enter expense description/title");
            return;
        }

        const categoryToUse = selectedCategory === "Other / Custom"
            ? customCategory.trim()
            : selectedCategory;

        if (!categoryToUse) {
            toast.error("Please select or enter an expense category");
            return;
        }

        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast.error("Please enter a valid amount greater than zero");
            return;
        }

        const payload = {
            title: title.trim(),
            category: categoryToUse,
            amount: parsedAmount,
            expenseDate: expenseDate || undefined,
            receiptNumber: receiptNumber.trim() || undefined,
            notes: notes.trim() || undefined,
        };

        updateExpense(
            { id: expenseData._id, data: payload },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this expense record?")) {
            deleteExpense(expenseData._id, {
                onSuccess: () => {
                    onClose();
                },
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150 text-left">
            <div className="w-full max-w-lg bg-surface border border-border rounded-md shadow-lg overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                            <LuPencil className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-heading">Edit Expense Details</h2>
                            <p className="text-xs text-body mt-0.5">Update registered company expense details</p>
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

                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                            <LuFileText className="w-3.5 h-3.5 text-accent" />
                            Expense Title / Description <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Truck Refill"
                            className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent font-latin"
                        />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                            <LuTag className="w-3.5 h-3.5 text-accent" />
                            Expense Category <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer"
                        >
                            {defaultExpenseCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Custom Category Input if selected */}
                    {selectedCategory === "Other / Custom" && (
                        <div className="space-y-1.5 animate-in fade-in duration-200">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuPencil className="w-3.5 h-3.5 text-text-accent" />
                                Enter Custom Category Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                placeholder="Enter custom category name..."
                                className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                            />
                        </div>
                    )}

                    {/* Amount & Date Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuCoins className="w-3.5 h-3.5 text-rose-500" />
                                Expense Amount (SAR) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent font-latin"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuCalendar className="w-3.5 h-3.5 text-accent" />
                                Expense Date
                            </label>
                            <input
                                type="date"
                                value={expenseDate}
                                onChange={(e) => setExpenseDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent font-latin"
                            />
                        </div>
                    </div>

                    {/* Receipt Number */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                            <LuFileCheck className="w-3.5 h-3.5 text-accent" />
                            Receipt / Voucher Number (Optional)
                        </label>
                        <input
                            type="text"
                            value={receiptNumber}
                            onChange={(e) => setReceiptNumber(e.target.value)}
                            placeholder="e.g. REC-99201"
                            className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent font-latin"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                            <LuFileText className="w-3.5 h-3.5 text-body" />
                            Detailed Notes (Optional)
                        </label>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent resize-none"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-md bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <LuTrash2 className="w-4 h-4" />
                            <span>{isDeleting ? 'Deleting...' : 'Delete Expense'}</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-semibold rounded-md border border-border bg-surface hover:bg-surface-muted transition-colors text-heading cursor-pointer"
                            >
                                Close
                            </button>

                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                            >
                                <LuSave className="w-4 h-4" />
                                <span>{isUpdating ? 'Updating...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    </div>

                </form>

            </div>
        </div>
    );
}
