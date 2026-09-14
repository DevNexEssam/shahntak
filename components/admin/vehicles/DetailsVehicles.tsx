"use client";

import React from 'react';
import { Vehicle } from '@/types/data';
import {
    LuTruck,
    LuX,
    LuWeight,
    LuBox,
    LuCalendar,
    LuCheck
} from 'react-icons/lu';

interface DetailsVehiclesProps {
    isOpen?: boolean;
    vehicle: Vehicle | null;
    onClose: () => void;
}

export default function DetailsVehicles({ isOpen = true, vehicle, onClose }: DetailsVehiclesProps) {
    if (!isOpen || !vehicle) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuTruck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">Vehicle Details</h2>
                            <p className="text-xs text-body mt-0.5">View capacity specifications, weight limits, and activation status</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer"
                        title="Close"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">

                    {/* Vehicle Type Card */}
                    <div className="p-5 rounded-2xl bg-surface-muted border border-border flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-accent/10 text-accent flex items-center justify-center font-extrabold">
                                <LuTruck className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-xs text-body font-medium block">Vehicle Type</span>
                                <h3 className="text-lg font-extrabold text-heading">{vehicle.type}</h3>
                            </div>
                        </div>

                        <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${vehicle.isActive !== false
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                                : 'bg-rose-500/10 text-rose-600 border-rose-200'
                            }`}>
                            {vehicle.isActive !== false ? 'Active in Fleet' : 'Inactive'}
                        </span>
                    </div>

                    {/* Capacity Specs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-surface border border-border text-center space-y-1">
                            <LuWeight className="w-6 h-6 text-accent mx-auto mb-1" />
                            <span className="text-xs text-body font-medium block">Max Weight (Peak)</span>
                            <span className="text-base font-extrabold text-heading font-latin">
                                {vehicle.capacityWeight ? `${vehicle.capacityWeight} kg` : 'Not specified'}
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-surface border border-border text-center space-y-1">
                            <LuBox className="w-6 h-6 text-accent mx-auto mb-1" />
                            <span className="text-xs text-body font-medium block">Max Volume (Volumetric)</span>
                            <span className="text-base font-extrabold text-heading font-latin">
                                {vehicle.capacityVolume ? `${vehicle.capacityVolume} m³` : 'Not specified'}
                            </span>
                        </div>
                    </div>

                    {/* Created Date */}
                    <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-body">
                        <div className="flex items-center gap-1.5">
                            <LuCalendar className="w-3.5 h-3.5 text-body/60" />
                            <span>Date Added to Fleet: {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString('en-US') : 'Not specified'}</span>
                        </div>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-border bg-surface-muted/40 flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-xs hover:shadow transition-all cursor-pointer"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}
