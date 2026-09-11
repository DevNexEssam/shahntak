"use client";

import React from 'react';

export function AdminKPIsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-md bg-surface-muted"></div>
                        <div className="h-5 bg-surface-muted rounded-full w-14"></div>
                    </div>
                    <div className="h-3 bg-surface-muted rounded w-28"></div>
                    <div className="h-7 bg-surface-muted rounded w-36"></div>
                </div>
            ))}
        </div>
    );
}

export function AdminTopCompaniesSkeleton() {
    return (
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs animate-pulse space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="space-y-2">
                    <div className="h-4 bg-surface-muted rounded w-40"></div>
                    <div className="h-3 bg-surface-muted rounded w-56"></div>
                </div>
                <div className="h-4 bg-surface-muted rounded w-24"></div>
            </div>
            <div className="space-y-3 pt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="h-4 bg-surface-muted rounded w-36"></div>
                        <div className="h-3 bg-surface-muted rounded w-16"></div>
                        <div className="h-4 bg-surface-muted rounded w-20"></div>
                        <div className="h-2 bg-surface-muted rounded-full w-24"></div>
                        <div className="h-5 bg-surface-muted rounded-full w-14"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AdminAlertsSkeleton() {
    return (
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs animate-pulse space-y-4">
            <div className="h-4 bg-surface-muted rounded w-36 mb-4"></div>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3.5 rounded-md bg-surface-muted/60 space-y-2">
                        <div className="h-3 bg-surface-muted rounded w-28"></div>
                        <div className="h-3 bg-surface-muted rounded w-full"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
