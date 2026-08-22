/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { waybillCreateValidationSchema } from "@/lib/validations";
import Waybill from "@/models/waybill";
import Shipment from "@/models/shipment";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "waybill", "create")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "صيغة البيانات غير صالحة" }, { status: 400 });
        }

        const validation = waybillCreateValidationSchema.safeParse(body);
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

        const targetShipment = await Shipment.findOne({ _id: data.shipmentId, ...ACTIVE }).lean();
        if (!targetShipment) {
            return NextResponse.json({ success: false, message: "الشحنة المرتبطة (Shipment) غير موجودة بالنظام" }, { status: 400 });
        }

        const exists = await Waybill.findOne({
            $or: [{ waybillNumber: data.waybillNumber }, { shipmentId: data.shipmentId }],
        }).lean();

        if (exists) {
            return NextResponse.json({ success: false, message: "بوليصة الشحن مكررة أو مسجلة لشحنة أخرى بالفعل" }, { status: 409 });
        }

        const newWaybill = await Waybill.create({
            shipmentId: data.shipmentId,
            waybillNumber: data.waybillNumber,
            pdfUrl: data.pdfUrl,
            issuedAt: data.issuedAt || new Date(),
        });

        // Sync waybillNumber into shipment document
        await Shipment.findByIdAndUpdate(data.shipmentId, { waybillNumber: data.waybillNumber });

        return NextResponse.json({ success: true, message: "تم إصدار وتوليد بوليصة الشحن بنجاح", data: newWaybill }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
