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

        const targetCompany = await Company.findOne({ _id: data.companyId, status: "active", deletedAt: null }).lean();
        if (!targetCompany) {
            return NextResponse.json({ success: false, message: "الشركة المرتبطة (Company) غير موجودة بالنظام أو غير نشطة" }, { status: 400 });
        }

        const effectiveTaxRate = (targetCompany as any).vatRate !== undefined ? Number((targetCompany as any).vatRate) : 15;

        // Anti-duplication check for shipment if provided
        const rawBody = body as any;
        let targetShipment: any = null;
        if (rawBody.shipmentId && mongoose.Types.ObjectId.isValid(rawBody.shipmentId)) {
            const Shipment = (await import("@/models/shipment")).default;
            targetShipment = await Shipment.findOne({ _id: rawBody.shipmentId, companyId: data.companyId, deletedAt: null });

            if (targetShipment) {
                const existingInvoice = await Invoice.findOne({
                    companyId: data.companyId,
                    $or: [{ _id: targetShipment.invoiceId }, { shipmentId: targetShipment._id }],
                    status: { $ne: "cancelled" },
                    deletedAt: null,
                });

                if (existingInvoice || targetShipment.invoiceId) {
                    return NextResponse.json(
                        { success: false, message: `حماية النزاهة المالية: هذه الشحنة تملك فاتورة صادرة مسبقاً برقم (${existingInvoice?.invoiceNumber || "مسبقاً"})` },
                        { status: 409 }
                    );
                }
            }
        }

        const finalInvoiceNumber = data.invoiceNumber && data.invoiceNumber.trim() !== ""
            ? data.invoiceNumber
            : `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

        const exists = await Invoice.findOne({ invoiceNumber: finalInvoiceNumber, deletedAt: null }).lean();
        if (exists) {
            return NextResponse.json({ success: false, message: "رقم الفاتورة مستخدم بالفعل في النظام" }, { status: 409 });
        }

        // Calculate breakdown
        const baseSubtotal = Number(data.subtotal || data.total || 0);
        const discount = Number(data.discount || 0);
        const discountedSubtotal = Math.max(0, baseSubtotal - discount);
        const vatAmount = Number(data.vatAmount || Math.round(discountedSubtotal * (effectiveTaxRate / 100) * 100) / 100);
        const finalTotal = Number(data.total || Math.round((discountedSubtotal + vatAmount) * 100) / 100);

        const newInvoice = await Invoice.create({
            ...data,
            invoiceNumber: finalInvoiceNumber,
            companyId: new mongoose.Types.ObjectId(data.companyId),
            subtotal: baseSubtotal,
            discount,
            vatAmount,
            taxRateSnapshot: effectiveTaxRate,
            total: finalTotal,
            shipmentId: targetShipment ? targetShipment._id : undefined,
        });

        if (targetShipment) {
            targetShipment.invoiceId = newInvoice._id;
            await targetShipment.save();
        }

        return NextResponse.json({ success: true, message: `تم إصدار الفاتورة الضريبية رقم (${finalInvoiceNumber}) بنجاح`, data: newInvoice }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
