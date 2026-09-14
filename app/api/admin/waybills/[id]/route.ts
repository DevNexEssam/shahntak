/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Waybill from "@/models/waybill";
import { can } from "@/utils/permissions";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(_req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "waybill", "read")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid waybill ID" }, { status: 400 });
        }

        const waybill = await Waybill.findById(id).populate("shipmentId", "shipmentNumber status origin destination");
        if (!waybill) {
            return NextResponse.json({ success: false, message: "Waybill not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: waybill }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}

export async function DELETE(_req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "waybill", "delete")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid waybill ID" }, { status: 400 });
        }

        const deleted = await Waybill.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ success: false, message: "Waybill not found or already deleted" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Waybill deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}
