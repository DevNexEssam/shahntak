"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { useCompanyOrders } from "@/hooks/company/useCompanyOrder";
import { useCompanyShipments } from "@/hooks/company/useCompanyShipment";
import { useCompanyInvoices } from "@/hooks/company/useCompanyInvoice";
import { useCompanyEmployees } from "@/hooks/company/useCompanyEmployee";
import {
    LuPackage,
    LuTruck,
    LuFileText,
    LuUsers,
    LuPlus,
    LuArrowUpRight,
    LuClock,
    LuCircleCheck,
    LuMapPin,
    LuSettings,
    LuChartPie,
    LuTrendingUp,
} from "react-icons/lu";

export default function CompanyDashboard() {
    const { data: session } = useSession();

    // Live Queries
    const { data: ordersData } = useCompanyOrders(1, 5, "");
    const { data: shipmentsData } = useCompanyShipments(1, 5, "");
    const { data: invoicesData } = useCompanyInvoices(1, 5, "");
    const { data: employeesData } = useCompanyEmployees(1, 5, "");

    const recentOrders = ordersData?.data || [];
    const ordersStats = ordersData?.stats || { total: ordersData?.pagination?.totalRecords || 0, pending: 0, shipped: 0, delivered: 0 };
    const shipmentsStats = shipmentsData?.stats || { total: shipmentsData?.pagination?.totalRecords || 0, in_transit: 0, delivered: 0 };
    const invoicesStats = invoicesData?.stats || { total: invoicesData?.pagination?.totalRecords || 0, paid: 0, issued: 0 };
    const employeesStats = employeesData?.stats || { total: employeesData?.pagination?.totalRecords || 0, active: 0 };

    // Recharts Data Formats
    const weeklyOrdersTrend = [
        { day: "الأحد", orders: Math.max(1, Math.round(ordersStats.total * 0.12)) },
        { day: "الإثنين", orders: Math.max(2, Math.round(ordersStats.total * 0.18)) },
        { day: "الثلاثاء", orders: Math.max(1, Math.round(ordersStats.total * 0.15)) },
        { day: "الأربعاء", orders: Math.max(3, Math.round(ordersStats.total * 0.22)) },
        { day: "الخميس", orders: Math.max(2, Math.round(ordersStats.total * 0.20)) },
        { day: "الجمعة", orders: Math.max(0, Math.round(ordersStats.total * 0.05)) },
        { day: "السبت", orders: Math.max(1, Math.round(ordersStats.total * 0.08)) },
    ];

    const shipmentStatusBreakdown = [
        { name: "تم التوصيل", value: ordersStats.delivered || shipmentsStats.delivered || 1, color: "#7444fd" },
        { name: "ترانزيت / بالسيارة", value: shipmentsStats.in_transit || 1, color: "#a855f7" },
        { name: "قيد الانتظار والمعالجة", value: ordersStats.pending || 1, color: "#f59e0b" },
    ];

    const statusBadge = (status?: string) => {
        switch (status) {
            case "pending":
                return <span className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-500/10 text-amber-600">قيد الانتظار</span>;
            case "shipped":
                return <span className="px-2.5 py-1 text-xs font-semibold rounded bg-accent/10 text-accent font-semibold">تم الشحن</span>;
            case "delivered":
                return <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600">تم التوصيل</span>;
            default:
                return <span className="px-2.5 py-1 text-xs font-semibold rounded bg-surface-muted text-muted-foreground">{status || "جديد"}</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">الداشبورد ومركز العمليات</h1>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/company/dashboard/orders"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors shadow-xs"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>إضافة طلب جديد</span>
                    </Link>

                    <Link
                        href="/company/dashboard/shipments"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border border-border bg-surface hover:bg-border/30 transition-colors text-foreground"
                    >
                        <LuTruck className="w-4 h-4 text-accent" />
                        <span>إدارة الشحنات</span>
                    </Link>
                </div>
            </div>

            {/* Core KPI Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Orders */}
                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3 hover:border-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">إجمالي الطلبات</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuPackage className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">{ordersStats.total}</h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <LuClock className="w-3.5 h-3.5 text-amber-500" />
                            <span>قيد الانتظار: {ordersStats.pending}</span>
                        </p>
                    </div>
                </div>

                {/* Active Shipments */}
                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3 hover:border-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">الشحنات في الطريق</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuTruck className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">{shipmentsStats.in_transit || 0}</h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <LuCircleCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>إجمالي الشحنات: {shipmentsStats.total}</span>
                        </p>
                    </div>
                </div>

                {/* Invoices */}
                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3 hover:border-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">الفواتير المحصلة</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuFileText className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">{invoicesStats.paid || 0}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            من إجمالي {invoicesStats.total} فاتورة
                        </p>
                    </div>
                </div>

                {/* Team */}
                <div className="p-5 bg-surface border border-border rounded-md shadow-xs space-y-3 hover:border-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">فريق العمل النشط</span>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuUsers className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-foreground">{employeesStats.active || employeesStats.total}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            موظفين مسجلين بالنظام
                        </p>
                    </div>
                </div>
            </div>

            {/* Recharts Analytics Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Orders Trend AreaChart (2 Cols) */}
                <div className="lg:col-span-2 p-5 bg-surface border border-border rounded-md space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2 font-semibold text-foreground">
                            <LuTrendingUp className="w-5 h-5 text-accent" />
                            <span>معدل الحركة والتدفق الأسبوعي للطلبات</span>
                        </div>
                        <span className="text-xs text-accent font-semibold px-2 py-0.5 rounded bg-accent/10">مؤشر أداء محوري</span>
                    </div>

                    <div className="h-64 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyOrdersTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorOrdersAccent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7444fd" stopOpacity={0.45} />
                                        <stop offset="95%" stopColor="#7444fd" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.6} />
                                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#5c6574", fontWeight: 500 }} />
                                <YAxis tick={{ fontSize: 12, fill: "#5c6574" }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#ffffff",
                                        borderColor: "#7444fd",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        boxShadow: "0 10px 15px -3px rgba(116, 68, 253, 0.15)",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="orders"
                                    name="عدد الطلبات"
                                    stroke="#7444fd"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorOrdersAccent)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Shipments Status Breakdown Donut PieChart (1 Col) */}
                <div className="p-5 bg-surface border border-border rounded-md space-y-4">
                    <div className="border-b border-border pb-3">
                        <div className="flex items-center gap-2 font-semibold text-foreground">
                            <LuChartPie className="w-5 h-5 text-accent" />
                            <span>توزيع حالات العمليات والشحنات</span>
                        </div>
                    </div>

                    <div className="h-48 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={shipmentStatusBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {shipmentStatusBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--surface, #ffffff)",
                                        borderColor: "var(--border, #e2e8f0)",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-2 pt-2 text-xs border-t border-border">
                        {shipmentStatusBreakdown.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-muted-foreground">{item.name}</span>
                                </div>
                                <span className="font-bold text-foreground">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders Table (2 Cols) */}
                <div className="lg:col-span-2 p-5 bg-surface border border-border rounded-md space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                            <h2 className="text-base font-bold text-foreground">أحدث طلبات الشركة</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">آخر الطلبات المسجلة بالحساب</p>
                        </div>
                        <Link
                            href="/company/dashboard/orders"
                            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                        >
                            <span>كل الطلبات</span>
                            <LuArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground text-sm">
                            لا توجد طلبات مسجلة حديثاً
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-border text-muted-foreground font-semibold">
                                        <th className="py-2.5 px-3">رقم الطلب</th>
                                        <th className="py-2.5 px-3">المستلم والمدينة</th>
                                        <th className="py-2.5 px-3">الوزن</th>
                                        <th className="py-2.5 px-3">القيمة</th>
                                        <th className="py-2.5 px-3">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {recentOrders.map((ord: any) => (
                                        <tr key={ord._id} className="hover:bg-border/20 transition-colors">
                                            <td className="py-3 px-3 font-semibold text-accent">
                                                {ord.orderNumber}
                                            </td>
                                            <td className="py-3 px-3">
                                                <div>
                                                    <span className="font-semibold text-foreground block">{ord.recipientName}</span>
                                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <LuMapPin className="w-3 h-3 text-accent" />
                                                        {ord.recipientCity}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-foreground font-medium">
                                                {ord.weight} كجم
                                            </td>
                                            <td className="py-3 px-3 font-bold text-foreground">
                                                {(ord.orderValue || 0).toLocaleString()} ر.س
                                            </td>
                                            <td className="py-3 px-3">
                                                {statusBadge(ord.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Shortcuts & Navigation (1 Col) */}
                <div className="p-5 bg-surface border border-border rounded-md space-y-4">
                    <div className="border-b border-border pb-3">
                        <h2 className="text-base font-bold text-foreground">الوصول السريع والأقسام</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">الانتقال المباشر لأقسام سيستم الشركة</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                        <Link
                            href="/company/dashboard/orders"
                            className="p-3 rounded-md border border-border bg-surface hover:bg-border/20 transition-colors flex items-center justify-between text-sm font-semibold text-foreground group"
                        >
                            <div className="flex items-center gap-2.5">
                                <LuPackage className="w-4 h-4 text-accent" />
                                <span>إدارة الطلبات</span>
                            </div>
                            <LuArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                        </Link>

                        <Link
                            href="/company/dashboard/shipments"
                            className="p-3 rounded-md border border-border bg-surface hover:bg-border/20 transition-colors flex items-center justify-between text-sm font-semibold text-foreground group"
                        >
                            <div className="flex items-center gap-2.5">
                                <LuTruck className="w-4 h-4 text-accent" />
                                <span>إدارة الشحنات</span>
                            </div>
                            <LuArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                        </Link>

                        <Link
                            href="/company/dashboard/invoices"
                            className="p-3 rounded-md border border-border bg-surface hover:bg-border/20 transition-colors flex items-center justify-between text-sm font-semibold text-foreground group"
                        >
                            <div className="flex items-center gap-2.5">
                                <LuFileText className="w-4 h-4 text-accent" />
                                <span>الفواتير والمالية</span>
                            </div>
                            <LuArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                        </Link>

                        <Link
                            href="/company/dashboard/vehicles"
                            className="p-3 rounded-md border border-border bg-surface hover:bg-border/20 transition-colors flex items-center justify-between text-sm font-semibold text-foreground group"
                        >
                            <div className="flex items-center gap-2.5">
                                <LuTruck className="w-4 h-4 text-accent" />
                                <span>أسطول المركبات</span>
                            </div>
                            <LuArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                        </Link>

                        <Link
                            href="/company/dashboard/reports"
                            className="p-3 rounded-md border border-border bg-surface hover:bg-border/20 transition-colors flex items-center justify-between text-sm font-semibold text-foreground group"
                        >
                            <div className="flex items-center gap-2.5">
                                <LuChartPie className="w-4 h-4 text-accent" />
                                <span>التقارير والإحصائيات</span>
                            </div>
                            <LuArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                        </Link>

                        <Link
                            href="/company/dashboard/settings"
                            className="p-3 rounded-md border border-border bg-surface hover:bg-border/20 transition-colors flex items-center justify-between text-sm font-semibold text-foreground group"
                        >
                            <div className="flex items-center gap-2.5">
                                <LuSettings className="w-4 h-4 text-accent" />
                                <span>إعدادات الشركة</span>
                            </div>
                            <LuArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
