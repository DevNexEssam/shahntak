/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/invoice";
import { invoiceUpdateValidationSchema } from "@/lib/validations/invoice.schema";

// get invoice
export async function GET(req: NextRequest) {
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
                { success: false, message: "غير مصرح لك" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        const { pathname } = new URL(req.url);
        const id = pathname.split("/").pop();

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الفاتورة غير صالح" },
                { status: 400 }
            );
        }

        const invoice = await Invoice.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        })
            .populate("invoicePayments")
            .populate("invoiceShipments")
            .lean();

        if (!invoice) {
            return NextResponse.json(
                { success: false, message: "لم يتم العثور على الفاتورة" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: invoice }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم أثناء جلب الفاتورة", error: error.message },
            { status: 500 }
        );
    }
}

// update invoice
export async function PUT(req: NextRequest) {
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
                { success: false, message: "غير مصرح لك" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        const { pathname } = new URL(req.url);
        const id = pathname.split("/").pop();

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الفاتورة غير صالح" },
                { status: 400 }
            );
        }

        const invoice = await Invoice.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!invoice) {
            return NextResponse.json(
                { success: false, message: "لم يتم العثور على الفاتورة أو لا تملك صلاحية التعديل عليها" },
                { status: 404 }
            );
        }

        const body = await req.json();

        delete body.companyId;
        delete body._id;
        delete body.invoiceNumber;

        const validation = invoiceUpdateValidationSchema.safeParse(body);
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

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            id,
            { $set: validation.data },
            { new: true, runValidators: true }
        );

        return NextResponse.json(
            { success: true, message: "تم تحديث بيانات الفاتورة بنجاح", data: updatedInvoice },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء تحديث الفاتورة",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// delete invoice
export async function DELETE(req: NextRequest) {
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
                { success: false, message: "غير مصرح لك" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        const { searchParams, pathname } = new URL(req.url);
        const id = pathname.split("/").pop();
        const isHardDelete = searchParams.get("hard") === "true";

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الفاتورة غير صالح" },
                { status: 400 }
            );
        }

        const invoice = await Invoice.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
        });

        if (!invoice) {
            return NextResponse.json(
                { success: false, message: "لم يتم العثور على الفاتورة المراد حذفها" },
                { status: 404 }
            );
        }

        if (isHardDelete) {
            await Invoice.deleteOne({ _id: id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            return NextResponse.json(
                { success: true, message: "تم حذف الفاتورة نهائياً من النظام" },
                { status: 200 }
            );
        } else {
            invoice.deletedAt = new Date();
            invoice.status = "cancelled";
            await invoice.save();
            return NextResponse.json(
                { success: true, message: "تمت أرشفة وإلغاء الفاتورة بنجاح" },
                { status: 200 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء حذف الفاتورة",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
