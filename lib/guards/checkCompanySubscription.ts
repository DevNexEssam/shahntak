/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Subscription from "@/models/subscription";
import "@/models/plan";

export interface SubscriptionCheckResult {
    isAllowed: boolean;
    isExpired?: boolean;
    daysRemaining?: number;
    subscription?: any;
    response?: NextResponse;
}

export interface SubscriptionCheckOptions {
    checkQuotaFor?: 'order' | 'shipment';
    count?: number;
}

/**
 * Centralized SaaS Subscription Guard for Company Accounts.
 * Checks active/expired status and limits/quotas for write operations.
 */
export async function checkCompanySubscription(
    companyId: string | mongoose.Types.ObjectId,
    options?: SubscriptionCheckOptions
): Promise<SubscriptionCheckResult> {
    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId.toString())) {
        return {
            isAllowed: false,
            response: NextResponse.json(
                { success: false, message: "معرف الشركة غير صالح أو غير موجود" },
                { status: 400 }
            ),
        };
    }

    try {
        await connectDB();

        const subscription = await Subscription.findOne({
            companyId: new mongoose.Types.ObjectId(companyId.toString()),
            deletedAt: null,
        })
            .populate("planId")
            .sort({ createdAt: -1 });

        if (!subscription) {
            return {
                isAllowed: false,
                isExpired: true,
                daysRemaining: 0,
                response: NextResponse.json(
                    {
                        success: false,
                        message: "لا يوجد اشتراك مفعّل لهذه المنشأة. يرجى التواصل مع إدارة المنصة لتفعيل الاشتراك.",
                        isExpired: true,
                    },
                    { status: 403 }
                ),
            };
        }

        const now = new Date();
        const endDate = new Date(subscription.endDate);
        const isPastEnd = endDate < now;

        // Auto-update status to 'expired' if endDate passed
        if (isPastEnd && subscription.status !== "expired" && subscription.status !== "cancelled") {
            subscription.status = "expired";
            await subscription.save();
        }

        if (subscription.status === "expired" || isPastEnd || subscription.status === "cancelled") {
            return {
                isAllowed: false,
                isExpired: true,
                daysRemaining: 0,
                subscription,
                response: NextResponse.json(
                    {
                        success: false,
                        message: "انتهت صلاحية اشتراك حساب المنشأة. تم توقيف عمليات الإضافة والتعديل والحذف حتى تجديد الاشتراك.",
                        isExpired: true,
                    },
                    { status: 403 }
                ),
            };
        }

        // Quota Limit Checks (Orders & Shipments)
        const plan = subscription.planId as any;
        const requestedCount = options?.count || 1;

        if (options?.checkQuotaFor === 'order' && plan?.maxOrdersPerMonth) {
            const maxOrders = Number(plan.maxOrdersPerMonth);
            const usedOrders = Number(subscription.ordersUsedThisMonth || 0);
            if (usedOrders + requestedCount > maxOrders) {
                return {
                    isAllowed: false,
                    subscription,
                    response: NextResponse.json(
                        {
                            success: false,
                            message: `تجاوزت حصة الباقة الشهرية للطلبات (${maxOrders} طلب). المستهلك حتى الآن: ${usedOrders} طلب. يرجى ترقية الباقة لزيادة الحصة.`,
                            isQuotaExceeded: true,
                        },
                        { status: 403 }
                    ),
                };
            }
        }

        if (options?.checkQuotaFor === 'shipment' && plan?.maxShipmentsPerMonth) {
            const maxShipments = Number(plan.maxShipmentsPerMonth);
            const usedShipments = Number(subscription.shipmentsUsedThisMonth || 0);
            if (usedShipments + requestedCount > maxShipments) {
                return {
                    isAllowed: false,
                    subscription,
                    response: NextResponse.json(
                        {
                            success: false,
                            message: `تجاوزت حصة الباقة الشهرية للشحنات (${maxShipments} شحنة). المستهلك حتى الآن: ${usedShipments} شحنة. يرجى ترقية الباقة لزيادة الحصة.`,
                            isQuotaExceeded: true,
                        },
                        { status: 403 }
                    ),
                };
            }
        }

        const diffTime = endDate.getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        return {
            isAllowed: true,
            isExpired: false,
            daysRemaining,
            subscription,
        };
    } catch (error: any) {
        console.error("Subscription Guard Check Error:", error);
        return { isAllowed: true };
    }
}
