/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { checkCompanySubscription, SubscriptionCheckResult } from "./checkCompanySubscription";
import { IPlan } from "@/models/plan";

export interface FeatureCheckResult extends SubscriptionCheckResult {
    isFeatureLocked?: boolean;
}

/**
 * Checks if a specific feature flag (Checkbox) is enabled in the active plan for a company.
 */
export async function checkPlanFeature(
    companyId: string | mongoose.Types.ObjectId,
    featureKey: keyof IPlan
): Promise<FeatureCheckResult> {
    // 1. Check time-based subscription validity first
    const subCheck = await checkCompanySubscription(companyId);
    if (!subCheck.isAllowed) {
        return subCheck;
    }

    // 2. Check feature flag checkbox in company plan
    const plan = subCheck.subscription?.planId as any;
    if (plan && plan[featureKey] === false) {
        return {
            isAllowed: false,
            isFeatureLocked: true,
            subscription: subCheck.subscription,
            response: NextResponse.json(
                {
                    success: false,
                    message: "هذه الميزة غير مدمجة في باقة اشتراك المنشأة الحالية. يرجى ترقية الباقة للاستفادة منها.",
                    isFeatureLocked: true,
                    featureKey,
                },
                { status: 403 }
            ),
        };
    }

    return {
        isAllowed: true,
        subscription: subCheck.subscription,
    };
}
