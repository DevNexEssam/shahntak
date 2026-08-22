/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { vehicleUpdateValidationSchema } from "@/lib/validations";
import Vehicle from "@/models/vehicle";
import { ACTIVE } from "@/utils/constants";
import { can } from "@/utils/permissions";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(_req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "vehicle", "read")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف المركبة غير صالح" }, { status: 400 });
        }

        const vehicle = await Vehicle.findOne({ _id: id, ...ACTIVE });
        if (!vehicle) {
            return NextResponse.json({ success: false, message: "المركبة غير موجودة" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: vehicle }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "vehicle", "update")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف المركبة غير صالح" }, { status: 400 });
        }

        let updates;
        try {
            updates = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "صيغة البيانات غير صالحة" }, { status: 400 });
        }

        const validation = vehicleUpdateValidationSchema.safeParse(updates);
        if (!validation.success) {
            return NextResponse.json({ success: false, message: "بيانات غير صالحة", errors: validation.error.flatten().fieldErrors }, { status: 422 });
        }

        const updated = await Vehicle.findOneAndUpdate({ _id: id, ...ACTIVE }, validation.data, { new: true });
        if (!updated) {
            return NextResponse.json({ success: false, message: "المركبة غير موجودة" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "تم تعديل المركبة بنجاح", data: updated }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}

export async function DELETE(_req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        const canSoftDelete = role && can(role, "vehicle", "softDelete");
        const canHardDelete = role && can(role, "vehicle", "delete");

        if (!canSoftDelete && !canHardDelete) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف المركبة غير صالح" }, { status: 400 });
        }

        let deleted;
        if (canSoftDelete) {
            deleted = await Vehicle.findOneAndUpdate({ _id: id, ...ACTIVE }, { isActive: false, deletedAt: new Date() }, { new: true });
        } else {
            deleted = await Vehicle.findByIdAndDelete(id);
        }

        if (!deleted) {
            return NextResponse.json({ success: false, message: "المركبة غير موجودة أو تم حذفها سابقاً" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "تم حذف المركبة بنجاح" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
