/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Shipment from "@/models/shipment";
import Order from "@/models/order";
import Invoice from "@/models/invoice";
import Route from "@/models/route";
import { shipmentUpdateValidationSchema } from "@/lib/validations/shipment.schema";

// get shipment
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
                { success: false, message: "معرف الشحنة غير صالح" },
                { status: 400 }
            );
        }

        const shipment = await Shipment.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        })
            .populate("companyId", "companyName taxNumber city address phone email")
            .populate("vehicleId")
            .populate("carrierId")
            .populate("routeId")
            .populate("shipmentOrders")
            .lean();

        if (!shipment) {
            return NextResponse.json(
                { success: false, message: "لم يتم العثور على الشحنة" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: shipment }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم أثناء جلب الشحنة", error: error.message },
            { status: 500 }
        );
    }
}

// update shipment
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
                { success: false, message: "معرف الشحنة غير صالح" },
                { status: 400 }
            );
        }

        const shipment = await Shipment.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!shipment) {
            return NextResponse.json(
                { success: false, message: "لم يتم العثور على الشحنة أو لا تملك صلاحية التعديل عليها" },
                { status: 404 }
            );
        }

        const body = await req.json();

        // Strict Lock: Delivered shipments cannot be modified in any way
        if (shipment.status === "delivered") {
            return NextResponse.json(
                { success: false, message: "الشحنة مسلّمة بالكامل (Delivered) ومقفلة نهائياً، لا يمكن إجراء أي تعديل عليها أو تغيير حالتها." },
                { status: 400 }
            );
        }

        // block route edits in transit
        const inTransitStates = ["picked_up", "in_transit", "arrived", "out_for_delivery"];
        if (inTransitStates.includes(shipment.status)) {
            if (
                (body.origin && body.origin.trim() !== shipment.origin) ||
                (body.destination && body.destination.trim() !== shipment.destination)
            ) {
                return NextResponse.json(
                    { success: false, message: "لا يمكن تعديل مدينة المصدر أو الوجهة لشحنة تم استلامها وتحريكها بالفعل على الطريق" },
                    { status: 400 }
                );
            }
        }

        delete body.companyId;
        delete body._id;
        delete body.shipmentNumber;

        // Auto-recalculate prices based on Route & Orders (block manual edits)
        const targetRouteId = body.routeId !== undefined ? body.routeId : shipment.routeId;
        let routeBasePrice = 0;

        if (targetRouteId && mongoose.Types.ObjectId.isValid(targetRouteId)) {
            const routeObj = await Route.findOne({
                _id: targetRouteId,
                companyId: new mongoose.Types.ObjectId(activeCompanyId),
                deletedAt: null,
            });
            if (routeObj) {
                routeBasePrice = Number(routeObj.basePrice || 0);
            }
        }

        const linkedOrders = await Order.find({
            shipmentId: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        }).lean();

        const ordersValueSum = linkedOrders.reduce(
            (sum: number, ord: any) => sum + (Number(ord.orderValue) || Number(ord.codAmount) || 0),
            0
        );

        body.shippingCost = routeBasePrice;
        body.customerPrice = ordersValueSum + routeBasePrice;

        const validation = shipmentUpdateValidationSchema.safeParse(body);
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

        const newStatus = validation.data.status;

        // Prevent moving directly from cancelled to delivered or in_transit
        if (shipment.status === "cancelled" && (newStatus === "delivered" || newStatus === "in_transit")) {
            return NextResponse.json(
                { success: false, message: "لا يمكن تحويل الشحنة الملغية إلى في الطريق أو تم التوصيل مباشرة دون إعادة إطلاقها أولاً" },
                { status: 400 }
            );
        }

        // check delivery retry state
        if (shipment.status === "delivery_failed" && newStatus === "delivered") {
            return NextResponse.json(
                { success: false, message: "لا يمكن تحويل شحنة فاشلة التوصيل مباشرة إلى تم التوصيل دون خروجها للتوصيل مجدداً" },
                { status: 400 }
            );
        }

        const calculatedTotal = validation.data.customerPrice;

        if (newStatus === "delivered") {
            await Order.updateMany(
                { shipmentId: id, companyId: new mongoose.Types.ObjectId(activeCompanyId), deletedAt: null },
                { $set: { status: "delivered" } }
            );

            let existingInvoice = shipment.invoiceId
                ? await Invoice.findOne({ _id: shipment.invoiceId, deletedAt: null })
                : null;

            if (existingInvoice) {
                existingInvoice.status = "paid";
                await existingInvoice.save();
            } else {
                const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
                const newInvoice = await Invoice.create({
                    invoiceNumber,
                    companyId: new mongoose.Types.ObjectId(activeCompanyId),
                    subtotal: calculatedTotal,
                    total: calculatedTotal,
                    status: "paid",
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    deletedAt: null,
                });
                (validation.data as any).invoiceId = newInvoice._id;
            }
        } else if (newStatus === "in_transit") {
            await Order.updateMany(
                { shipmentId: id, companyId: new mongoose.Types.ObjectId(activeCompanyId), deletedAt: null },
                { $set: { status: "shipped" } }
            );
        } else if (newStatus === "cancelled") {
            // reset attached orders
            await Order.updateMany(
                { shipmentId: id, companyId: new mongoose.Types.ObjectId(activeCompanyId), deletedAt: null },
                { $set: { shipmentId: null, status: "pending" } }
            );
        } else if (!shipment.invoiceId) {
            // Ensure invoice exists even if created/pending
            const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
            const newInvoice = await Invoice.create({
                invoiceNumber,
                companyId: new mongoose.Types.ObjectId(activeCompanyId),
                subtotal: calculatedTotal,
                total: calculatedTotal,
                status: "issued",
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                deletedAt: null,
            });
            (validation.data as any).invoiceId = newInvoice._id;
        }

        const updatedShipment = await Shipment.findByIdAndUpdate(
            id,
            { $set: validation.data },
            { new: true, runValidators: true }
        );

        return NextResponse.json(
            { success: true, message: "تم تحديث بيانات الشحنة بنجاح", data: updatedShipment },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء تحديث الشحنة",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// delete shipment
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
                { success: false, message: "معرف الشحنة غير صالح" },
                { status: 400 }
            );
        }

        const shipment = await Shipment.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
        });

        if (!shipment) {
            return NextResponse.json(
                { success: false, message: "لم يتم العثور على الشحنة المراد حذفها" },
                { status: 404 }
            );
        }

        // check deletion state
        const activeShipmentStates = ["delivered", "in_transit", "out_for_delivery"];
        if (activeShipmentStates.includes(shipment.status)) {
            return NextResponse.json(
                { success: false, message: "لا يمكن حذف شحنة في الطريق أو تم تسليمها بالفعل للعملاء. يرجى استخدام إجراءات الإلغاء أو الإرجاع الرسمية" },
                { status: 400 }
            );
        }

        // Unlink associated orders and return them to pending
        await Order.updateMany(
            { shipmentId: id },
            { $set: { shipmentId: null, status: "pending" } }
        );

        // Cascade delete or cancel associated unpaid invoice
        const linkedInvoice = shipment.invoiceId
            ? await Invoice.findOne({ _id: shipment.invoiceId, companyId: new mongoose.Types.ObjectId(activeCompanyId), deletedAt: null })
            : await Invoice.findOne({ companyId: new mongoose.Types.ObjectId(activeCompanyId), deletedAt: null, $or: [{ _id: shipment.invoiceId }] });

        if (linkedInvoice && linkedInvoice.status !== "paid") {
            if (isHardDelete) {
                await Invoice.deleteOne({ _id: linkedInvoice._id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            } else {
                linkedInvoice.deletedAt = new Date();
                linkedInvoice.status = "cancelled";
                await linkedInvoice.save();
            }
        }

        if (isHardDelete) {
            await Shipment.deleteOne({ _id: id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            return NextResponse.json(
                { success: true, message: "تم حذف الشحنة وإلغاء الفاتورة غير المدفوعة وإعادة فك الطلبات بنجاح" },
                { status: 200 }
            );
        } else {
            shipment.deletedAt = new Date();
            shipment.status = "cancelled";
            await shipment.save();
            return NextResponse.json(
                { success: true, message: "تمت أرشفة الشحنة وإلغاء الفاتورة غير المدفوعة وإعادة فك الطلبات بنجاح" },
                { status: 200 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء حذف الشحنة",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
