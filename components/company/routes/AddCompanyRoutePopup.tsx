"use client";

import React, { useState } from 'react';
import { useCreateCompanyRoute } from '@/hooks/company/useCompanyRoute';
import { routeCreateValidationSchema, RouteCreateInput } from '@/lib/validations/route.schema';
import {
    LuMapPin,
    LuX,
    LuTruck,
    LuCoins,
    LuClock,
    LuCheck
} from 'react-icons/lu';

interface AddCompanyRoutePopupProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddCompanyRoutePopup({ isOpen = true, onClose }: AddCompanyRoutePopupProps) {
    const [formValues, setFormValues] = useState<RouteCreateInput>({
        origin: '',
        destination: '',
        vehicleType: '',
        basePrice: 0,
        carrierId: '',
        estimatedTransitTime: '',
        isActive: true,
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const { mutate: createRoute, isPending: isSubmitting } = useCreateCompanyRoute();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        const validation = routeCreateValidationSchema.safeParse(formValues);
        if (!validation.success) {
            const fieldErrors: Record<string, string> = {};
            const errors = validation.error.flatten().fieldErrors;
            Object.keys(errors).forEach((key) => {
                const msg = errors[key as keyof typeof errors]?.[0];
                if (msg) fieldErrors[key] = msg;
            });
            setFormErrors(fieldErrors);
            return;
        }

        createRoute(
            { data: validation.data },
            {
                onSuccess: () => {
                    setFormValues({
                        origin: '',
                        destination: '',
                        vehicleType: '',
                        basePrice: 0,
                        carrierId: '',
                        estimatedTransitTime: '',
                        isActive: true,
                    });
                    setFormErrors({});
                    onClose();
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuMapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">إضافة مسار لوجستي جديد</h2>
                            <p className="text-xs text-body mt-0.5">تعريف خط نقل جديد وتحديد أسعاره وأوقات الترانزيت</p>
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
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden font-arabic">
                    <div className="p-6 overflow-y-auto space-y-4 flex-1">

                        {/* Origin & Destination */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMapPin className="w-3.5 h-3.5 text-accent" />
                                    نقطة الانطلاق (المصدر) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.origin}
                                    onChange={(e) => setFormValues({ ...formValues, origin: e.target.value })}
                                    placeholder="مثال: الرياض"
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                />
                                {formErrors.origin && <p className="text-xs text-rose-500 font-bold">{formErrors.origin}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMapPin className="w-3.5 h-3.5 text-accent" />
                                    وجهة الوصول <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.destination}
                                    onChange={(e) => setFormValues({ ...formValues, destination: e.target.value })}
                                    placeholder="مثال: جدة"
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                />
                                {formErrors.destination && <p className="text-xs text-rose-500 font-bold">{formErrors.destination}</p>}
                            </div>
                        </div>

                        {/* Vehicle Type */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuTruck className="w-3.5 h-3.5 text-accent" />
                                نوع المركبة المخصص للمسار <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                disabled={isSubmitting}
                                value={formValues.vehicleType}
                                onChange={(e) => setFormValues({ ...formValues, vehicleType: e.target.value })}
                                placeholder="مثال: تريلا داينا (15 طن) / سطحة مغلقة"
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                            />
                            {formErrors.vehicleType && <p className="text-xs text-rose-500 font-bold">{formErrors.vehicleType}</p>}
                        </div>

                        {/* Base Price & Transit Time */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCoins className="w-3.5 h-3.5 text-emerald-600" />
                                    السعر الأساسي المقدر (ر.س) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    min="0"
                                    value={formValues.basePrice}
                                    onChange={(e) => setFormValues({ ...formValues, basePrice: Number(e.target.value) || 0 })}
                                    placeholder="0"
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                                {formErrors.basePrice && <p className="text-xs text-rose-500 font-bold">{formErrors.basePrice}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuClock className="w-3.5 h-3.5 text-body" />
                                    زمن الترانزيت المتوقع
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.estimatedTransitTime}
                                    onChange={(e) => setFormValues({ ...formValues, estimatedTransitTime: e.target.value })}
                                    placeholder="مثال: 12 ساعة / يوم واحد"
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading">حالة التفعيل التشغيلي للمسار</label>
                            <select
                                value={formValues.isActive ? 'active' : 'inactive'}
                                onChange={(e) => setFormValues({ ...formValues, isActive: e.target.value === 'active' })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer font-bold"
                            >
                                <option value="active">نشط وجاهز للاستخدام</option>
                                <option value="inactive">معطل مؤقتاً</option>
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
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[140px] justify-center"
                        >
                            <LuCheck className="w-4 h-4" />
                            <span>{isSubmitting ? "جاري الإضافة..." : "إضافة المسار"}</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
