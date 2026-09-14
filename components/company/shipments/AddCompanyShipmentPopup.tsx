"use client";

import React, { useState } from 'react';
import { useCreateCompanyShipment } from '@/hooks/company/useCompanyShipment';
import { useAllCompanyRoutes } from '@/hooks/company/useCompanyRoute';
import {
    LuTruck,
    LuX,
    LuMapPin,
    LuHash,
    LuReceipt,
    LuLayers,
    LuRoute
} from 'react-icons/lu';

interface AddCompanyShipmentPopupProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddCompanyShipmentPopup({ isOpen = true, onClose }: AddCompanyShipmentPopupProps) {
    const [selectedRouteId, setSelectedRouteId] = useState<string>('');
    const [formValues, setFormValues] = useState({
        type: 'local_delivery' as 'ftl' | 'ltl' | 'local_delivery',
        origin: '',
        destination: '',
        routeId: '' as string,
        ordersCount: 1,
        status: 'created' as const,
    });

    const { data: routesResponse } = useAllCompanyRoutes();
    const routesList = routesResponse?.data || [];

    const { mutate: createShipment, isPending: isSubmitting } = useCreateCompanyShipment();

    const handleRouteSelect = (routeId: string) => {
        setSelectedRouteId(routeId);
        if (!routeId) {
            setFormValues(prev => ({ ...prev, routeId: '' }));
            return;
        }

        const selectedRoute = routesList.find((r: any) => r._id === routeId);
        if (selectedRoute) {
            setFormValues(prev => ({
                ...prev,
                routeId: selectedRoute._id,
                origin: selectedRoute.origin || prev.origin,
                destination: selectedRoute.destination || prev.destination,
            }));
        }
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const shipmentNumber = `SHP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const waybillNumber = `WB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const trackingNumber = `TRK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        const payload = {
            ...formValues,
            shipmentNumber,
            waybillNumber,
            trackingNumber,
        };

        createShipment({ data: payload }, {
            onSuccess: () => {
                setSelectedRouteId('');
                setFormValues({
                    type: 'local_delivery',
                    origin: '',
                    destination: '',
                    routeId: '',
                    ordersCount: 1,
                    status: 'created',
                });
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuTruck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">Create New Shipment</h2>
                            <p className="text-xs text-body mt-0.5">Configure shipment details, route, and logistics information for your company</p>
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
                    <div className="p-6 overflow-y-auto space-y-6 flex-1">

                        {/* Shipment Auto Numbers */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                Automated Waybill & Shipment Number Generation
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuHash className="w-3.5 h-3.5 text-accent" />
                                        Auto Shipment Number
                                    </label>
                                    <div className="w-full px-4 py-2.5 rounded-md bg-surface-muted/70 border border-border text-sm font-extrabold text-accent flex items-center justify-between">
                                        <span>Auto Generated (SHP-XXXXX)</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuReceipt className="w-3.5 h-3.5 text-accent" />
                                        Official Waybill Number
                                    </label>
                                    <div className="w-full px-4 py-2.5 rounded-md bg-surface-muted/70 border border-border text-sm font-extrabold text-accent flex items-center justify-between">
                                        <span>Auto Generated (WB-XXXXX)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Route & Type Details */}
                        <div className="space-y-4 pt-2 border-t border-border">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                Shipment Type & Logistics Route
                            </h3>

                            {/* Optional Pre-defined Route Select */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuRoute className="w-3.5 h-3.5 text-accent" />
                                    Select Registered Company Route (Optional)
                                </label>
                                <select
                                    value={selectedRouteId}
                                    onChange={(e) => handleRouteSelect(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer"
                                >
                                    <option value="">-- Custom Route / Manual Input --</option>
                                    {routesList.map((rt: any) => (
                                        <option key={rt._id} value={rt._id}>
                                            {rt.origin} → {rt.destination} ({rt.vehicleType || "General"})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading">Shipment Type <span className="text-red-500">*</span></label>
                                <select
                                    value={formValues.type}
                                    onChange={(e) => setFormValues({ ...formValues, type: e.target.value as any })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer"
                                >
                                    <option value="local_delivery">Local Delivery</option>
                                    <option value="ltl">Less Than Truckload (LTL)</option>
                                    <option value="ftl">Full Truckload (FTL)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuMapPin className="w-3.5 h-3.5 text-body" />
                                        Origin City (Source) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.origin}
                                        onChange={(e) => setFormValues({ ...formValues, origin: e.target.value })}
                                        placeholder="e.g. Riyadh"
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuMapPin className="w-3.5 h-3.5 text-body" />
                                        Destination City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.destination}
                                        onChange={(e) => setFormValues({ ...formValues, destination: e.target.value })}
                                        placeholder="e.g. Jeddah, Dammam..."
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipment Specifications */}
                        <div className="space-y-4 pt-2 border-t border-border">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuLayers className="w-3.5 h-3.5 text-body" />
                                    Number of Attached Orders
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.ordersCount}
                                    onChange={(e) => setFormValues({ ...formValues, ordersCount: Number(e.target.value) })}
                                    min={1}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                />
                            </div>
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
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[130px] justify-center"
                        >
                            {isSubmitting ? "Creating..." : "Save Shipment"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}

