/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/invoice";
import Shipment from "@/models/shipment";
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

        // 🟢 الشرط 8: حساب مبالغ ضريبة القيمة المضافة 15% والصافي موحداً من الباك إند
        const total = Number(invoice.total || 0);
        const subtotal = Math.round((total / 1.15) * 100) / 100;
        const vatAmount = Math.round((total - subtotal) * 100) / 100;

        const enrichedInvoice = {
            ...invoice,
            subtotal,
            vatAmount,
            taxRate: 15,
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
            // للتأكد من أن السداد تم عبر نظام التسليم أو الدفع وليس تعديل يدوياً
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

        // 🟠 الشرط 7: مطابقة إجمالي الفاتورة مع مجموع قيم الطلبات/الشحنة المرفقة
        const linkedShipment = await Shipment.findOne({ invoiceId: invoice._id, deletedAt: null }).lean();
        if (linkedShipment && (linkedShipment.customerPrice > 0 || linkedShipment.shippingCost > 0)) {
            body.total = linkedShipment.customerPrice || linkedShipment.shippingCost;
        }

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

