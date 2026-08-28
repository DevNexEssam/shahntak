/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { subscriptionCreateValidationSchema } from "@/lib/validations/subscription.schema";
import Subscription from "@/models/subscription";
import Company from "@/models/companies";
import Plan from "@/models/plan";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "company", "create")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "صيغة البيانات غير صالحة" }, { status: 400 });
        }

        const validation = subscriptionCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "بيانات غير صالحة",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const data = validation.data;

        if (!mongoose.Types.ObjectId.isValid(data.companyId) || !mongoose.Types.ObjectId.isValid(data.planId)) {
            return NextResponse.json({ success: false, message: "معرف الشركة أو الباقة غير صالح" }, { status: 400 });
        }

        await connectDB();

        const [targetCompany, targetPlan] = await Promise.all([
            Company.findOne({ _id: data.companyId, ...ACTIVE }).lean(),
            Plan.findOne({ _id: data.planId, ...ACTIVE }).lean(),
        ]);

        if (!targetCompany) {
            return NextResponse.json({ success: false, message: "الشركة غير موجودة بالنظام" }, { status: 404 });
        }

        if (!targetPlan) {
            return NextResponse.json({ success: false, message: "الباقة غير موجودة بالنظام" }, { status: 404 });
        }

        // Deactivate any previous active subscriptions for this company
        await Subscription.updateMany(
            { companyId: data.companyId, status: "active", ...ACTIVE },
            { $set: { status: "expired" } }
        );

        const newSubscription = await Subscription.create(data);
        const populatedSubscription = await Subscription.findById(newSubscription._id)
            .populate("companyId", "companyName email phone city")
            .populate("planId", "name price billingCycle maxOrdersPerMonth maxShipmentsPerMonth")
            .lean();

        return NextResponse.json({ success: true, message: "تم تفعيل اشتراك الشركة بنجاح", data: populatedSubscription }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
