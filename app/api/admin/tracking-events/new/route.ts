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
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Invalid data format" }, { status: 400 });
        }

        const validation = trackingEventCreateValidationSchema.safeParse(body);
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

        const targetShipment = await Shipment.findById(data.shipmentId);
        if (!targetShipment) {
            return NextResponse.json({ success: false, message: "Shipment not found" }, { status: 404 });
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

        return NextResponse.json({ success: true, message: "Tracking event added and shipment status updated successfully", data: newEvent }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}
