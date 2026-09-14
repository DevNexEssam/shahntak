/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { paymentCreateValidationSchema } from "@/lib/validations";
import Payment from "@/models/payment";
import Invoice from "@/models/invoice";
import { can } from "@/utils/permissions";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "payment", "create")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Invalid data format" }, { status: 400 });
        }

        const validation = paymentCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid data",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const data = validation.data;
        if (!mongoose.Types.ObjectId.isValid(data.invoiceId)) {
            return NextResponse.json({ success: false, message: "Invalid invoice ID" }, { status: 400 });
        }

        await connectDB();

        const targetInvoice = await Invoice.findById(data.invoiceId);
        if (!targetInvoice) {
            return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
        }

        const newPayment = await Payment.create({
            invoiceId: data.invoiceId,
            amount: data.amount,
            method: data.method,
            paidAt: data.paidAt || new Date(),
        });

        // Automatically update invoice status to paid if payment covers total
        await Invoice.findByIdAndUpdate(data.invoiceId, { status: "paid" });

        return NextResponse.json({ success: true, message: "Payment recorded and invoice status updated successfully", data: newPayment }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}
