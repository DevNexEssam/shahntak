/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { subscriptionUpdateValidationSchema } from "@/lib/validations/subscription.schema";
import Subscription from "@/models/subscription";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
import mongoose from "mongoose";

// GET single subscription by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف الاشتراك غير صالح" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const role = session?.user?.role;
        if (!role || !can(role, "company", "read")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        await connectDB();

        const subscription = await Subscription.findOne({ _id: id, ...ACTIVE })
            .populate("companyId", "companyName email phone city")
            .populate("planId", "name price billingCycle maxOrdersPerMonth maxShipmentsPerMonth")
            .lean();

        if (!subscription) {
            return NextResponse.json({ success: false, message: "الاشتراك غير موجود بالنظام" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: subscription });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}

// PATCH update/renew subscription by ID
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف الاشتراك غير صالح" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const role = session?.user?.role;
        if (!role || !can(role, "company", "update")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "صيغة البيانات غير صالحة" }, { status: 400 });
        }

        const validation = subscriptionUpdateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "بيانات غير صالحة",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const updates = validation.data;
        await connectDB();

        const subscription = await Subscription.findOne({ _id: id, ...ACTIVE });
        if (!subscription) {
            return NextResponse.json({ success: false, message: "الاشتراك غير موجود بالنظام" }, { status: 404 });
        }

        Object.assign(subscription, updates);
        await subscription.save();

        const updatedSubscription = await Subscription.findById(id)
            .populate("companyId", "companyName email phone city")
            .populate("planId", "name price billingCycle maxOrdersPerMonth maxShipmentsPerMonth")
            .lean();

        return NextResponse.json({ success: true, message: "تم تحديث بيانات الاشتراك بنجاح", data: updatedSubscription });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}

// DELETE subscription by ID
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف الاشتراك غير صالح" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const role = session?.user?.role;
        if (!role || !can(role, "company", "delete")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const isHardDelete = searchParams.get("hard") === "true";

        await connectDB();

        const subscription = await Subscription.findOne({ _id: id, ...ACTIVE });
        if (!subscription) {
            return NextResponse.json({ success: false, message: "الاشتراك غير موجود بالنظام" }, { status: 404 });
        }

        if (isHardDelete) {
            await Subscription.deleteOne({ _id: id });
            return NextResponse.json({ success: true, message: "تم حذف الاشتراك نهائياً من النظام" });
        } else {
            subscription.deletedAt = new Date();
            await subscription.save();
            return NextResponse.json({ success: true, message: "تم إغلاق وأرشفة الاشتراك بنجاح" });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
