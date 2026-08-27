/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { routeUpdateValidationSchema } from "@/lib/validations";
import Route from "@/models/route";
import Carrier from "@/models/carrier";
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

        if (!role || !can(role, "route", "read")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف المسار غير صالح" }, { status: 400 });
        }

        const routeData = await Route.findOne({ _id: id, ...ACTIVE }).populate("carrierId", "name type");
        if (!routeData) {
            return NextResponse.json({ success: false, message: "المسار غير موجود" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: routeData }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "route", "update")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف المسار غير صالح" }, { status: 400 });
        }

        let updates;
        try {
            updates = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "صيغة البيانات غير صالحة" }, { status: 400 });
        }

        const validation = routeUpdateValidationSchema.safeParse(updates);
        if (!validation.success) {
            return NextResponse.json({ success: false, message: "بيانات غير صالحة", errors: validation.error.flatten().fieldErrors }, { status: 422 });
        }

        const updatePayload: Record<string, any> = { ...validation.data };

        if (updatePayload.carrierId && updatePayload.carrierId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(updatePayload.carrierId)) {
                return NextResponse.json({ success: false, message: "معرف الناقل (carrierId) غير صالح" }, { status: 400 });
            }
            const targetCarrier = await Carrier.findOne({ _id: updatePayload.carrierId, ...ACTIVE }).lean();
            if (!targetCarrier) {
                return NextResponse.json({ success: false, message: "الناقل المرتبط (Carrier) غير موجود بالنظام" }, { status: 400 });
            }
        }

        const updated = await Route.findOneAndUpdate({ _id: id, ...ACTIVE }, updatePayload, { new: true });
        if (!updated) {
            return NextResponse.json({ success: false, message: "المسار غير موجود" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "تم تعديل المسار بنجاح", data: updated }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        const canSoftDelete = role && can(role, "route", "softDelete");
        const canHardDelete = role && can(role, "route", "delete");

        if (!canSoftDelete && !canHardDelete) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف المسار غير صالح" }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const isHardDelete = searchParams.get("hard") === "true";

        let deleted;

        if (isHardDelete && canHardDelete) {
            deleted = await Route.findByIdAndDelete(id);
        } else if (canSoftDelete) {
            deleted = await Route.findOneAndUpdate({ _id: id, ...ACTIVE }, { isActive: false, deletedAt: new Date() }, { new: true });
        } else if (canHardDelete) {
            deleted = await Route.findByIdAndDelete(id);
        }

        if (!deleted) {
            return NextResponse.json({ success: false, message: "المسار غير موجود أو تم حذفه سابقاً" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "تم حذف المسار بنجاح" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
