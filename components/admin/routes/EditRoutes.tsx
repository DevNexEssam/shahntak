"use client";

import React, { useState, useEffect } from 'react';
import { Route } from '@/types/data';
import { useUpdateRoute } from '@/hooks/routes/useRoutes';
import { useAllCarriers } from '@/hooks/carriers/useCarriers';
import { routeUpdateValidationSchema } from '@/lib/validations/route.schema';
import toast from 'react-hot-toast';
import {
    LuMapPin,
    LuX,
    LuTruck,
    LuCoins,
    LuClock,
    LuBuilding2,
    LuPencil
} from 'react-icons/lu';

interface EditRoutesProps {
    isOpen?: boolean;
    route: Route | null;
    onClose: () => void;
}

export default function EditRoutes({ isOpen = true, route, onClose }: EditRoutesProps) {
    const [formValues, setFormValues] = useState({
        origin: '',
        destination: '',
        vehicleType: '',
        basePrice: 0,
        carrierId: '',
        estimatedTransitTime: '',
        isActive: true,
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: updateRoute, isPending: isSubmitting } = useUpdateRoute();
    const { data: carriersRes, isLoading: isLoadingCarriers } = useAllCarriers();

    useEffect(() => {
        if (route) {
            setFormValues({
                origin: route.origin || '',
                destination: route.destination || '',
                vehicleType: route.vehicleType || '',
                basePrice: route.basePrice ?? 0,
                carrierId: typeof route.carrierId === 'object' && route.carrierId !== null
                    ? (route.carrierId as any)._id
                    : (route.carrierId || ''),
                estimatedTransitTime: route.estimatedTransitTime || '',
                isActive: route.isActive ?? true,
            });
            setFieldErrors({});
        }
    }, [route]);

    if (!isOpen || !route) return null;

    const carriers = carriersRes?.data || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        // Zod Validation Check
        const validation = routeUpdateValidationSchema.safeParse(formValues);
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

        // Trigger Update Mutation
        updateRoute(
            { id: route._id, updates: formValues },
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
            <div className="relative w-full max-w-xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header - Identical to Add Modal Theme */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuPencil className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تعديل بيانات المسار</h2>
                            <p className="text-xs text-body mt-0.5">تحديث معلومات المسار اللوجستي: <span className="font-bold text-accent">{route.origin} ← {route.destination}</span></p>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMapPin className="w-3.5 h-3.5 text-body" />
                                    نقطة الانطلاق <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.origin}
                                    onChange={(e) => setFormValues({ ...formValues, origin: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading focus:outline-none focus:border-accent disabled:opacity-50 ${
                                        fieldErrors.origin ? 'border-rose-500' : 'border-border'
                                    }`}
                                />
                                {fieldErrors.origin && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.origin}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMapPin className="w-3.5 h-3.5 text-body" />
                                    وجهة الوصول <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.destination}
                                    onChange={(e) => setFormValues({ ...formValues, destination: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading focus:outline-none focus:border-accent disabled:opacity-50 ${
                                        fieldErrors.destination ? 'border-rose-500' : 'border-border'
                                    }`}
                                />
                                {fieldErrors.destination && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.destination}</span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuTruck className="w-3.5 h-3.5 text-body" />
                                    نوع المركبة <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.vehicleType}
                                    onChange={(e) => setFormValues({ ...formValues, vehicleType: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading focus:outline-none focus:border-accent disabled:opacity-50 ${
                                        fieldErrors.vehicleType ? 'border-rose-500' : 'border-border'
                                    }`}
                                />
                                {fieldErrors.vehicleType && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.vehicleType}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCoins className="w-3.5 h-3.5 text-body" />
                                    السعر الأساسي للمسار (ر.س) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.basePrice}
                                    onChange={(e) => setFormValues({ ...formValues, basePrice: Number(e.target.value) })}
                                    min={0}
                                    step="any"
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${
                                        fieldErrors.basePrice ? 'border-rose-500' : 'border-border'
                                    }`}
                                />
                                {fieldErrors.basePrice && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.basePrice}</span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuClock className="w-3.5 h-3.5 text-body" />
                                    وقت الترانزيت التقديري
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.estimatedTransitTime}
                                    onChange={(e) => setFormValues({ ...formValues, estimatedTransitTime: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuBuilding2 className="w-3.5 h-3.5 text-body" />
                                    الناقل المعين
                                </label>
                                <select
                                    disabled={isSubmitting || isLoadingCarriers}
                                    value={formValues.carrierId}
                                    onChange={(e) => setFormValues({ ...formValues, carrierId: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">جميع الناقلين المتاحين</option>
                                    {carriers.map((car) => (
                                        <option key={car._id} value={car._id}>
                                            {car.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading block">
                                حالة المسار
                            </label>
                            <select
                                disabled={isSubmitting}
                                value={formValues.isActive ? 'active' : 'inactive'}
                                onChange={(e) => setFormValues({ ...formValues, isActive: e.target.value === 'active' })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                            >
                                <option value="active">نشط ومتاح</option>
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
