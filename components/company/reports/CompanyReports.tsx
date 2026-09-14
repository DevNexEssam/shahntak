"use client";

import React, { useState } from "react";
import {
    LuChartPie,
    LuPackage,
    LuDollarSign,
    LuTruck,
    LuRefreshCw,
    LuTrendingUp,
} from "react-icons/lu";
import { useCompanyReports } from "@/hooks/company/useCompanyReport";
import { CompanyReportsOverviewTab } from "./CompanyReportsOverviewTab";
import { CompanyReportsOperationsTab } from "./CompanyReportsOperationsTab";
import { CompanyReportsFinancialTab } from "./CompanyReportsFinancialTab";
import { CompanyReportsFleetTab } from "./CompanyReportsFleetTab";
import CompanyAnalyticsDashboard from "../analytics/CompanyAnalyticsDashboard";

export const CompanyReports: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"analytics" | "overview" | "operations" | "financial" | "fleet">("analytics");

    const { data: responseData, isLoading, refetch, isFetching } = useCompanyReports(activeTab === "analytics" ? "overview" : activeTab);

    const reportData = responseData?.data || {};

    const tabs = [
        { id: "analytics", label: "Comprehensive Analytics", icon: LuTrendingUp },
        { id: "overview", label: "Statistical Overview", icon: LuChartPie },
        { id: "operations", label: "Operations & Orders Reports", icon: LuPackage },
        { id: "financial", label: "Financial & Invoicing Reports", icon: LuDollarSign },
        { id: "fleet", label: "Fleet & Employees Reports", icon: LuTruck },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Reports & Analytical Statistics</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Advanced analytics dashboard to track company fleet performance, shipments, and invoiced amounts.
                    </p>
                </div>

                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-border bg-surface hover:bg-border/30 transition-colors disabled:opacity-50 text-foreground cursor-pointer"
                >
                    <LuRefreshCw className={`w-4 h-4 text-accent ${isFetching ? "animate-spin" : ""}`} />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Tab Bar Navigation */}
            <div className="border-b border-border">
                <div className="flex gap-2 overflow-x-auto pb-px">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                                    isActive
                                        ? "border-accent text-accent bg-accent-soft/30 rounded-t-md"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content Display */}
            <div className="pt-2">
                {activeTab === "analytics" && (
                    <CompanyAnalyticsDashboard />
                )}
                {activeTab === "overview" && (
                    <CompanyReportsOverviewTab data={reportData} isLoading={isLoading} />
                )}
                {activeTab === "operations" && (
                    <CompanyReportsOperationsTab data={reportData} isLoading={isLoading} />
                )}
                {activeTab === "financial" && (
                    <CompanyReportsFinancialTab data={reportData} isLoading={isLoading} />
                )}
                {activeTab === "fleet" && (
                    <CompanyReportsFleetTab data={reportData} isLoading={isLoading} />
                )}
            </div>
        </div>
    );
};
