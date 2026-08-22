/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { trackingEventCreateValidationSchema } from "@/lib/validations";
import TrackingEvent from "@/models/trackingevent";
import Shipment from "@/models/shipment";
import { can } from "@/utils/permissions";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "trackingEvent", "create")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "صيغة البيانات غير صالحة" }, { status: 400 });
        }

        const validation = trackingEventCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "بيانات غير صالحة",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const data = validation.data;
        if (!mongoose.Types.ObjectId.isValid(data.shipmentId)) {
            return NextResponse.json({ success: false, message: "معرف الشحنة غير صالح" }, { status: 400 });
        }

        await connectDB();

        const targetShipment = await Shipment.findById(data.shipmentId);
        if (!targetShipment) {
            return NextResponse.json({ success: false, message: "الشحنة غير موجودة" }, { status: 404 });
        }

        const newEvent = await TrackingEvent.create({
            shipmentId: data.shipmentId,
            status: data.status,
            location: data.location || "",
            occurredAt: data.occurredAt || new Date(),
        });

        // Automatically sync tracking status to shipment status if valid
        const validStatuses = [
            "created", "confirmed", "assigned", "ready_for_pickup", "picked_up",
            "in_transit", "arrived", "out_for_delivery", "delivered",
            "delivery_failed", "cancelled", "returned", "exception"
        ];

        if (validStatuses.includes(data.status)) {
            await Shipment.findByIdAndUpdate(data.shipmentId, { status: data.status });
        }

        return NextResponse.json({ success: true, message: "تم إضافة نقطة التتبع وتحديث حالة الشحنة بنجاح", data: newEvent }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
