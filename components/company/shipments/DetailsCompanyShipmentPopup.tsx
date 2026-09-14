"use client";

import React, { useState } from 'react';
import { useCompanyShipmentById } from '@/hooks/company/useCompanyShipment';
import {
    LuTruck,
    LuX,
    LuMapPin,
    LuDownload,
    LuLoader
} from 'react-icons/lu';
import { WaybillPDFDocument } from './WaybillPDFDocument';

interface DetailsCompanyShipmentPopupProps {
    isOpen?: boolean;
    onClose: () => void;
    shipmentData: any;
}

export default function DetailsCompanyShipmentPopup({
    isOpen = true,
    onClose,
    shipmentData
}: DetailsCompanyShipmentPopupProps) {
    const { data: detailResponse } = useCompanyShipmentById(shipmentData?._id || '');
    const activeShipment = detailResponse?.data || shipmentData;

    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    if (!isOpen || !activeShipment) return null;

    const handleDownloadPdf = async () => {
        try {
            setIsGeneratingPdf(true);
            const { pdf } = await import('@react-pdf/renderer');
            const blob = await pdf(<WaybillPDFDocument shipmentData={activeShipment} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Waybill_${activeShipment.waybillNumber || activeShipment.shipmentNumber || 'details'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to generate Waybill PDF:', err);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'created':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-500/10 text-amber-600">
                        New
                    </span>
                );
            case 'confirmed':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-600">
                        Confirmed
                    </span>
                );
            case 'assigned':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-500/10 text-blue-600">
                        Assigned to Carrier
                    </span>
                );
            case 'ready_for_pickup':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-500/10 text-purple-600">
                        Ready for Pickup
                    </span>
                );
            case 'picked_up':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-teal-500/10 text-teal-600">
                        Picked Up
                    </span>
                );
            case 'in_transit':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-sky-500/10 text-sky-600">
                        In Transit
                    </span>
                );
            case 'arrived':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-cyan-500/10 text-cyan-600">
                        Arrived at Facility
                    </span>
                );
            case 'out_for_delivery':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-orange-500/10 text-orange-600">
                        Out for Delivery
                    </span>
                );
            case 'delivered':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600">
                        Delivered
                    </span>
                );
            case 'delivery_failed':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600">
                        Delivery Failed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600">
                        Cancelled
                    </span>
                );
            case 'returned':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-500/10 text-gray-600">
                        Returned
                    </span>
                );
            case 'exception':
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-500/10 text-rose-600">
                        Exception
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-surface-muted text-muted-foreground">
                        {status}
                    </span>
                );
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'ftl': return 'Full Truckload (FTL)';
            case 'ltl': return 'Less Than Truckload (LTL)';
            default: return 'Local Delivery';
        }
    };

    const carrierName = typeof activeShipment.carrierId === 'object' && activeShipment.carrierId !== null
        ? activeShipment.carrierId.name
        : 'Company Fleet (In-House)';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-150">
            <div className="printable-area w-full max-w-xl bg-surface border border-border rounded-md shadow-xs overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuTruck className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-foreground">Shipment & Waybill Details</h2>
                                {getStatusBadge(activeShipment.status)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Shipment #: <span className="font-semibold text-accent">{activeShipment.shipmentNumber}</span></p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md hover:bg-surface-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Close"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">

                    {/* Waybill & Print Summary Row */}
                    <div className="p-4 rounded-md bg-surface-muted border border-border flex items-center justify-between text-xs">
                        <div>
                            <span className="text-muted-foreground block font-medium">Waybill Number</span>
                            <span className="font-bold text-foreground text-sm">
                                {activeShipment.waybillNumber || 'WB-PENDING'}
                            </span>
                            {activeShipment.trackingNumber && (
                                <span className="text-muted-foreground text-[11px] block mt-0.5">Tracking Number: {activeShipment.trackingNumber}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleDownloadPdf}
                                disabled={isGeneratingPdf || activeShipment.status === 'cancelled'}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isGeneratingPdf ? (
                                    <LuLoader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <LuDownload className="w-4 h-4" />
                                )}
                                <span>{isGeneratingPdf ? 'Downloading...' : 'Download PDF'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Logistics Route & Carrier Box */}
                    <div className="p-4 rounded-md border border-border bg-surface space-y-3">
                        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
                            <LuMapPin className="w-4 h-4 text-accent" />
                            <span>Service Route & Carrier</span>
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">Service Type</span>
                                <span className="font-semibold text-foreground">{getTypeLabel(activeShipment.type)}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">Route Line (Origin → Destination)</span>
                                <span className="font-semibold text-foreground">{activeShipment.origin} → {activeShipment.destination}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 border-b border-border">
                                <span className="text-muted-foreground">Assigned Carrier</span>
                                <span className="font-semibold text-foreground">{carrierName}</span>
                            </div>

                            <div className="flex justify-between items-center py-1.5 font-semibold text-foreground">
                                <span className="text-muted-foreground font-normal">Number of Orders / Packages</span>
                                <span>{activeShipment.ordersCount || 1}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-surface-muted flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-semibold rounded-md border border-border bg-surface hover:bg-border/20 transition-colors text-foreground cursor-pointer"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}

