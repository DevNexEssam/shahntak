"use client";

import React from "react";
import {
    LuPackage,
    LuTruck,
    LuFileText,
    LuCircleCheck,
    LuDollarSign,
    LuUsers,
    LuShieldCheck,
    LuActivity,
} from "react-icons/lu";

interface OverviewTabProps {
    data: any;
    isLoading: boolean;
}

export const CompanyReportsOverviewTab: React.FC<OverviewTabProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <LuActivity className="w-8 h-8 animate-spin text-accent" />
                <span className="mr-3 font-medium">جاري تحميل إحصائيات التقارير...</span>
            </div>
        );
    }

    const orders = data?.orders || {};
    const shipments = data?.shipments || {};
    const invoices = data?.invoices || {};
    const vehicles = data?.vehicles || {};
    const employees = data?.employees || {};

    const netProfit = (shipments.totalPrice || 0) - (shipments.totalCost || 0);

    return (
        <div className="space-y-6">
            {/* Upper KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue Card */}
                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">إجمالي الإيرادات</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuDollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">
                            {(shipments.totalPrice || 0).toLocaleString()} <span className="text-xs text-muted-foreground">ر.س</span>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">مجموع إيرادات الشحنات اللوجستية</p>
                    </div>
                </div>

                {/* Net Profit Card */}
                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">صافي الربح التشغيلي</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuShieldCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">
                            {netProfit.toLocaleString()} <span className="text-xs text-muted-foreground">ر.س</span>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">الفارق بين سعر العميل وتكلفة الشحن</p>
                    </div>
                </div>

                {/* Delivery Success Rate */}
                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">نسبة تسليم الطلبات</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuCircleCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">
                            {orders.successRate || 0}%
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {orders.delivered || 0} طلب مسلم من أصل {orders.total || 0}
                        </p>
                    </div>
                </div>

                {/* Invoiced Amount */}
                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">المبالغ المفوترة المحصلة</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuFileText className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">
                            {(invoices.totalInvoiced || 0).toLocaleString()} <span className="text-xs text-muted-foreground">ر.س</span>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            نسبة تحصيل الفواتير {invoices.collectionRate || 0}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Visual Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Operations Overview */}
                <div className="p-5 bg-surface border border-border rounded-md space-y-4">
                    <div className="flex items-center gap-2 space-x-reverse text-foreground font-semibold">
                        <LuPackage className="w-5 h-5 text-accent" />
                        <span>حركة الطلبات والعمليات</span>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">إجمالي الطلبات الصادرة</span>
                            <span className="font-semibold">{orders.total || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">الطلبات قيد الانتظار والمعالجة</span>
                            <span className="font-semibold text-amber-500">{(orders.pending || 0) + (orders.shipped || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">الطلبات المسلمة بنجاح</span>
                            <span className="font-semibold text-emerald-500">{orders.delivered || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">إجمالي قيمة البضائع</span>
                            <span className="font-semibold">{(orders.totalValue || 0).toLocaleString()} ر.س</span>
                        </div>
                    </div>
                </div>

                {/* Fleet Readiness */}
                <div className="p-5 bg-surface border border-border rounded-md space-y-4">
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                        <LuTruck className="w-5 h-5 text-accent" />
                        <span>جاهزية الأسطول والتشغيل</span>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">إجمالي شاحنات وماركات الأسطول</span>
                            <span className="font-semibold">{vehicles.total || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">المركبات النشطة بالخدمة</span>
                            <span className="font-semibold text-emerald-500">{vehicles.active || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">نسبة جاهزية الأسطول</span>
                            <span className="font-semibold text-accent">{vehicles.utilizationRate || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">الشحنات النشطة بالطريق</span>
                            <span className="font-semibold text-blue-500">{shipments.inTransit || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Team & Finance Summary */}
                <div className="p-5 bg-surface border border-border rounded-md space-y-4">
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                        <LuUsers className="w-5 h-5 text-accent" />
                        <span>فريق العمل والتحصيل المالي</span>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">إجمالي الموظفين المسجلين</span>
                            <span className="font-semibold">{employees.total || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">الموظفون النشطون</span>
                            <span className="font-semibold text-emerald-500">{employees.active || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">مبالغ التحصيل عند التسليم (COD)</span>
                            <span className="font-semibold text-amber-500">{(orders.totalCod || 0).toLocaleString()} ر.س</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">الفواتير المتأخرة المستحقة</span>
                            <span className="font-semibold text-red-500">{invoices.overdue || 0} فاتورة</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
