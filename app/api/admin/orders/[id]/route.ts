import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { orderUpdateValidationSchema } from "@/lib/validations";
import Order from "@/models/order";
import Company from "@/models/companies";
import CompanyUser from "@/models/Companyuser";
import Shipment from "@/models/shipment";
import { ACTIVE } from "@/utils/constants";
import { can } from "@/utils/permissions";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET single order
export async function GET(_req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "order", "read")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الطلب غير صالح" },
                { status: 400 }
            );
        }

        const order = await Order.findOne({ _id: id, ...ACTIVE })
            .populate("companyId", "companyName email")
            .populate("createdByUserId", "userName userEmail")
            .populate("shipmentId", "shipmentNumber status");

        if (!order) {
            return NextResponse.json(
                { success: false, message: "الطلب غير موجود" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: order },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}

// PATCH update order
export async function PATCH(req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "order", "update")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الطلب غير صالح" },
                { status: 400 }
            );
        }

        let updates;
        try {
            updates = await req.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "صيغة البيانات غير صالحة" },
                { status: 400 }
            );
        }

        const validation = orderUpdateValidationSchema.safeParse(updates);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "بيانات غير صالحة",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const updatePayload: Record<string, any> = { ...validation.data };

        if (updatePayload.companyId && updatePayload.companyId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(updatePayload.companyId)) {
                return NextResponse.json({ success: false, message: "معرف الشركة (companyId) غير صالح" }, { status: 400 });
            }
            const targetCompany = await Company.findOne({ _id: updatePayload.companyId, ...ACTIVE }).lean();
            if (!targetCompany) {
                return NextResponse.json({ success: false, message: "الشركة المرتبطة (Company) غير موجودة بالنظام" }, { status: 400 });
            }
        }

        if (updatePayload.createdByUserId && updatePayload.createdByUserId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(updatePayload.createdByUserId)) {
                return NextResponse.json({ success: false, message: "معرف منشئ الطلب (createdByUserId) غير صالح" }, { status: 400 });
            }
            const targetUser = await CompanyUser.findOne({ _id: updatePayload.createdByUserId, ...ACTIVE }).lean();
            if (!targetUser) {
                return NextResponse.json({ success: false, message: "منشئ الطلب (CompanyUser) غير موجود بالنظام" }, { status: 400 });
            }
        }

        if (updatePayload.shipmentId && updatePayload.shipmentId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(updatePayload.shipmentId)) {
                return NextResponse.json({ success: false, message: "معرف الشحنة (shipmentId) غير صالح" }, { status: 400 });
            }
            const targetShipment = await Shipment.findOne({ _id: updatePayload.shipmentId, ...ACTIVE }).lean();
            if (!targetShipment) {
                return NextResponse.json({ success: false, message: "الشحنة المرتبطة (Shipment) غير موجودة بالنظام" }, { status: 400 });
            }
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: id, ...ACTIVE },
            updatePayload,
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json(
                { success: false, message: "الطلب غير موجود" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "تم تعديل الطلب بنجاح", data: updatedOrder },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}

// DELETE order
export async function DELETE(_req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        const canSoftDelete = role && can(role, "order", "softDelete");
        const canHardDelete = role && can(role, "order", "delete");

        if (!canSoftDelete && !canHardDelete) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الطلب غير صالح" },
                { status: 400 }
            );
        }

        let deletedOrder;

        // Perform soft delete if permitted, otherwise hard delete
        if (canSoftDelete) {
            deletedOrder = await Order.findOneAndUpdate(
                { _id: id, ...ACTIVE },
                { status: "cancelled", deletedAt: new Date() },
                { new: true }
            );
        } else {
            deletedOrder = await Order.findByIdAndDelete(id);
        }

        if (!deletedOrder) {
            return NextResponse.json(
                { success: false, message: "الطلب غير موجود أو تم حذفه سابقاً" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "تم حذف الطلب بنجاح" },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}
