/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';

export default function CompanyAnalyticsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">

            {/* Top 4 KPI Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border border-border rounded-md p-5 bg-surface space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-3 bg-surface-muted rounded w-24"></div>
                            <div className="w-10 h-10 rounded-full bg-surface-muted"></div>
                        </div>
                        <div className="h-7 bg-surface-muted rounded w-32"></div>
                        <div className="h-3 bg-surface-muted rounded w-20"></div>
                    </div>
                ))}
            </div>

            {/* Tab Charts & Analytics Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Large Chart Skeleton */}
                <div className="lg:col-span-2 border border-border rounded-md p-5 bg-surface space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="h-4 bg-surface-muted rounded w-40"></div>
                        <div className="h-3 bg-surface-muted rounded w-20"></div>
                    </div>
                    <div className="h-64 bg-surface-muted/60 rounded-md flex items-center justify-center">
                        <span className="text-xs text-body/50">Loading analytics data...</span>
                    </div>
                </div>

                {/* Side Breakdown Skeleton */}
                <div className="border border-border rounded-md p-5 bg-surface space-y-4">
                    <div className="h-4 bg-surface-muted rounded w-32 border-b border-border pb-3"></div>
                    <div className="space-y-3 pt-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="h-3 bg-surface-muted rounded w-24"></div>
                                <div className="h-3 bg-surface-muted rounded w-12"></div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
