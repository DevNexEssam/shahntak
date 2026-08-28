/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { invoiceCreateValidationSchema } from "@/lib/validations";
import Invoice from "@/models/invoice";
import Company from "@/models/companies";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "invoice", "create")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "صيغة البيانات غير صالحة" }, { status: 400 });
        }

        const validation = invoiceCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "بيانات غير صالحة",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const data = validation.data;
        if (!mongoose.Types.ObjectId.isValid(data.companyId)) {
            return NextResponse.json({ success: false, message: "معرف الشركة غير صالح" }, { status: 400 });
        }

        await connectDB();

        const targetCompany = await Company.findOne({ _id: data.companyId, ...ACTIVE }).lean();
        if (!targetCompany) {
            return NextResponse.json({ success: false, message: "الشركة المرتبطة (Company) غير موجودة بالنظام" }, { status: 400 });
        }

        const finalInvoiceNumber = data.invoiceNumber && data.invoiceNumber.trim() !== ""
            ? data.invoiceNumber
            : `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        const exists = await Invoice.findOne({ invoiceNumber: finalInvoiceNumber }).lean();
        if (exists) {
            return NextResponse.json({ success: false, message: "رقم الفاتورة مستخدم بالفعل" }, { status: 409 });
        }

        const newInvoice = await Invoice.create({
            ...data,
            invoiceNumber: finalInvoiceNumber,
        });
        return NextResponse.json({ success: true, message: `تم إصدار الفاتورة رقم (${finalInvoiceNumber}) بنجاح`, data: newInvoice }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
