/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { planUpdateValidationSchema } from "@/lib/validations/plan.schema";
import Plan from "@/models/plan";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
import mongoose from "mongoose";

// GET single plan by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف الباقة غير صالح" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const role = session?.user?.role;
        if (!role || !can(role, "company", "read")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        await connectDB();

        const plan = await Plan.findOne({ _id: id, ...ACTIVE }).lean();

        if (!plan) {
            return NextResponse.json({ success: false, message: "الباقة غير موجودة بالنظام" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: plan });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}

// PATCH update plan by ID
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف الباقة غير صالح" }, { status: 400 });
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

        const validation = planUpdateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "بيانات غير صالحة",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const updates = validation.data;
        await connectDB();

        const plan = await Plan.findOne({ _id: id, ...ACTIVE });
        if (!plan) {
            return NextResponse.json({ success: false, message: "الباقة غير موجودة بالنظام" }, { status: 404 });
        }

        if (updates.name && updates.name !== plan.name) {
            const nameExists = await Plan.findOne({ name: updates.name, _id: { $ne: id }, ...ACTIVE }).lean();
            if (nameExists) {
                return NextResponse.json({ success: false, message: "اسم الباقة مستخدم بالفعل" }, { status: 409 });
            }
        }

        Object.assign(plan, updates);
        await plan.save();

        return NextResponse.json({ success: true, message: "تم تحديث بيانات الباقة بنجاح", data: plan });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}

// DELETE plan by ID (Soft delete / Hard delete)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف الباقة غير صالح" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const role = session?.user?.role;
        if (!role || !can(role, "company", "delete")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const isHardDelete = searchParams.get("hard") === "true";

        await connectDB();

        const plan = await Plan.findOne({ _id: id, ...ACTIVE });
        if (!plan) {
            return NextResponse.json({ success: false, message: "الباقة غير موجودة بالنظام" }, { status: 404 });
        }

        if (isHardDelete) {
            await Plan.deleteOne({ _id: id });
            return NextResponse.json({ success: true, message: "تم حذف الباقة نهائياً من النظام" });
        } else {
            plan.deletedAt = new Date();
            await plan.save();
            return NextResponse.json({ success: true, message: "تم نقل الباقة إلى الأرشيف بنجاح" });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
