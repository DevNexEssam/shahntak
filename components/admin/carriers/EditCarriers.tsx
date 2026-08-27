"use client";

import React, { useState, useEffect } from 'react';
import { Carrier } from '@/types/data';
import { useUpdateCarrier } from '@/hooks/carriers/useCarriers';
import { carrierUpdateValidationSchema } from '@/lib/validations/carrier.schema';
import toast from 'react-hot-toast';
import {
    LuTruck,
    LuX,
    LuPhone,
    LuMail,
    LuLayers,
    LuPencil
} from 'react-icons/lu';

interface EditCarriersProps {
    isOpen?: boolean;
    carrier: Carrier | null;
    onClose: () => void;
}

export default function EditCarriers({ isOpen = true, carrier, onClose }: EditCarriersProps) {
    const [formValues, setFormValues] = useState({
        name: '',
        type: 'local' as 'local' | 'external_api',
        contactPhone: '',
        contactEmail: '',
        isActive: true,
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: updateCarrier, isPending: isSubmitting } = useUpdateCarrier();

    useEffect(() => {
        if (carrier) {
            setFormValues({
                name: carrier.name || '',
                type: carrier.type || 'local',
                contactPhone: carrier.contactPhone || '',
                contactEmail: carrier.contactEmail || '',
                isActive: carrier.isActive ?? true,
            });
            setFieldErrors({});
        }
    }, [carrier]);

    if (!isOpen || !carrier) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        // 1. Zod Validation Check
        const validation = carrierUpdateValidationSchema.safeParse(formValues);
        if (!validation.success) {
            const errors: Record<string, string> = {};
            validation.error.issues.forEach((issue) => {
                if (issue.path[0]) {
                    errors[issue.path[0].toString()] = issue.message;
                }
            });
            setFieldErrors(errors);
            toast.error("يرجى تصحيح الأخطاء الموضحة في النموذج");
            return;
        }

        // 2. Trigger Update Mutation
        updateCarrier(
            { id: carrier._id, updates: formValues },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            {/* Modal Container */}
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuPencil className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تعديل بيانات الناقل</h2>
                            <p className="text-xs text-body mt-0.5">تحديث معلومات الناقل: <span className="font-bold text-accent">{carrier.name}</span></p>
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

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-5 flex-1 text-right">

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuTruck className="w-3.5 h-3.5 text-body" />
                                اسم الناقل <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                disabled={isSubmitting}
                                value={formValues.name}
                                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                                className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading focus:outline-none focus:border-accent disabled:opacity-50 ${
                                    fieldErrors.name ? 'border-rose-500' : 'border-border'
                                }`}
                            />
                            {fieldErrors.name && (
                                <span className="text-xs text-rose-500 font-medium block">{fieldErrors.name}</span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuLayers className="w-3.5 h-3.5 text-body" />
                                نوع الناقل والربط البرمجي
                            </label>
                            <select
                                disabled={isSubmitting}
                                value={formValues.type}
                                onChange={(e) => setFormValues({ ...formValues, type: e.target.value as any })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                            >
                                <option value="local">ناقل محلي مباشر (Local Carrier)</option>
                                <option value="external_api">ربط خارجي عبر البرمجيات (External API Integration)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuPhone className="w-3.5 h-3.5 text-body" />
                                    هاتف التواصل
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.contactPhone}
                                    onChange={(e) => setFormValues({ ...formValues, contactPhone: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${
                                        fieldErrors.contactPhone ? 'border-rose-500' : 'border-border'
                                    }`}
                                />
                                {fieldErrors.contactPhone && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.contactPhone}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMail className="w-3.5 h-3.5 text-body" />
                                    البريد الإلكتروني
                                </label>
                                <input
                                    type="email"
                                    disabled={isSubmitting}
                                    value={formValues.contactEmail}
                                    onChange={(e) => setFormValues({ ...formValues, contactEmail: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${
                                        fieldErrors.contactEmail ? 'border-rose-500' : 'border-border'
                                    }`}
                                />
                                {fieldErrors.contactEmail && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.contactEmail}</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading block">
                                حالة الناقل
                            </label>
                            <select
                                disabled={isSubmitting}
                                value={formValues.isActive ? 'active' : 'inactive'}
                                onChange={(e) => setFormValues({ ...formValues, isActive: e.target.value === 'active' })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                            >
                                <option value="active">نشط ومتاح بالمنصة</option>
                                <option value="inactive">موقوف مؤقتاً</option>
                            </select>
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
                            إلغاء
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[130px] justify-center"
                        >
                            {isSubmitting ? "جاري التعديل..." : "حفظ التعديلات"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
