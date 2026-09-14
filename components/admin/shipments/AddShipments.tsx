"use client";

import React, { useState } from 'react';
import AdminCompanySelect from '@/components/admin/common/AdminCompanySelect';
import AdminCompanySubscriptionWidget from '@/components/admin/common/AdminCompanySubscriptionWidget';
import { useCreateShipment } from '@/hooks/shipments/useShipments';
import { useAllCompanies } from '@/hooks/companies/useCompanies';
import { useAllRoutes } from '@/hooks/routes/useRoutes';
import { useAllCarriers } from '@/hooks/carriers/useCarriers';
import { useAllVehicles } from '@/hooks/vehicles/useVehicles';
import { shipmentCreateValidationSchema } from '@/lib/validations/shipment.schema';
import toast from 'react-hot-toast';
import {
    LuPackage,
    LuX,
    LuBuilding2,
    LuMapPin,
    LuRoute,
    LuTruck,
    LuBox,
    LuCoins,
    LuHash,
    LuLayers
} from 'react-icons/lu';

interface AddShipmentsProps {
    isOpen?: boolean;
    onClose: () => void;
    initialOrderIds?: string[];
    initialCompanyId?: string;
    initialDestination?: string;
    isGrouping?: boolean;
}

export default function AddShipments({
    isOpen = true,
    onClose,
    initialOrderIds,
    initialCompanyId,
    initialDestination,
    isGrouping = false
}: AddShipmentsProps) {
    const isGroupingMode = isGrouping || (initialOrderIds && initialOrderIds.length > 0);

    const [formValues, setFormValues] = useState({
        shipmentNumber: `SHP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        companyId: initialCompanyId || '',
        type: 'ftl' as 'ftl' | 'ltl' | 'local_delivery',
        origin: 'Riyadh',
        destination: initialDestination || 'Jeddah',
        routeId: '',
        carrierId: '',
        vehicleId: '',
        ordersCount: initialOrderIds?.length || 1,
        shippingCost: 500,
        customerPrice: 750,
        status: 'created' as any,
    });

    // Sync values when props change or modal opens
    React.useEffect(() => {
        if (isOpen) {
            setFormValues((prev) => ({
                ...prev,
                shipmentNumber: `SHP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                companyId: initialCompanyId || prev.companyId,
                destination: initialDestination || prev.destination,
                ordersCount: initialOrderIds?.length || prev.ordersCount || 1,
            }));
        }
    }, [isOpen, initialCompanyId, initialDestination, initialOrderIds]);

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: createShipment, isPending: isSubmitting } = useCreateShipment();

    // Fetch relational resources for selection
    const { data: companiesRes, isLoading: isLoadingCompanies } = useAllCompanies();
    const { data: routesRes, isLoading: isLoadingRoutes } = useAllRoutes();
    const { data: carriersRes, isLoading: isLoadingCarriers } = useAllCarriers();
    const { data: vehiclesRes, isLoading: isLoadingVehicles } = useAllVehicles();

    if (!isOpen) return null;

    const companies = companiesRes?.data || [];
    const routes = routesRes?.data || [];
    const carriers = carriersRes?.data || [];
    const vehicles = vehiclesRes?.data || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const payload = {
            ...formValues,
            orderIds: initialOrderIds && initialOrderIds.length > 0 ? initialOrderIds : undefined,
            routeId: formValues.routeId || undefined,
            carrierId: formValues.carrierId || undefined,
            vehicleId: formValues.vehicleId || undefined,
        };

        // Zod Validation Check
        const validation = shipmentCreateValidationSchema.safeParse(payload);
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
        createShipment(payload, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="ltr">
            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuLayers className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">
                                {isGroupingMode ? `Group ${initialOrderIds?.length || ''} Orders into One Shipment` : 'Create New Logistics Shipment'}
                            </h2>
                            <p className="text-xs text-body mt-0.5">
                                {isGroupingMode
                                    ? 'The shipment and waybill numbers will be auto-generated and the linked orders will be converted to grouped'
                                    : 'Register shipment data and assign the company, route, partner carrier, and vehicle'}
                            </p>
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

                        {/* Top Info: Shipment Number & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuHash className="w-3.5 h-3.5 text-accent" />
                                    Auto Shipment Number <span className="text-xs font-normal text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">(Auto-generated)</span>
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={formValues.shipmentNumber}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted/80 border border-border text-sm font-bold text-accent font-latin cursor-not-allowed opacity-90"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuLayers className="w-3.5 h-3.5 text-body" />
                                    Logistics Shipment Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    disabled={isSubmitting}
                                    value={formValues.type}
                                    onChange={(e) => setFormValues({ ...formValues, type: e.target.value as any })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                >
                                    <option value="ftl">Full Truckload</option>
                                    <option value="ltl">Less-Than-Truckload</option>
                                    <option value="local_delivery">Direct Local Delivery</option>
                                </select>
                            </div>
                        </div>

                        {/* Company Selection with Live Subscription Quota */}
                        <div className="space-y-2">
                            <AdminCompanySelect
                                value={formValues.companyId}
                                onChange={(companyId: string) => {
                                    setFormValues((prev) => ({ ...prev, companyId }));
                                    if (fieldErrors.companyId) {
                                        setFieldErrors((prev) => ({ ...prev, companyId: '' }));
                                    }
                                }}
                                disabled={isSubmitting}
                                error={fieldErrors.companyId}
                            />

                            {/* Live Subscription Quota Widget */}
                            {formValues.companyId && (
                                <AdminCompanySubscriptionWidget
                                    companyId={formValues.companyId}
                                />
                            )}
                        </div>

                        {/* Origin & Destination */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMapPin className="w-3.5 h-3.5 text-emerald-600" />
                                    Shipment Origin Point <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.origin}
                                    onChange={(e) => setFormValues({ ...formValues, origin: e.target.value })}
                                    placeholder="Riyadh, Sulay Warehouse..."
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.origin ? 'border-rose-500' : 'border-border'
                                        }`}
                                />
                                {fieldErrors.origin && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.origin}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMapPin className="w-3.5 h-3.5 text-rose-600" />
                                    Shipment Destination Point <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.destination}
                                    onChange={(e) => setFormValues({ ...formValues, destination: e.target.value })}
                                    placeholder="Jeddah, Al Khumrah Port..."
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.destination ? 'border-rose-500' : 'border-border'
                                        }`}
                                />
                                {fieldErrors.destination && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.destination}</span>
                                )}
                            </div>
                        </div>

                        {/* Optional Resources: Route, Carrier, Vehicle */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface-muted/40 p-4 rounded-xl border border-border">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuRoute className="w-3.5 h-3.5 text-body" />
                                    Approved Route
                                </label>
                                <select
                                    disabled={isSubmitting || isLoadingRoutes}
                                    value={formValues.routeId}
                                    onChange={(e) => setFormValues({ ...formValues, routeId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md bg-surface border border-border text-xs text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">No route specified...</option>
                                    {routes.map((rt) => (
                                        <option key={rt._id} value={rt._id}>
                                            {rt.origin} ➔ {rt.destination} ({rt.basePrice} SAR)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuTruck className="w-3.5 h-3.5 text-body" />
                                    Partner Carrier
                                </label>
                                <select
                                    disabled={isSubmitting || isLoadingCarriers}
                                    value={formValues.carrierId}
                                    onChange={(e) => setFormValues({ ...formValues, carrierId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md bg-surface border border-border text-xs text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">No carrier specified...</option>
                                    {carriers.map((car) => (
                                        <option key={car._id} value={car._id}>
                                            {car.name} ({car.type === 'external_api' ? 'API' : 'Local'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuBox className="w-3.5 h-3.5 text-body" />
                                    Assigned Vehicle
                                </label>
                                <select
                                    disabled={isSubmitting || isLoadingVehicles}
                                    value={formValues.vehicleId}
                                    onChange={(e) => setFormValues({ ...formValues, vehicleId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md bg-surface border border-border text-xs text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">No vehicle assigned...</option>
                                    {vehicles.map((veh) => (
                                        <option key={veh._id} value={veh._id}>
                                            Vehicle ({veh.type}) - Capacity {veh.capacityWeight} tons
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCoins className="w-3.5 h-3.5 text-body" />
                                    Actual Shipping Cost (SAR) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.shippingCost}
                                    onChange={(e) => setFormValues({ ...formValues, shippingCost: Number(e.target.value) })}
                                    min={0}
                                    step="any"
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.shippingCost ? 'border-rose-500' : 'border-border'
                                        }`}
                                />
                                {fieldErrors.shippingCost && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.shippingCost}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCoins className="w-3.5 h-3.5 text-emerald-600" />
                                    Customer Invoice Price (SAR) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.customerPrice}
                                    onChange={(e) => setFormValues({ ...formValues, customerPrice: Number(e.target.value) })}
                                    min={0}
                                    step="any"
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${fieldErrors.customerPrice ? 'border-rose-500' : 'border-border'
                                        }`}
                                />
                                {fieldErrors.customerPrice && (
                                    <span className="text-xs text-rose-500 font-medium block">{fieldErrors.customerPrice}</span>
                                )}
                            </div>
                        </div>

                        {/* Shipment Status */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading block">
                                Initial Shipment Status
                            </label>
                            <select
                                disabled={isSubmitting}
                                value={formValues.status}
                                onChange={(e) => setFormValues({ ...formValues, status: e.target.value as any })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                            >
                                <option value="created">Initially Created</option>
                                <option value="confirmed">Confirmed — Awaiting Assignment</option>
                                <option value="assigned">Carrier & Vehicle Assigned</option>
                                <option value="ready_for_pickup">Ready for Warehouse Loading</option>
                                <option value="in_transit">In Logistics Transit</option>
                                <option value="delivered">Final Delivery to Customer Completed</option>
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
                            {isSubmitting ? "Adding..." : "Save Shipment"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}