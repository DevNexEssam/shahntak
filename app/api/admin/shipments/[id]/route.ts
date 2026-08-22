import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { shipmentUpdateValidationSchema } from "@/lib/validations";
import Shipment from "@/models/shipment";
import Company from "@/models/companies";
import Route from "@/models/route";
import Carrier from "@/models/carrier";
import Vehicle from "@/models/vehicle";
import { ACTIVE } from "@/utils/constants";
import { can } from "@/utils/permissions";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET single shipment
export async function GET(_req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "shipment", "read")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الشحنة غير صالح" },
                { status: 400 }
            );
        }

        const shipment = await Shipment.findOne({ _id: id, ...ACTIVE })
            .populate("companyId", "companyName email")
            .populate("carrierId", "name type contactPhone")
            .populate("vehicleId", "type capacityWeight capacityVolume")
            .populate("routeId", "origin destination basePrice");

        if (!shipment) {
            return NextResponse.json(
                { success: false, message: "الشحنة غير موجودة" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: shipment },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}

// PATCH update shipment
export async function PATCH(req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "shipment", "update")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الشحنة غير صالح" },
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

        const validation = shipmentUpdateValidationSchema.safeParse(updates);

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

        if (updatePayload.routeId && updatePayload.routeId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(updatePayload.routeId)) {
                return NextResponse.json({ success: false, message: "معرف المسار (routeId) غير صالح" }, { status: 400 });
            }
            const targetRoute = await Route.findOne({ _id: updatePayload.routeId, ...ACTIVE }).lean();
            if (!targetRoute) {
                return NextResponse.json({ success: false, message: "المسار المرتبط (Route) غير موجود بالنظام" }, { status: 400 });
            }
        }

        if (updatePayload.carrierId && updatePayload.carrierId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(updatePayload.carrierId)) {
                return NextResponse.json({ success: false, message: "معرف الناقل (carrierId) غير صالح" }, { status: 400 });
            }
            const targetCarrier = await Carrier.findOne({ _id: updatePayload.carrierId, ...ACTIVE }).lean();
            if (!targetCarrier) {
                return NextResponse.json({ success: false, message: "الناقل المرتبط (Carrier) غير موجود بالنظام" }, { status: 400 });
            }
        }

        if (updatePayload.vehicleId && updatePayload.vehicleId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(updatePayload.vehicleId)) {
                return NextResponse.json({ success: false, message: "معرف المركبة (vehicleId) غير صالح" }, { status: 400 });
            }
            const targetVehicle = await Vehicle.findOne({ _id: updatePayload.vehicleId, ...ACTIVE }).lean();
            if (!targetVehicle) {
                return NextResponse.json({ success: false, message: "المركبة المرتبطة (Vehicle) غير موجودة بالنظام" }, { status: 400 });
            }
        }

        const updatedShipment = await Shipment.findOneAndUpdate(
            { _id: id, ...ACTIVE },
            updatePayload,
            { new: true }
        );

        if (!updatedShipment) {
            return NextResponse.json(
                { success: false, message: "الشحنة غير موجودة" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "تم تعديل بيانات الشحنة بنجاح", data: updatedShipment },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}

// DELETE shipment
export async function DELETE(_req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        const canSoftDelete = role && can(role, "shipment", "softDelete");
        const canHardDelete = role && can(role, "shipment", "delete");

        if (!canSoftDelete && !canHardDelete) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الشحنة غير صالح" },
                { status: 400 }
            );
        }

        let deletedShipment;

        // Perform soft delete if permitted, otherwise hard delete
        if (canSoftDelete) {
            deletedShipment = await Shipment.findOneAndUpdate(
                { _id: id, ...ACTIVE },
                { status: "cancelled", deletedAt: new Date() },
                { new: true }
            );
        } else {
            deletedShipment = await Shipment.findByIdAndDelete(id);
        }

        if (!deletedShipment) {
            return NextResponse.json(
                { success: false, message: "الشحنة غير موجودة أو تم حذفها سابقاً" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "تم إلغاء وحذف الشحنة بنجاح" },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}
