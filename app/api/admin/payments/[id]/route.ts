/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/payment";
import { can } from "@/utils/permissions";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(_req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "payment", "read")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid payment ID" }, { status: 400 });
        }

        const payment = await Payment.findById(id).populate("invoiceId", "invoiceNumber total status");
        if (!payment) {
            return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: payment }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}

export async function DELETE(_req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "payment", "delete")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid payment ID" }, { status: 400 });
        }

        const deleted = await Payment.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ success: false, message: "Payment record not found or already deleted" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Payment record deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}
