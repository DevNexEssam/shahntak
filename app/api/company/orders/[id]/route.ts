/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/order";
import Shipment from "@/models/shipment";
import { orderUpdateValidationSchema } from "@/lib/validations/order.schema";

// get order
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
                { success: false, message: "معرف الطلب غير صالح" },
                { status: 400 }
            );
        }

        const order = await Order.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: "لم يتم العثور على الطلب" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: order }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم أثناء جلب الطلب", error: error.message },
            { status: 500 }
        );
    }
}

// update order
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
                { success: false, message: "معرف الطلب غير صالح" },
                { status: 400 }
            );
        }

        const order = await Order.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: "لم يتم العثور على الطلب أو لا تملك صلاحية التعديل عليه" },
                { status: 404 }
            );
        }

        const body = await req.json();

        // State Machine Integrity Rules & Safeguards (Scenarios 5, 7, 17, 18, 19, 20)
        const currentStatus = order.status;
        const newStatus = body.status;

        // Scenario 5: Cannot alter financials on delivered orders
        if (currentStatus === "delivered") {
            if (
                (body.codAmount !== undefined && Number(body.codAmount) !== Number(order.codAmount)) ||
                (body.orderValue !== undefined && Number(body.orderValue) !== Number(order.orderValue))
            ) {
                return NextResponse.json(
                    { success: false, message: "لا يمكن تعديل القيم المالية أو مبلغ التحصيل (COD) لطلب تم توصيله واستلامه بنجاح" },
                    { status: 400 }
                );
            }
        }

        // Scenarios 7, 18: Cannot move from delivered backwards
        if (currentStatus === "delivered" && newStatus && newStatus !== "delivered") {
            return NextResponse.json(
                { success: false, message: "لا يمكن تحويل حالة طلب مسلم ومكتمل (Delivered) إلى حالة أخرى مباشرة" },
                { status: 400 }
            );
        }

        // Scenario 19: Cannot jump directly from cancelled to shipped/delivered
        if (currentStatus === "cancelled" && (newStatus === "shipped" || newStatus === "delivered")) {
            return NextResponse.json(
                { success: false, message: "لا يمكن تحويل الطلب الملغي إلى مشحون أو مسلم مباشرة دون إعادته لقيد الانتظار أولاً" },
                { status: 400 }
            );
        }

        // Scenario 17: Cannot status jump directly from pending to delivered without a shipment
        if (currentStatus === "pending" && newStatus === "delivered" && !order.shipmentId) {
            return NextResponse.json(
                { success: false, message: "لا يمكن تحويل الطلب من قيد الانتظار إلى مسلم مباشرة دون تجميعه وشحنه" },
                { status: 400 }
            );
        }

        // Scenario 20: Validate required fields when exiting error state
        if (currentStatus === "error" && (newStatus === "validated" || newStatus === "pending")) {
            const mergedRecipientName = body.recipientName || order.recipientName;
            const mergedPhone = body.recipientPhone || order.recipientPhone;
            const mergedCity = body.recipientCity || order.recipientCity;
            const mergedAddress = body.recipientAddress || order.recipientAddress;

            if (!mergedRecipientName || !mergedPhone || !mergedCity || !mergedAddress) {
                return NextResponse.json(
                    { success: false, message: "يرجى تصحيح بيانات المستلم الناقصة (الاسم، الجوال، المدينة، والعنوان) قبل تفعيل الطلب" },
                    { status: 400 }
                );
            }
        }

        delete body.companyId;
        delete body.createdByUserId;
        delete body._id;
        delete body.orderNumber;

        const validation = orderUpdateValidationSchema.safeParse(body);
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

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { $set: validation.data },
            { new: true, runValidators: true }
        );

        return NextResponse.json(
            { success: true, message: "تم تحديث بيانات الطلب بنجاح", data: updatedOrder },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء تحديث الطلب",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// delete order
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
                { success: false, message: "معرف الطلب غير صالح" },
                { status: 400 }
            );
        }

        const order = await Order.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: "لم يتم العثور على الطلب المراد حذفه" },
                { status: 404 }
            );
        }

        // Scenario 11: Decouple from parent shipment if linked
        if (order.shipmentId) {
            await Shipment.findByIdAndUpdate(order.shipmentId, {
                $inc: { ordersCount: -1 }
            });
        }

        if (isHardDelete) {
            await Order.deleteOne({ _id: id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            return NextResponse.json(
                { success: true, message: "تم حذف الطلب نهائياً من النظام" },
                { status: 200 }
            );
        } else {
            order.deletedAt = new Date();
            order.status = "cancelled";
            order.shipmentId = undefined;
            await order.save();
            return NextResponse.json(
                { success: true, message: "تم إغلاق وأرشفة الطلب بنجاح" },
                { status: 200 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء حذف الطلب",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
