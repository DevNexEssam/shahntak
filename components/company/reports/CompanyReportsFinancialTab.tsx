"use client";

import React from "react";
import {
    LuFileText,
    LuCircleCheck,
    LuTriangleAlert,
    LuClock,
    LuDollarSign,
    LuActivity,
} from "react-icons/lu";

interface FinancialTabProps {
    data: any;
    isLoading: boolean;
}

export const CompanyReportsFinancialTab: React.FC<FinancialTabProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <LuActivity className="w-8 h-8 animate-spin text-accent" />
                <span className="ml-3 font-medium">Loading financial reports...</span>
            </div>
        );
    }

    const invoices = data?.invoices || {};

    return (
        <div className="space-y-6">
            {/* Invoices Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Total Invoices</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuFileText className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">{invoices.total || 0}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Issued invoices in system</p>
                    </div>
                </div>

                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Collected & Paid Invoices</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuCircleCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">{invoices.paid || 0}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Fully collected amounts</p>
                    </div>
                </div>

                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Pending Issued Invoices</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuClock className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">{invoices.issued || 0}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting payment and settlement</p>
                    </div>
                </div>

                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Overdue Invoices</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuTriangleAlert className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">{invoices.overdue || 0}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Exceeded specified due date</p>
                    </div>
                </div>
            </div>

            {/* Invoiced Total & Collection Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 bg-surface border border-border rounded-md space-y-4">
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                        <LuDollarSign className="w-5 h-5 text-accent" />
                        <span>Invoiced Amounts Analytics</span>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-surface border border-border rounded-md flex justify-between items-center">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Tax Invoiced Amount</p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    {(invoices.totalInvoiced || 0).toLocaleString()} SAR
                                </p>
                            </div>
                            <span className="text-xs px-3 py-1 rounded bg-accent/10 text-accent font-semibold">Amounts</span>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Actual Invoice Collection Rate</span>
                                <span className="font-bold text-accent">{invoices.collectionRate || 0}%</span>
                            </div>
                            <div className="w-full bg-border/40 h-3 rounded-full overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-full rounded-full transition-all"
                                    style={{ width: `${invoices.collectionRate || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cash on Delivery (COD) Card */}
                <div className="p-5 bg-surface border border-border rounded-md space-y-4">
                    <h4 className="font-semibold text-foreground">Cash on Delivery (COD) Collection</h4>
                    <div className="p-4 bg-surface border border-border rounded-md flex justify-between items-center">
                        <div>
                            <p className="text-xs text-muted-foreground">Total COD Amounts Due from Drivers</p>
                            <p className="text-2xl font-bold text-amber-500 mt-1">
                                {(invoices.totalCod || 0).toLocaleString()} SAR
                            </p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded bg-amber-500/10 text-amber-500 font-medium">COD</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Total cash collected or to be collected by drivers during shipment and order deliveries.
                    </p>
                </div>
            </div>
        </div>
    );
};
