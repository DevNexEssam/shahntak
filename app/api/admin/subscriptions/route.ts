/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Subscription from "@/models/subscription";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "company", "read")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const nopagination = searchParams.get("nopagination") === "true";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "all";
        const companyId = searchParams.get("companyId") || "";

        await connectDB();

        const query: any = { ...ACTIVE };

        if (status && status !== "all") {
            query.status = status;
        }

        if (companyId) {
            query.companyId = companyId;
        }

        if (nopagination) {
            const subscriptions = await Subscription.find(query)
                .populate("companyId", "companyName email phone city")
                .populate("planId", "name price billingCycle maxOrdersPerMonth maxShipmentsPerMonth")
                .sort({ createdAt: -1 })
                .lean();

            return NextResponse.json({
                success: true,
                data: subscriptions,
                total: subscriptions.length,
                count: subscriptions.length,
            });
        }

        const skip = (page - 1) * limit;

        const [subscriptions, total, activeCount, expiredCount, pendingCount, cancelledCount] = await Promise.all([
            Subscription.find(query)
                .populate("companyId", "companyName email phone city")
                .populate("planId", "name price billingCycle maxOrdersPerMonth maxShipmentsPerMonth")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Subscription.countDocuments(query),
            Subscription.countDocuments({ ...ACTIVE, status: "active" }),
            Subscription.countDocuments({ ...ACTIVE, status: "expired" }),
            Subscription.countDocuments({ ...ACTIVE, status: "pending_payment" }),
            Subscription.countDocuments({ ...ACTIVE, status: "cancelled" }),
        ]);

        return NextResponse.json({
            success: true,
            data: subscriptions,
            total,
            count: subscriptions.length,
            stats: {
                active: activeCount,
                expired: expiredCount,
                pending_payment: pendingCount,
                cancelled: cancelledCount,
                total,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}
