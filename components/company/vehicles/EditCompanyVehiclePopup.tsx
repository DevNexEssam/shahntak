"use client";

import React, { useState, useEffect } from 'react';
import { useUpdateCompanyVehicle } from '@/hooks/company/useCompanyVehicle';
import toast from 'react-hot-toast';
import {
    LuTruck,
    LuX,
    LuWeight,
    LuBox
} from 'react-icons/lu';

interface EditCompanyVehiclePopupProps {
    isOpen?: boolean;
    onClose: () => void;
    vehicleData: any;
}

export default function EditCompanyVehiclePopup({ isOpen = true, onClose, vehicleData }: EditCompanyVehiclePopupProps) {
    const [formValues, setFormValues] = useState({
        type: '',
        capacityWeight: 1000,
        capacityVolume: 10,
        isActive: true,
    });

    useEffect(() => {
        if (vehicleData) {
            setFormValues({
                type: vehicleData.type || '',
                capacityWeight: vehicleData.capacityWeight || 0,
                capacityVolume: vehicleData.capacityVolume || 0,
                isActive: vehicleData.isActive !== undefined ? vehicleData.isActive : true,
            });
        }
    }, [vehicleData]);

    const { mutate: updateVehicle, isPending: isSubmitting } = useUpdateCompanyVehicle();

    if (!isOpen || !vehicleData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        updateVehicle(
            { id: vehicleData._id, updates: formValues },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuTruck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تعديل بيانات المركبة</h2>
                            <p className="text-xs text-body mt-0.5">تحديث مواصفات الحمولة وحالة التشغيل</p>
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
                    <div className="p-6 overflow-y-auto space-y-5 flex-1">

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuTruck className="w-3.5 h-3.5 text-body" />
                                نوع المركبة / الشاحنة
                            </label>
                            <input
                                type="text"
                                disabled={isSubmitting}
                                value={formValues.type}
                                onChange={(e) => setFormValues({ ...formValues, type: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuWeight className="w-3.5 h-3.5 text-body" />
                                    الحمولة الوزنية (كجم)
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.capacityWeight}
                                    onChange={(e) => setFormValues({ ...formValues, capacityWeight: Number(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuBox className="w-3.5 h-3.5 text-body" />
                                    السعة الحجمية (م³)
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.capacityVolume}
                                    onChange={(e) => setFormValues({ ...formValues, capacityVolume: Number(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading">حالة التفعيل</label>
                            <select
                                value={formValues.isActive ? 'active' : 'inactive'}
                                onChange={(e) => setFormValues({ ...formValues, isActive: e.target.value === 'active' })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer font-bold"
                            >
                                <option value="active">نشطة ومفعلة (Active)</option>
                                <option value="inactive">متوقفة / غير نشطة (Inactive)</option>
                            </select>
                        </div>

                    </div>

                    {/* Footer */}
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
                            {isSubmitting ? "جاري التحديث..." : "حفظ التعديلات"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
