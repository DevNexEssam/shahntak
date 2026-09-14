"use client";

import React, { useState } from 'react';
import { useCreateRoute } from '@/hooks/routes/useRoutes';
import { useAllCarriers } from '@/hooks/carriers/useCarriers';
import { routeCreateValidationSchema } from '@/lib/validations/route.schema';
import toast from 'react-hot-toast';
import {
    LuMapPin,
    LuX,
    LuTruck,
    LuCoins,
    LuClock,
    LuBuilding2
} from 'react-icons/lu';

interface AddRoutesProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddRoutes({ isOpen = true, onClose }: AddRoutesProps) {
    const [formValues, setFormValues] = useState({
        origin: '',
        destination: '',
        vehicleType: 'Large Truck (Dina)',
        basePrice: 500,
        carrierId: '',
        estimatedTransitTime: '24 hours',
        isActive: true,
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: createRoute, isPending: isSubmitting } = useCreateRoute();
    const { data: carriersRes, isLoading: isLoadingCarriers } = useAllCarriers();

    if (!isOpen) return null;

    const carriers = carriersRes?.data || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        // Zod Validation Check
        const validation = routeCreateValidationSchema.safeParse(formValues);
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

        // Trigger Mutation
        createRoute(formValues, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="ltr">
            {/* Modal Container */}
            <div className="relative w-full max-w-xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuMapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">Add New Logistics Route</h2>
                            <p className="text-xs text-body mt-0.5">Define the origin, destination, vehicle type, and pricing</p>
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
                    <div className="p-6 overflow-y-auto space-y-5 flex-1 text-left">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMapPin className="w-3.5 h-3.5 text-body" />
                                    Origin Point <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.origin}
                                    onChange={(e) => setFormValues({ ...formValues, origin: e.target.value })}
                                    placeholder="Riyadh, Jeddah, Dammam..."
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.origin ? 'border-rose-500' : 'border-border'
                                        }`}
                                />
                                {fieldErrors.origin && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.origin}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMapPin className="w-3.5 h-3.5 text-body" />
                                    Destination Point <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.destination}
                                    onChange={(e) => setFormValues({ ...formValues, destination: e.target.value })}
                                    placeholder="Makkah, Madinah, Hofuf Complex..."
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.destination ? 'border-rose-500' : 'border-border'
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
                                    Required Vehicle Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    disabled={isSubmitting}
                                    value={formValues.vehicleType}
                                    onChange={(e) => setFormValues({ ...formValues, vehicleType: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50 ${fieldErrors.vehicleType ? 'border-rose-500' : 'border-border'
                                        }`}
                                >
                                    <option value="Large Truck (Dina)">Large Truck (Dina)</option>
                                    <option value="Enclosed Truck (Trailer)">Enclosed Truck (Trailer)</option>
                                    <option value="Small Transport Vehicle (Pickup)">Small Transport Vehicle (Pickup)</option>
                                    <option value="Refrigerated Truck">Refrigerated Truck</option>
                                </select>
                                {fieldErrors.vehicleType && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.vehicleType}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCoins className="w-3.5 h-3.5 text-body" />
                                    Route Base Price (SAR) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.basePrice}
                                    onChange={(e) => setFormValues({ ...formValues, basePrice: Number(e.target.value) })}
                                    min={0}
                                    step="any"
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.basePrice ? 'border-rose-500' : 'border-border'
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
                                    Estimated Transit Time
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.estimatedTransitTime}
                                    onChange={(e) => setFormValues({ ...formValues, estimatedTransitTime: e.target.value })}
                                    placeholder="e.g., 24 hours / 2 days"
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuBuilding2 className="w-3.5 h-3.5 text-body" />
                                    Assign Specific Carrier (Optional)
                                </label>
                                <select
                                    disabled={isSubmitting || isLoadingCarriers}
                                    value={formValues.carrierId}
                                    onChange={(e) => setFormValues({ ...formValues, carrierId: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">All Available Carriers</option>
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
                                Route Status
                            </label>
                            <select
                                disabled={isSubmitting}
                                value={formValues.isActive ? 'active' : 'inactive'}
                                onChange={(e) => setFormValues({ ...formValues, isActive: e.target.value === 'active' })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                            >
                                <option value="active">Active & Available</option>
                                <option value="inactive">Temporarily Suspended</option>
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