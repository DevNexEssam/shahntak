"use client";

import React from "react";
import {
    LuPackage,
    LuTruck,
    LuClock,
    LuCircleCheck,
    LuCircleX,
    LuActivity,
} from "react-icons/lu";

interface OperationsTabProps {
    data: any;
    isLoading: boolean;
}

export const CompanyReportsOperationsTab: React.FC<OperationsTabProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <LuActivity className="w-8 h-8 animate-spin text-accent" />
                <span className="ml-3 font-medium">Loading operations and shipments reports...</span>
            </div>
        );
    }

    const orders = data?.orders || {};
    const shipments = data?.shipments || {};

    return (
        <div className="space-y-6">
            {/* Orders Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Total Orders</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuPackage className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">{orders.total || 0}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Explicit orders registered in system</p>
                    </div>
                </div>

                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Pending Orders</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuClock className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">{orders.pending || 0}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting grouping and routing for shipment</p>
                    </div>
                </div>

                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Completed & Delivered Orders</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuCircleCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">{orders.delivered || 0}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Successfully delivered to customers</p>
                    </div>
                </div>

                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Cancelled Orders</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuCircleX className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">{orders.cancelled || 0}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Cancelled or returned orders</p>
                    </div>
                </div>
            </div>

            {/* Shipments Types & Financial Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Shipment Types Distribution */}
                <div className="p-5 bg-surface border border-border rounded-md space-y-4">
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                        <LuTruck className="w-5 h-5 text-accent" />
                        <span>Shipments Distribution by Logistics Type</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Full Truckload (FTL)</span>
                                <span className="font-semibold">{shipments.ftl || 0} shipments</span>
                            </div>
                            <div className="w-full bg-border/40 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-accent h-full rounded-full transition-all"
                                    style={{
                                        width: `${shipments.total > 0 ? ((shipments.ftl || 0) / shipments.total) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Less Than Truckload (LTL)</span>
                                <span className="font-semibold">{shipments.ltl || 0} shipments</span>
                            </div>
                            <div className="w-full bg-border/40 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-purple-500 h-full rounded-full transition-all"
                                    style={{
                                        width: `${shipments.total > 0 ? ((shipments.ltl || 0) / shipments.total) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Local Delivery</span>
                                <span className="font-semibold">{shipments.localDelivery || 0} shipments</span>
                            </div>
                            <div className="w-full bg-border/40 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-full rounded-full transition-all"
                                    style={{
                                        width: `${shipments.total > 0 ? ((shipments.localDelivery || 0) / shipments.total) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping Financial Metrics */}
                <div className="p-5 bg-surface border border-border rounded-md space-y-4">
                    <h4 className="font-semibold text-foreground">Logistics Operations Costs & Revenue</h4>
                    <div className="space-y-4 text-sm">
                        <div className="p-4 bg-surface border border-border rounded-md flex justify-between items-center">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Company Freight Cost</p>
                                <p className="text-xl font-bold text-foreground mt-0.5">
                                    {(shipments.totalCost || 0).toLocaleString()} SAR
                                </p>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded bg-red-500/10 text-red-500 font-medium">Costs</span>
                        </div>

                        <div className="p-4 bg-surface border border-border rounded-md flex justify-between items-center">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Freight Revenue Collected from Customers</p>
                                <p className="text-xl font-bold text-foreground mt-0.5">
                                    {(shipments.totalPrice || 0).toLocaleString()} SAR
                                </p>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 font-medium">Revenue</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
