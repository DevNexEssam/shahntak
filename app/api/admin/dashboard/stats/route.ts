/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Company from "@/models/companies";
import Shipment from "@/models/shipment";
import Invoice from "@/models/invoice";
import Vehicle from "@/models/vehicle";
import Notification from "@/models/notification";
import Subscription from "@/models/subscription";
import { ACTIVE } from "@/utils/constants";

// get admin dashboard stats (100% real data, no fake fallbacks)
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        const role = (session?.user as any)?.role;

        if (!role || (role !== "admin" && role !== "super")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const section = searchParams.get("section") || "kpis";

        if (section === "kpis") {
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

            const [
                totalCompanies,
                prevMonthCompanies,
                todayShipments,
                yesterdayShipments,
                monthlyInvoices,
                prevMonthlyInvoices,
                activeDrivers
            ] = await Promise.all([
                Company.countDocuments({ ...ACTIVE, status: "active" }),
                Company.countDocuments({ ...ACTIVE, status: "active", createdAt: { $lt: startOfMonth, $gte: startOfPrevMonth } }),
                Shipment.countDocuments({ ...ACTIVE, createdAt: { $gte: startOfToday } }),
                Shipment.countDocuments({ ...ACTIVE, createdAt: { $gte: startOfYesterday, $lt: startOfToday } }),
                Invoice.aggregate([
                    { $match: { ...ACTIVE, createdAt: { $gte: startOfMonth }, status: { $ne: "cancelled" } } },
                    { $group: { _id: null, total: { $sum: "$total" } } }
                ]),
                Invoice.aggregate([
                    { $match: { ...ACTIVE, createdAt: { $gte: startOfPrevMonth, $lt: startOfMonth }, status: { $ne: "cancelled" } } },
                    { $group: { _id: null, total: { $sum: "$total" } } }
                ]),
                Vehicle.countDocuments({ ...ACTIVE, isActive: true }),
            ]);

            const currentRev = monthlyInvoices[0]?.total || 0;
            const prevRev = prevMonthlyInvoices[0]?.total || 0;

            const calcPct = (curr: number, prev: number) => {
                if (!prev || prev === 0) return curr > 0 ? 100 : 0;
                return Math.round(((curr - prev) / prev) * 100);
            };

            return NextResponse.json({
                success: true,
                data: {
                    totalCompanies,
                    companiesGrowthPct: calcPct(totalCompanies, prevMonthCompanies),
                    todayShipments,
                    shipmentsGrowthPct: calcPct(todayShipments, yesterdayShipments),
                    monthlyRevenue: currentRev,
                    revenueGrowthPct: calcPct(currentRev, prevRev),
                    activeDrivers,
                }
            }, { status: 200 });
        }

        if (section === "top-companies") {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            // Fetch top 5 active companies from DB
            const activeCompanies = await Company.find({ ...ACTIVE, status: "active" })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            if (activeCompanies.length === 0) {
                return NextResponse.json({ success: true, data: [] }, { status: 200 });
            }

            const companyIds = activeCompanies.map((c) => c._id);

            // Query today's shipments count for each company
            // and active subscriptions mapped with real Plan limits
            const [todayShipmentsAgg, activeSubscriptions] = await Promise.all([
                Shipment.aggregate([
                    { $match: { ...ACTIVE, companyId: { $in: companyIds }, createdAt: { $gte: startOfToday } } },
                    { $group: { _id: "$companyId", count: { $sum: 1 } } }
                ]),
                Subscription.find({ companyId: { $in: companyIds }, status: "active" })
                    .populate("planId", "name maxShipmentsPerMonth maxOrdersPerMonth")
                    .lean(),
            ]);

            const shipmentsMap = new Map(todayShipmentsAgg.map((item) => [item._id.toString(), item.count]));
            const subMap = new Map(activeSubscriptions.map((s: any) => [s.companyId.toString(), s]));

            // Build real response for each company without any fake fallbacks
            const topCompaniesData = activeCompanies.map((comp: any) => {
                const compIdStr = comp._id.toString();
                const todayCount = shipmentsMap.get(compIdStr) || 0;
                const sub: any = subMap.get(compIdStr);

                const planName = sub?.planId?.name ? sub.planId.name : "No active subscription";
                const maxAllowed = sub?.planId?.maxShipmentsPerMonth || 0;
                const used = sub?.shipmentsUsedThisMonth || 0;

                // Calculation: (used / maxAllowed) * 100
                const usagePct = maxAllowed > 0 ? Math.min(100, Math.round((used / maxAllowed) * 100)) : 0;
                const statusStr = comp.status === "active" ? (usagePct >= 90 ? "Usage Warning" : "Active") : "Inactive";

                return {
                    _id: compIdStr,
                    companyName: comp.companyName,
                    planName,
                    todayShipments: todayCount,
                    usagePct,
                    status: statusStr,
                };
            });

            // Sort by today's shipments descending
            topCompaniesData.sort((a, b) => b.todayShipments - a.todayShipments);

            return NextResponse.json({ success: true, data: topCompaniesData.slice(0, 5) }, { status: 200 });
        }

        if (section === "alerts") {
            const realAlerts: any[] = [];

            // Query pending company registrations (awaiting approval)
            const pendingCompanies = await Company.find({ status: "inactive", deletedAt: null })
                .limit(3)
                .select("companyName createdAt")
                .lean();

            pendingCompanies.forEach((comp: any) => {
                realAlerts.push({
                    id: `pending-${comp._id}`,
                    title: "New Company Registration Request",
                    description: `Company "${comp.companyName}" is pending commercial record review and activation.`,
                    type: "warning",
                    createdAt: comp.createdAt,
                });
            });

            // Query subscriptions near limit (>= 90% usage)
            const nearLimitSubs = await Subscription.find({ status: "active", deletedAt: null })
                .populate("companyId", "companyName")
                .populate("planId", "name maxShipmentsPerMonth")
                .lean();

            nearLimitSubs.forEach((sub: any) => {
                const max = sub?.planId?.maxShipmentsPerMonth || 0;
                const used = sub?.shipmentsUsedThisMonth || 0;
                const pct = max > 0 ? Math.round((used / max) * 100) : 0;

                if (pct >= 90 && sub.companyId) {
                    realAlerts.push({
                        id: `limit-${sub._id}`,
                        title: "Plan Usage Warning",
                        description: `Company "${sub.companyId.companyName}" reached ${pct}% capacity of plan "${sub.planId?.name || "Current"}".`,
                        type: "error",
                        createdAt: sub.updatedAt,
                    });
                }
            });

            // Query unread system notifications
            const unreadNotifications = await Notification.find({ isRead: false, ...ACTIVE })
                .sort({ createdAt: -1 })
                .limit(3)
                .lean();

            unreadNotifications.forEach((notif: any) => {
                realAlerts.push({
                    id: notif._id.toString(),
                    title: notif.title || "System Alert",
                    description: notif.body || "",
                    type: notif.event === "error" ? "error" : "info",
                    createdAt: notif.createdAt,
                });
            });

            return NextResponse.json({ success: true, data: realAlerts }, { status: 200 });
        }

        return NextResponse.json({ success: false, message: "Unknown section" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred while fetching statistics", error: error.message }, { status: 500 });
    }
}
