"use client";

import React, { useState, useEffect } from 'react';
import { Shipment, Company, Route as RouteType, Carrier, Vehicle } from '@/types/data';
import { useUpdateShipment } from '@/hooks/shipments/useShipments';
import { useAllCompanies } from '@/hooks/companies/useCompanies';
import { useAllRoutes } from '@/hooks/routes/useRoutes';
import { useAllCarriers } from '@/hooks/carriers/useCarriers';
import { useAllVehicles } from '@/hooks/vehicles/useVehicles';
import { shipmentUpdateValidationSchema } from '@/lib/validations/shipment.schema';
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
    LuPencil,
    LuLayers
} from 'react-icons/lu';

interface EditShipmentsProps {
    isOpen?: boolean;
    shipment: Shipment | null;
    onClose: () => void;
}

export default function EditShipments({ isOpen = true, shipment, onClose }: EditShipmentsProps) {
    const [formValues, setFormValues] = useState({
        companyId: '',
        type: 'ftl' as 'ftl' | 'ltl' | 'local_delivery',
        origin: '',
        destination: '',
        routeId: '',
        carrierId: '',
        vehicleId: '',
        ordersCount: 0,
        shippingCost: 0,
        customerPrice: 0,
        waybillNumber: '',
        trackingNumber: '',
        status: 'created' as any,
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: updateShipment, isPending: isSubmitting } = useUpdateShipment();

    // Fetch relational resources for selection
    const { data: companiesRes, isLoading: isLoadingCompanies } = useAllCompanies();
    const { data: routesRes, isLoading: isLoadingRoutes } = useAllRoutes();
    const { data: carriersRes, isLoading: isLoadingCarriers } = useAllCarriers();
    const { data: vehiclesRes, isLoading: isLoadingVehicles } = useAllVehicles();

    useEffect(() => {
        if (shipment) {
            const compId = typeof shipment.companyId === 'object' && shipment.companyId !== null
                ? (shipment.companyId as Company)._id
                : (shipment.companyId as string) || '';

            const rtId = typeof shipment.routeId === 'object' && shipment.routeId !== null
                ? (shipment.routeId as RouteType)._id
                : (shipment.routeId as string) || '';

            const carId = typeof shipment.carrierId === 'object' && shipment.carrierId !== null
                ? (shipment.carrierId as Carrier)._id
                : (shipment.carrierId as string) || '';

            const vehId = typeof shipment.vehicleId === 'object' && shipment.vehicleId !== null
                ? (shipment.vehicleId as Vehicle)._id
                : (shipment.vehicleId as string) || '';

            setFormValues({
                companyId: compId,
                type: shipment.type || 'ftl',
                origin: shipment.origin || '',
                destination: shipment.destination || '',
                routeId: rtId,
                carrierId: carId,
                vehicleId: vehId,
                ordersCount: shipment.ordersCount || 0,
                shippingCost: shipment.shippingCost || 0,
                customerPrice: shipment.customerPrice || 0,
                waybillNumber: shipment.waybillNumber || '',
                trackingNumber: shipment.trackingNumber || '',
                status: shipment.status || 'created',
            });
            setFieldErrors({});
        }
    }, [shipment]);

    if (!isOpen || !shipment) return null;

    const companies = companiesRes?.data || [];
    const routes = routesRes?.data || [];
    const carriers = carriersRes?.data || [];
    const vehicles = vehiclesRes?.data || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const payload = {
            ...formValues,
            routeId: formValues.routeId || undefined,
            carrierId: formValues.carrierId || undefined,
            vehicleId: formValues.vehicleId || undefined,
            waybillNumber: formValues.waybillNumber || undefined,
            trackingNumber: formValues.trackingNumber || undefined,
        };

        // Zod Validation Check
        const validation = shipmentUpdateValidationSchema.safeParse(payload);
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
        updateShipment(
            { id: shipment._id, updates: payload },
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
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuPencil className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تعديل بيانات الشحنة</h2>
                            <p className="text-xs text-body mt-0.5">تعديل معلومات الشحنة: <span className="font-bold text-accent font-latin">{shipment.shipmentNumber}</span></p>
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

                        {/* Company & Type Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuBuilding2 className="w-3.5 h-3.5 text-body" />
                                    الشركة المالكة للشحنة
                                </label>
                                <select
                                    disabled={isSubmitting || isLoadingCompanies}
                                    value={formValues.companyId}
                                    onChange={(e) => setFormValues({ ...formValues, companyId: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50 ${
                                        fieldErrors.companyId ? 'border-rose-500' : 'border-border'
                                    }`}
                                >
                                    <option value="">اختر الشركة...</option>
                                    {companies.map((comp) => (
                                        <option key={comp._id} value={comp._id}>
                                            {comp.companyName} ({comp.city})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuLayers className="w-3.5 h-3.5 text-body" />
                                    نوع الشحنة
                                </label>
                                <select
                                    disabled={isSubmitting}
                                    value={formValues.type}
                                    onChange={(e) => setFormValues({ ...formValues, type: e.target.value as any })}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                >
                                    <option value="ftl">حمولة كاملة</option>
                                    <option value="ltl">حمولة جزئية</option>
                                    <option value="local_delivery">توصيل محلي</option>
                                </select>
                            </div>
                        </div>

                        {/* Origin & Destination */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMapPin className="w-3.5 h-3.5 text-emerald-600" />
                                    نقطة انطلاق الشحنة
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
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMapPin className="w-3.5 h-3.5 text-rose-600" />
                                    وجهة وصول الشحنة
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
                            </div>
                        </div>

                        {/* Relational Resource Assignment */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface-muted/40 p-4 rounded-xl border border-border">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuRoute className="w-3.5 h-3.5 text-body" />
                                    المسار المعتمد
                                </label>
                                <select
                                    disabled={isSubmitting || isLoadingRoutes}
                                    value={formValues.routeId}
                                    onChange={(e) => setFormValues({ ...formValues, routeId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md bg-surface border border-border text-xs text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">بدون مسار محدد...</option>
                                    {routes.map((rt) => (
                                        <option key={rt._id} value={rt._id}>
                                            {rt.origin} ➔ {rt.destination}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuTruck className="w-3.5 h-3.5 text-body" />
                                    الناقل الشريك
                                </label>
                                <select
                                    disabled={isSubmitting || isLoadingCarriers}
                                    value={formValues.carrierId}
                                    onChange={(e) => setFormValues({ ...formValues, carrierId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md bg-surface border border-border text-xs text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">بدون ناقل محدد...</option>
                                    {carriers.map((car) => (
                                        <option key={car._id} value={car._id}>
                                            {car.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuBox className="w-3.5 h-3.5 text-body" />
                                    المركبة المعينة
                                </label>
                                <select
                                    disabled={isSubmitting || isLoadingVehicles}
                                    value={formValues.vehicleId}
                                    onChange={(e) => setFormValues({ ...formValues, vehicleId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-md bg-surface border border-border text-xs text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">بدون مركبة مخصصة...</option>
                                    {vehicles.map((veh) => (
                                        <option key={veh._id} value={veh._id}>
                                            مركبة ({veh.type}) - {veh.capacityWeight} طن
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Financial Costs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCoins className="w-3.5 h-3.5 text-body" />
                                    تكلفة الشحن (ر.س)
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.shippingCost}
                                    onChange={(e) => setFormValues({ ...formValues, shippingCost: Number(e.target.value) })}
                                    min={0}
                                    step="any"
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${
                                        fieldErrors.shippingCost ? 'border-rose-500' : 'border-border'
                                    }`}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCoins className="w-3.5 h-3.5 text-emerald-600" />
                                    سعر العميل (ر.س)
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.customerPrice}
                                    onChange={(e) => setFormValues({ ...formValues, customerPrice: Number(e.target.value) })}
                                    min={0}
                                    step="any"
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading font-latin focus:outline-none focus:border-accent disabled:opacity-50 ${
                                        fieldErrors.customerPrice ? 'border-rose-500' : 'border-border'
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading block">
                                حالة الشحنة التشغيلية
                            </label>
                            <select
                                disabled={isSubmitting}
                                value={formValues.status}
                                onChange={(e) => setFormValues({ ...formValues, status: e.target.value as any })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50 font-medium"
                            >
                                <option value="created">تمت الإنشائية مبدئياً</option>
                                <option value="confirmed">مؤكدة بانتظار التخصيص</option>
                                <option value="assigned">تم تعيين الناقل والمركبة</option>
                                <option value="ready_for_pickup">جاهزة للتحميل</option>
                                <option value="picked_up">تم التحميل بالموقع</option>
                                <option value="in_transit">في الطريق اللوجستي</option>
                                <option value="arrived">وصلت المحطة النهائية</option>
                                <option value="out_for_delivery">خرجت للتسليم اللحظي</option>
                                <option value="delivered">تم التسليم بنجاح للعميل</option>
                                <option value="delivery_failed">فشل التسليم</option>
                                <option value="cancelled">ملغاة</option>
                                <option value="returned">مرجعة للمستودع</option>
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
