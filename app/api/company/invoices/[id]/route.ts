/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/invoice";
import Shipment from "@/models/shipment";
import Company from "@/models/companies";
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

        // 🟢 الشرط 8: حساب مبالغ الخصم وضريبة القيمة المضافة طبقاً للقطة التاريخية المجمدة taxRateSnapshot
        const companyRecord = await Company.findById(activeCompanyId).lean();
        const effectiveTaxRate = invoice.taxRateSnapshot !== undefined 
            ? Number(invoice.taxRateSnapshot) 
            : (companyRecord?.vatRate !== undefined ? Number(companyRecord.vatRate) : 15);

        const discount = Number(invoice.discount || 0);
        let basePrice = Number(invoice.subtotal || 0);

        const linkedShipment = invoice.invoiceShipments && invoice.invoiceShipments.length > 0 
            ? invoice.invoiceShipments[0] 
            : await Shipment.findOne({ invoiceId: invoice._id, deletedAt: null }).lean();

        if (linkedShipment && (linkedShipment.customerPrice > 0 || linkedShipment.shippingCost > 0)) {
            basePrice = Number(linkedShipment.customerPrice || linkedShipment.shippingCost);
        } else if (basePrice === 0) {
            const rawTotal = Number(invoice.total || 0);
            const rateMultiplier = 1 + (effectiveTaxRate / 100);
            basePrice = Math.round(((rawTotal / rateMultiplier) + discount) * 100) / 100;
        }

        const validDiscount = Math.min(basePrice, Math.max(0, discount));
        const discountedSubtotal = Math.max(0, basePrice - validDiscount);
        const vatAmount = Math.round(discountedSubtotal * (effectiveTaxRate / 100) * 100) / 100;
        const computedTotal = Math.round((discountedSubtotal + vatAmount) * 100) / 100;

        const enrichedInvoice = {
            ...invoice,
            subtotal: basePrice,
            discount: validDiscount,
            discountedSubtotal,
            vatAmount,
            taxRateSnapshot: effectiveTaxRate,
            taxRate: effectiveTaxRate,
            vatExemptionReason: effectiveTaxRate === 0 ? (companyRecord?.vatExemptionReason || "خدمات نقل معفاة بموجب اللائحة") : "",
            total: computedTotal,
        };

        return NextResponse.json({ success: true, data: enrichedInvoice }, { status: 200 });
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

        // 🔴 الشرط 1 والشرط 6: قفل الفواتير المدفوعة نهائياً وحظر إعادة الفتح والتراجع بالحالة
        if (invoice.status === "paid") {
            return NextResponse.json(
                {
                    success: false,
                    message: "حماية النزاهة المالية: لا يمكن تعديل بيانات أو مبالغ أو إعادة فتح فاتورة سُددت وبحالة مدفوعة نهائياً",
                },
                { status: 400 }
            );
        }

        const body = await req.json();

        // 🟢 الشرط 4 والشرط 5: حظر وتصفية أي محاولة لتغيير رقم الفاتورة، تاريخ الإصدار، أو معرف الشركة
        delete body.companyId;
        delete body._id;
        delete body.invoiceNumber;
        delete body.createdAt;
        delete body.issuedAt;
        delete body.issuedDate;
        delete body.updatedAt;

        // 🔴 الشرط 6: حظر التغيير غير الشرعي للحالة إلى مدفوع يدوياً دون إجراء تسليم
        if (body.status === "paid" && invoice.status !== "paid") {
            const linkedShipment = await Shipment.findOne({ invoiceId: invoice._id, deletedAt: null }).lean();
            if (linkedShipment && linkedShipment.status !== "delivered") {
                return NextResponse.json(
                    {
                        success: false,
                        message: "لا يمكن تحويل حالة الفاتورة إلى مدفوعة يدوياً للشحنات غير المسلمة",
                    },
                    { status: 400 }
                );
            }
        }

        // 🟠 الشرط 7: مطابقة إجمالي الفاتورة وحساب الخصم والضريبة طبقاً لـ taxRateSnapshot
        const companyRecord = await Company.findById(activeCompanyId).lean();
        const effectiveTaxRate = invoice.taxRateSnapshot !== undefined 
            ? Number(invoice.taxRateSnapshot) 
            : (companyRecord?.vatRate !== undefined ? Number(companyRecord.vatRate) : 15);

        const linkedShipment = await Shipment.findOne({ invoiceId: invoice._id, deletedAt: null }).lean();

        let basePrice = Number(invoice.subtotal || 0);
        if (linkedShipment && (linkedShipment.customerPrice > 0 || linkedShipment.shippingCost > 0)) {
            basePrice = Number(linkedShipment.customerPrice || linkedShipment.shippingCost);
        } else if (basePrice === 0) {
            const currentDiscount = Number(invoice.discount || 0);
            const rateMultiplier = 1 + (effectiveTaxRate / 100);
            basePrice = Math.round(((Number(invoice.total || 0) / rateMultiplier) + currentDiscount) * 100) / 100;
        }

        let newDiscount = body.discount !== undefined ? Number(body.discount) : Number(invoice.discount || 0);
        if (isNaN(newDiscount) || newDiscount < 0) {
            newDiscount = 0;
        }
        if (newDiscount > basePrice) {
            newDiscount = basePrice;
        }

        const discountedSubtotal = Math.max(0, basePrice - newDiscount);
        const vatAmount = Math.round(discountedSubtotal * (effectiveTaxRate / 100) * 100) / 100;
        const computedTotal = Math.round((discountedSubtotal + vatAmount) * 100) / 100;

        body.subtotal = basePrice;
        body.discount = newDiscount;
        body.vatAmount = vatAmount;
        body.taxRateSnapshot = effectiveTaxRate;
        body.total = computedTotal;

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

        // 🟠 الشرط 2: حظر حذف أو إلغاء الفاتورة إذا كانت مدفوعة أو مرتبطة بشحنة مكتملة ومسلمة
        if (invoice.status === "paid") {
            return NextResponse.json(
                { success: false, message: "حماية النزاهة المالية: لا يمكن حذف أو إلغاء فاتورة تم تحصيلها وبحالة مدفوعة" },
                { status: 400 }
            );
        }

        const linkedShipment = await Shipment.findOne({ invoiceId: invoice._id, deletedAt: null }).lean();
        if (linkedShipment && linkedShipment.status === "delivered") {
            return NextResponse.json(
                { success: false, message: "حماية النزاهة الضريبية: لا يمكن حذف أو إلغاء فاتورة مرتبطة بشحنة مكتملة ومسلّمة" },
                { status: 400 }
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

