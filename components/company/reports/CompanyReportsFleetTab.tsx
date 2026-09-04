"use client";

import React from "react";
import {
    LuTruck,
    LuUsers,
    LuCircleCheck,
    LuCircleX,
    LuActivity,
} from "react-icons/lu";

interface FleetTabProps {
    data: any;
    isLoading: boolean;
}

export const CompanyReportsFleetTab: React.FC<FleetTabProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <LuActivity className="w-8 h-8 animate-spin text-accent" />
                <span className="mr-3 font-medium">جاري تحميل تقارير الأسطول والموظفين...</span>
            </div>
        );
    }

    const vehicles = data?.vehicles || {};
    const employees = data?.employees || {};

    return (
        <div className="space-y-6">
            {/* Vehicles Fleet Overview */}
            <div className="p-5 bg-surface border border-border rounded-md space-y-4">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                    <LuTruck className="w-5 h-5 text-accent" />
                    <span>أداء وجاهزية أسطول المركبات الشاحنة</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-surface border border-border rounded-md shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">إجمالي مركبات الشركة</span>
                            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                                <LuTruck className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">{vehicles.total || 0}</h3>
                    </div>

                    <div className="p-4 bg-surface border border-border rounded-md shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">المركبات النشطة بالخدمة</span>
                            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                                <LuCircleCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">{vehicles.active || 0}</h3>
                    </div>

                    <div className="p-4 bg-surface border border-border rounded-md shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">المركبات المتوقفة / صيانة</span>
                            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                                <LuCircleX className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">{vehicles.inactive || 0}</h3>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">نسبة جاهزية تشغيل الأسطول (Utilization Rate)</span>
                        <span className="font-bold text-accent">{vehicles.utilizationRate || 0}%</span>
                    </div>
                    <div className="w-full bg-border/40 h-3 rounded-full overflow-hidden">
                        <div
                            className="bg-accent h-full rounded-full transition-all"
                            style={{ width: `${vehicles.utilizationRate || 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Employees Overview */}
            <div className="p-5 bg-surface border border-border rounded-md space-y-4">
                <div className="flex items-center space-x-2 space-x-reverse text-foreground font-semibold">
                    <LuUsers className="w-5 h-5 text-accent" />
                    <span>فريق العمل والنشاط</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-surface border border-border rounded-md shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">إجمالي فريق العمل والمدراء</span>
                            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                                <LuUsers className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">{employees.total || 0}</h3>
                    </div>

                    <div className="p-4 bg-surface border border-border rounded-md shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">الحسابات النشطة</span>
                            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                                <LuCircleCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">{employees.active || 0}</h3>
                    </div>

                    <div className="p-4 bg-surface border border-border rounded-md shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">الحسابات المعطلة / المجمدة</span>
                            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                                <LuCircleX className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">{employees.inactive || 0}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};
