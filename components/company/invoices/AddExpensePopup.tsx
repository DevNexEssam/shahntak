/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useCreateCompanyExpense } from '@/hooks/company/useCompanyExpenses';
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
    LuPencil
} from 'react-icons/lu';

interface AddExpensePopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddExpensePopup({ isOpen, onClose }: AddExpensePopupProps) {
    const { mutate: createExpense, isPending } = useCreateCompanyExpense();

    const [title, setTitle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>(defaultExpenseCategories[0]);
    const [customCategory, setCustomCategory] = useState('');
    const [amount, setAmount] = useState<number | string>('');
    const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [receiptNumber, setReceiptNumber] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("يرجى إدخال عنوان المصروف");
            return;
        }

        const categoryToUse = selectedCategory === "أخرى / مخصص"
            ? customCategory.trim()
            : selectedCategory;

        if (!categoryToUse) {
            toast.error("يرجى اختيار أو كتابة تصنيف المصروف");
            return;
        }

        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast.error("يرجى إدخال مبلغ صحيح أكبر من الصفر");
            return;
        }

        const payload = {
            title: title.trim(),
            category: categoryToUse,
            amount: parsedAmount,
            expenseDate: expenseDate || new Date().toISOString(),
            receiptNumber: receiptNumber.trim() || undefined,
            notes: notes.trim() || undefined,
        };

        createExpense(payload, {
            onSuccess: () => {
                onClose();
                setTitle('');
                setSelectedCategory(defaultExpenseCategories[0]);
                setCustomCategory('');
                setAmount('');
                setReceiptNumber('');
                setNotes('');
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150 text-right font-arabic">
            <div className="w-full max-w-lg bg-surface border border-border rounded-md shadow-lg overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                            <LuCoins className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-heading">تسجيل مصروف جديد</h2>
                            <p className="text-xs text-body mt-0.5">إضافة نفقة جديدة لشركتك (وقود، صيانة، رسوم تنقّل، إلخ)</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md hover:bg-surface-muted text-body hover:text-heading transition-colors cursor-pointer"
                        title="إغلاق"
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
                            بيان/عنوان المصروف <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="مثال: تعبئة وقود شاحنة رقم #14 أو صيانة فرامل"
                            className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent font-arabic"
                        />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                            <LuTag className="w-3.5 h-3.5 text-accent" />
                            تصنيف المصروف <span className="text-rose-500">*</span>
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
                    {selectedCategory === "أخرى / مخصص" && (
                        <div className="space-y-1.5 animate-in fade-in duration-200">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuPencil className="w-3.5 h-3.5 text-accent" />
                                كتابة تصنيف مخصص يدوياً <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                placeholder="أدخل اسم التصنيف المخصص..."
                                className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                            />
                        </div>
                    )}

                    {/* Amount & Date Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuCoins className="w-3.5 h-3.5 text-accent" />
                                مبلغ المصروف (ر.س) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent font-latin"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuCalendar className="w-3.5 h-3.5 text-accent" />
                                تاريخ المصروف
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
                            رقم الإيصال / سند الصرف (اختياري)
                        </label>
                        <input
                            type="text"
                            value={receiptNumber}
                            onChange={(e) => setReceiptNumber(e.target.value)}
                            placeholder="مثال: REC-99201"
                            className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent font-latin"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                            <LuFileText className="w-3.5 h-3.5 text-body" />
                            ملاحظات تفصيلية (اختياري)
                        </label>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="تفاصيل إضافية حول سبب الصرف أو اسم المورد..."
                            className="w-full px-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent resize-none"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold rounded-md border border-border bg-surface hover:bg-surface-muted transition-colors text-heading cursor-pointer"
                        >
                            إغلاق
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            <LuSave className="w-4 h-4" />
                            <span>{isPending ? 'جاري الحفظ...' : 'تسجيل المصروف'}</span>
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}
