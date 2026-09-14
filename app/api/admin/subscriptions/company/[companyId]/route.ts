/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Company from "@/models/companies";
import Subscription from "@/models/subscription";

// GET - Get active subscription and plan quota details for a specific company by companyId
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        const role = (session?.user as any)?.role;

        if (!role || (role !== "admin" && role !== "super")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const { pathname } = new URL(req.url);
        const companyId = pathname.split("/").pop();

        if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
            return NextResponse.json(
                { success: false, message: "Invalid company ID" },
                { status: 400 }
            );
        }

        const company = await Company.findOne({
            _id: companyId,
            deletedAt: null,
        }).select("-password").lean();

        if (!company) {
            return NextResponse.json(
                { success: false, message: "Requested company not found" },
                { status: 404 }
            );
        }

        const subscription: any = await Subscription.findOne({
            companyId: new mongoose.Types.ObjectId(companyId),
            status: "active",
            deletedAt: null,
        })
            .populate("planId")
            .lean();

        if (!subscription || !subscription.planId) {
            return NextResponse.json(
                {
                    success: true,
                    data: {
                        company,
                        hasActiveSubscription: false,
                        planName: "No active subscription",
                        statusStr: "Not subscribed",
                        ordersCount: { used: 0, max: 0, remaining: 0, pct: 0 },
                        shipmentsCount: { used: 0, max: 0, remaining: 0, pct: 0 },
                        features: {},
                    },
                },
                { status: 200 }
            );
        }

        const plan: any = subscription.planId;
        const maxOrders = Number(plan.maxOrdersPerMonth || 0);
        const usedOrders = Number(subscription.ordersUsedThisMonth || 0);
        const remainingOrders = Math.max(0, maxOrders - usedOrders);
        const ordersPct = maxOrders > 0 ? Math.min(100, Math.round((usedOrders / maxOrders) * 100)) : 0;

        const maxShipments = Number(plan.maxShipmentsPerMonth || 0);
        const usedShipments = Number(subscription.shipmentsUsedThisMonth || 0);
        const remainingShipments = Math.max(0, maxShipments - usedShipments);
        const shipmentsPct = maxShipments > 0 ? Math.min(100, Math.round((usedShipments / maxShipments) * 100)) : 0;

        const isNearLimit = ordersPct >= 90 || shipmentsPct >= 90;
        const statusStr = subscription.status === "active" ? (isNearLimit ? "Capacity Warning" : "Active") : "Expired";

        return NextResponse.json(
            {
                success: true,
                data: {
                    company,
                    subscriptionId: subscription._id,
                    hasActiveSubscription: true,
                    planName: plan.name,
                    billingCycle: plan.billingCycle,
                    statusStr,
                    startDate: subscription.startDate,
                    endDate: subscription.endDate,
                    ordersCount: {
                        used: usedOrders,
                        max: maxOrders,
                        remaining: remainingOrders,
                        pct: ordersPct,
                    },
                    shipmentsCount: {
                        used: usedShipments,
                        max: maxShipments,
                        remaining: remainingShipments,
                        pct: shipmentsPct,
                    },
                    features: {
                        hasWaybillPdfExport: plan.hasWaybillPdfExport ?? true,
                        hasBulkExcelImport: plan.hasBulkExcelImport ?? true,
                        hasZatcaInvoicing: plan.hasZatcaInvoicing ?? true,
                        hasExpensesTracking: plan.hasExpensesTracking ?? true,
                        hasCustomRoutes: plan.hasCustomRoutes ?? true,
                        hasAdvancedAnalytics: plan.hasAdvancedAnalytics ?? true,
                    },
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred while fetching company subscription", error: error.message },
            { status: 500 }
        );
    }
}
