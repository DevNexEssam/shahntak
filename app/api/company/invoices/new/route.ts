/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/invoice";
import Company from "@/models/companies";
import { invoiceCreateValidationSchema } from "@/lib/validations/invoice.schema";

// create invoice
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "يجب تسجيل الدخول أولاً" },
                { status: 401 }
            );
        }

        const { role, companyId, id: userId } = session.user as any;

        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك: إنشاء الفواتير مخصص للشركات فقط" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json(
                { success: false, message: "معرف الشركة غير صالح" },
                { status: 400 }
            );
        }

        const company = await Company.findOne({
            _id: activeCompanyId,
            status: "active",
            deletedAt: null,
        });

        if (!company) {
            return NextResponse.json(
                { success: false, message: "حساب الشركة غير نشط أو تم تعطيله" },
                { status: 403 }
            );
        }

        const body = await req.json();

        if (!body.invoiceNumber || body.invoiceNumber.trim() === "") {
            body.invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        body.companyId = activeCompanyId.toString();

        const validation = invoiceCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "بيانات الإدخال غير صالحة",
                    errors: validation.error.flatten().fieldErrors,
                },
                { status: 422 }
            );
        }

        const data = validation.data;

        const existingInvoice = await Invoice.findOne({
            invoiceNumber: data.invoiceNumber,
            deletedAt: null,
        });

        if (existingInvoice) {
            return NextResponse.json(
                { success: false, message: "رقم الفاتورة مسجل بالفعل في النظام" },
                { status: 409 }
            );
        }

        const newInvoice = await Invoice.create({
            invoiceNumber: data.invoiceNumber,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            total: data.total,
            status: data.status || "draft",
            dueDate: data.dueDate || undefined,
            deletedAt: null,
        });

        return NextResponse.json(
            { success: true, message: "تم إنشاء الفاتورة بنجاح", data: newInvoice },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء إنشاء الفاتورة",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
