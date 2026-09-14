"use client";

import React, { useState } from 'react';
import { usePlans, useDeletePlan } from '@/hooks/plans/usePlans';
import { Plan } from '@/types/data';
import AddPlans from './AddPlans';
import EditPlans from './EditPlans';
import DetailsPlans from './DetailsPlans';
import Loading from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/ErrorMessege';
import EmptyData from '@/components/ui/EmptyData';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import {
    LuCreditCard,
    LuPlus,
    LuSearch,
    LuEye,
    LuPencil,
    LuTrash2,
    LuCheck,
    LuZap,
    LuBox,
    LuLayers,
    LuUsers
} from 'react-icons/lu';

export default function Plans() {
    const [page, setPage] = useState(1);
    const limit = 9;
    const [search, setSearch] = useState('');
    const [cycle, setCycle] = useState('all');

    // Modals state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<Plan | null>(null);
    const [selectedPlanForDetails, setSelectedPlanForDetails] = useState<Plan | null>(null);
    const [selectedPlanForDelete, setSelectedPlanForDelete] = useState<Plan | null>(null);

    const { data: plansRes, isLoading, isError, refetch } = usePlans(page, limit, search, cycle);
    const { mutate: deletePlan, isPending: isDeleting } = useDeletePlan();

    const plansList = plansRes?.data || [];
    const stats = plansRes?.stats;

    const handleDeleteConfirm = () => {
        if (!selectedPlanForDelete) return;
        deletePlan(
            { id: selectedPlanForDelete._id, hard: false },
            {
                onSuccess: () => {
                    setSelectedPlanForDelete(null);
                    refetch();
                },
            }
        );
    };

    return (
        <div className="space-y-6 text-left">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading">Cloud Plans Management</h1>
                    <p className="text-sm text-body mt-1">Browse and customize company subscription plans, allowed limits, and pricing on the Shahntak platform.</p>
                </div>

                <button
                    onClick={() => setIsAddOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer hover:bg-accent/90"
                >
                    <LuPlus className="w-5 h-5" />
                    <span>Add New Plan</span>
                </button>
            </div>

            {/* KPI / Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Total Plans</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats?.total ?? 0}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Plans available on the platform</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuZap className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Active Plans</span>
                            <h3 className="text-2xl font-bold text-emerald-600 my-1 font-latin">{stats?.active ?? 0}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Ready for company subscriptions</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <LuCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">Disabled Plans</span>
                            <h3 className="text-2xl font-bold text-rose-600 my-1 font-latin">{stats?.inactive ?? 0}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>Not available for subscription</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                            <LuCreditCard className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by plan name..."
                        className="w-full pl-10 pr-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setCycle('all')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${cycle === 'all'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface-muted text-body border border-border hover:text-heading'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setCycle('monthly')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${cycle === 'monthly'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface-muted text-body border border-border hover:text-heading'
                            }`}
                    >
                        Monthly Billing
                    </button>
                    <button
                        onClick={() => setCycle('yearly')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${cycle === 'yearly'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface-muted text-body border border-border hover:text-heading'
                            }`}
                    >
                        Yearly Billing
                    </button>
                </div>
            </div>

            {/* Plans Grid Display */}
            {isLoading ? (
                <Loading />
            ) : isError ? (
                <ErrorMessage message="An error occurred while loading plan data" />
            ) : plansList.length === 0 ? (
                <EmptyData message="No cloud plans matching these filters have been added yet." icon={LuCreditCard} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plansList.map((plan) => (
                        <div
                            key={plan._id}
                            className="bg-surface border border-border rounded-md p-5 flex flex-col justify-between relative overflow-hidden group"
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-heading group-hover:text-accent transition-colors">{plan.name}</h3>
                                        <span className="text-xs text-body mt-0.5 block">{plan.description || 'Cloud logistics services plan'}</span>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${plan.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                                        {plan.isActive ? 'Active' : 'Disabled'}
                                    </span>
                                </div>

                                {/* Price tag */}
                                <div className="p-4 rounded-md bg-surface-muted border border-border flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-heading font-latin">{plan.price.toLocaleString('en-US')}</span>
                                    <span className="text-xs font-bold text-body">SAR / {plan.billingCycle === 'monthly' ? 'month' : 'year'}</span>
                                </div>

                                {/* Limits */}
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div className="p-2 rounded-md bg-surface-muted border border-border">
                                        <LuBox className="w-4 h-4 text-accent mx-auto mb-1" />
                                        <span className="font-bold text-heading font-latin">
                                            {plan.maxOrdersPerMonth === -1 ? '∞' : plan.maxOrdersPerMonth}
                                        </span>
                                        <span className="text-[10px] text-body block">orders/mo</span>
                                    </div>

                                    <div className="p-2 rounded-md bg-surface-muted border border-border">
                                        <LuLayers className="w-4 h-4 text-accent mx-auto mb-1" />
                                        <span className="font-bold text-heading font-latin">
                                            {plan.maxShipmentsPerMonth === -1 ? '∞' : plan.maxShipmentsPerMonth}
                                        </span>
                                        <span className="text-[10px] text-body block">shipments/mo</span>
                                    </div>

                                    <div className="p-2 rounded-md bg-surface-muted border border-border">
                                        <LuUsers className="w-4 h-4 text-accent mx-auto mb-1" />
                                        <span className="font-bold text-heading font-latin">{plan.maxCompanyUsers}</span>
                                        <span className="text-[10px] text-body block">employees</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="space-y-1.5 pt-2 border-t border-border">
                                    {plan.features?.slice(0, 3).map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-body">
                                            <LuCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                            <span className="truncate">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between gap-2">
                                <button
                                    onClick={() => setSelectedPlanForDetails(plan)}
                                    className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                    title="View details"
                                >
                                    <LuEye className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setSelectedPlanForEdit(plan)}
                                        className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                        title="Edit data"
                                    >
                                        <LuPencil className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => setSelectedPlanForDelete(plan)}
                                        className="p-2 rounded-md bg-surface-muted hover:bg-rose-500/10 text-body hover:text-rose-600 border border-border transition-all cursor-pointer"
                                        title="Delete plan"
                                    >
                                        <LuTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals Mounting */}
            <AddPlans
                isOpen={isAddOpen}
                onClose={() => {
                    setIsAddOpen(false);
                    refetch();
                }}
            />

            <EditPlans
                isOpen={!!selectedPlanForEdit}
                plan={selectedPlanForEdit}
                onClose={() => {
                    setSelectedPlanForEdit(null);
                    refetch();
                }}
            />

            <DetailsPlans
                isOpen={!!selectedPlanForDetails}
                plan={selectedPlanForDetails}
                onClose={() => setSelectedPlanForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedPlanForDelete}
                title="Confirm Cloud Plan Deletion"
                description={`Are you sure you want to delete the plan (${selectedPlanForDelete?.name})?`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedPlanForDelete(null)}
            />

        </div>
    );
}