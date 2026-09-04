/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Shipment from "@/models/shipment";
import Order from "@/models/order";
import Invoice from "@/models/invoice";
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

        delete body.companyId;
        delete body._id;
        delete body.shipmentNumber;

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
        let calculatedTotal = (validation.data.customerPrice !== undefined ? validation.data.customerPrice : shipment.customerPrice) || shipment.shippingCost || 0;

        if (calculatedTotal === 0) {
            const linkedOrders = await Order.find({
                shipmentId: id,
                companyId: new mongoose.Types.ObjectId(activeCompanyId),
                deletedAt: null,
            }).lean();
            if (linkedOrders.length > 0) {
                calculatedTotal = linkedOrders.reduce((sum: number, ord: any) => sum + (Number(ord.orderValue) || Number(ord.codAmount) || 0), 0);
            }
        }

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
                existingInvoice.total = calculatedTotal;
                await existingInvoice.save();
            } else {
                const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
                const newInvoice = await Invoice.create({
                    invoiceNumber,
                    companyId: new mongoose.Types.ObjectId(activeCompanyId),
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
            await Order.updateMany(
                { shipmentId: id, companyId: new mongoose.Types.ObjectId(activeCompanyId), deletedAt: null },
                { $set: { status: "cancelled" } }
            );
        } else if (!shipment.invoiceId) {
            // Ensure invoice exists even if created/pending
            const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
            const newInvoice = await Invoice.create({
                invoiceNumber,
                companyId: new mongoose.Types.ObjectId(activeCompanyId),
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

        // Unlink associated orders
        await Order.updateMany(
            { shipmentId: id },
            { $unset: { shipmentId: 1 }, $set: { status: "pending" } }
        );

        if (isHardDelete) {
            await Shipment.deleteOne({ _id: id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            return NextResponse.json(
                { success: true, message: "تم حذف الشحنة نهائياً وإلغاء تجميع الطلبات المرتبطة" },
                { status: 200 }
            );
        } else {
            shipment.deletedAt = new Date();
            shipment.status = "cancelled";
            await shipment.save();
            return NextResponse.json(
                { success: true, message: "تمت أرشفة الشحنة وإلغاء تجميع الطلبات المرتبطة بها" },
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
