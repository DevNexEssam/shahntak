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
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "صيغة البيانات غير صالحة" }, { status: 400 });
        }

        const validation = paymentCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "بيانات غير صالحة",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const data = validation.data;
        if (!mongoose.Types.ObjectId.isValid(data.invoiceId)) {
            return NextResponse.json({ success: false, message: "معرف الفاتورة غير صالح" }, { status: 400 });
        }

        await connectDB();

        const targetInvoice = await Invoice.findById(data.invoiceId);
        if (!targetInvoice) {
            return NextResponse.json({ success: false, message: "الفاتورة غير موجودة" }, { status: 404 });
        }

        const newPayment = await Payment.create({
            invoiceId: data.invoiceId,
            amount: data.amount,
            method: data.method,
            paidAt: data.paidAt || new Date(),
        });

        // Automatically update invoice status to paid if payment covers total
        await Invoice.findByIdAndUpdate(data.invoiceId, { status: "paid" });

        return NextResponse.json({ success: true, message: "تم تسجيل الدفعة وتحديث حالة الفاتورة بنجاح", data: newPayment }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
