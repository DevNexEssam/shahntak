"use client";

import React, { useState } from 'react';
import { useCreateCompanyVehicle } from '@/hooks/company/useCompanyVehicle';
import toast from 'react-hot-toast';
import {
    LuTruck,
    LuX,
    LuWeight,
    LuBox,
    LuCheck,
    LuLayers
} from 'react-icons/lu';

interface AddCompanyVehiclePopupProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddCompanyVehiclePopup({ isOpen = true, onClose }: AddCompanyVehiclePopupProps) {
    const [formValues, setFormValues] = useState({
        type: '',
        capacityWeight: 0,
        capacityVolume: 0,
        isActive: true,
    });

    const { mutate: createVehicle, isPending: isSubmitting } = useCreateCompanyVehicle();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formValues.type.trim()) {
            toast.error("Please enter the vehicle/truck type");
            return;
        }

        createVehicle({ data: formValues }, {
            onSuccess: () => {
                setFormValues({
                    type: '',
                    capacityWeight: 0,
                    capacityVolume: 0,
                    isActive: true,
                });
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuTruck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">Add Fleet Vehicle</h2>
                            <p className="text-xs text-body mt-0.5">Register type and load specifications for the new truck</p>
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-5 flex-1">

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuTruck className="w-3.5 h-3.5 text-body" />
                                Vehicle / Truck Type <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                disabled={isSubmitting}
                                value={formValues.type}
                                onChange={(e) => setFormValues({ ...formValues, type: e.target.value })}
                                placeholder="e.g. 6-Ton Closed Truck, 12m Flatbed Trailer..."
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuWeight className="w-3.5 h-3.5 text-body" />
                                    Max Weight Capacity (kg)
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.capacityWeight}
                                    onChange={(e) => setFormValues({ ...formValues, capacityWeight: Number(e.target.value) })}
                                    placeholder="0"
                                    min={0}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuBox className="w-3.5 h-3.5 text-body" />
                                    Max Volume Capacity (m³)
                                </label>
                                <input
                                    type="number"
                                    disabled={isSubmitting}
                                    value={formValues.capacityVolume}
                                    onChange={(e) => setFormValues({ ...formValues, capacityVolume: Number(e.target.value) })}
                                    placeholder="0"
                                    min={0}
                                    className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading">Operational Status</label>
                            <select
                                value={formValues.isActive ? 'active' : 'inactive'}
                                onChange={(e) => setFormValues({ ...formValues, isActive: e.target.value === 'active' })}
                                className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer font-bold"
                            >
                                <option value="active">Active & Ready for Operation</option>
                                <option value="inactive">Inactive / Under Maintenance</option>
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
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[130px] justify-center"
                        >
                            {isSubmitting ? "Adding..." : "Save Vehicle"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
