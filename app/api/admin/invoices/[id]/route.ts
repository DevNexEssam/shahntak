/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { invoiceUpdateValidationSchema } from "@/lib/validations";
import Invoice from "@/models/invoice";
import Company from "@/models/companies";
import Payment from "@/models/payment";
import { ACTIVE } from "@/utils/constants";
import { can } from "@/utils/permissions";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(_req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "invoice", "read")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف الفاتورة غير صالح" }, { status: 400 });
        }

        const invoice = await Invoice.findOne({ _id: id, ...ACTIVE }).populate("companyId", "companyName email");
        if (!invoice) {
            return NextResponse.json({ success: false, message: "الفاتورة غير موجودة" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: invoice }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "invoice", "update")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف الفاتورة غير صالح" }, { status: 400 });
        }

        let updates;
        try {
            updates = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "صيغة البيانات غير صالحة" }, { status: 400 });
        }

        const validation = invoiceUpdateValidationSchema.safeParse(updates);
        if (!validation.success) {
            return NextResponse.json({ success: false, message: "بيانات غير صالحة", errors: validation.error.flatten().fieldErrors }, { status: 422 });
        }

        const updatePayload: Record<string, any> = { ...validation.data };

        if (updatePayload.companyId && updatePayload.companyId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(updatePayload.companyId)) {
                return NextResponse.json({ success: false, message: "معرف الشركة (companyId) غير صالح" }, { status: 400 });
            }
            const targetCompany = await Company.findOne({ _id: updatePayload.companyId, ...ACTIVE }).lean();
            if (!targetCompany) {
                return NextResponse.json({ success: false, message: "الشركة المرتبطة (Company) غير موجودة بالنظام" }, { status: 400 });
            }
        }

        const existingInvoice = await Invoice.findOne({ _id: id, ...ACTIVE });
        if (!existingInvoice) {
            return NextResponse.json({ success: false, message: "الفاتورة غير موجودة" }, { status: 404 });
        }

        // Re-evaluate invoice status against total payments if total updated
        if (updatePayload.total !== undefined) {
            const payments = await Payment.find({ invoiceId: id });
            const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
            if (totalPaid >= updatePayload.total && updatePayload.total > 0) {
                updatePayload.status = "paid";
            } else if (totalPaid < updatePayload.total && existingInvoice.status === "paid") {
                updatePayload.status = "issued";
            }
        }

        const updated = await Invoice.findOneAndUpdate({ _id: id, ...ACTIVE }, updatePayload, { new: true });
        return NextResponse.json({ success: true, message: "تم تعديل الفاتورة وإعادة حساب الحالة بنجاح", data: updated }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        const canSoftDelete = role && can(role, "invoice", "softDelete");
        const canHardDelete = role && can(role, "invoice", "delete");

        if (!canSoftDelete && !canHardDelete) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "معرف الفاتورة غير صالح" }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const isHardDelete = searchParams.get("hard") === "true";

        let deleted;

        if (isHardDelete && canHardDelete) {
            deleted = await Invoice.findByIdAndDelete(id);
        } else if (canSoftDelete) {
            deleted = await Invoice.findOneAndUpdate({ _id: id, ...ACTIVE }, { status: "cancelled", deletedAt: new Date() }, { new: true });
        } else if (canHardDelete) {
            deleted = await Invoice.findByIdAndDelete(id);
        }

        if (!deleted) {
            return NextResponse.json({ success: false, message: "الفاتورة غير موجودة أو تم حذفها سابقاً" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "تم إلغاء وحذف الفاتورة بنجاح" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
