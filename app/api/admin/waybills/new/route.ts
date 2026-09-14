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
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Invalid data format" }, { status: 400 });
        }

        const validation = waybillCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid data",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const data = validation.data;
        if (!mongoose.Types.ObjectId.isValid(data.shipmentId)) {
            return NextResponse.json({ success: false, message: "Invalid shipment ID" }, { status: 400 });
        }

        await connectDB();

        const targetShipment = await Shipment.findOne({ _id: data.shipmentId, ...ACTIVE }).lean();
        if (!targetShipment) {
            return NextResponse.json({ success: false, message: "Associated shipment does not exist" }, { status: 400 });
        }

        const exists = await Waybill.findOne({
            $or: [{ waybillNumber: data.waybillNumber }, { shipmentId: data.shipmentId }],
        }).lean();

        if (exists) {
            return NextResponse.json({ success: false, message: "Waybill number is duplicate or already registered for another shipment" }, { status: 409 });
        }

        const newWaybill = await Waybill.create({
            shipmentId: data.shipmentId,
            waybillNumber: data.waybillNumber,
            pdfUrl: data.pdfUrl,
            issuedAt: data.issuedAt || new Date(),
        });

        // Sync waybillNumber into shipment document
        await Shipment.findByIdAndUpdate(data.shipmentId, { waybillNumber: data.waybillNumber });

        return NextResponse.json({ success: true, message: "Waybill generated and issued successfully", data: newWaybill }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}
