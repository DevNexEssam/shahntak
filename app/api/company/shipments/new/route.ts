/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Shipment from "@/models/shipment";
import Order from "@/models/order";
import Company from "@/models/companies";
import { shipmentCreateValidationSchema } from "@/lib/validations/shipment.schema";

// create shipment
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
                { success: false, message: "غير مصرح لك: إضافة الشحنات مخصصة للشركات فقط" },
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

        if (!body.shipmentNumber || body.shipmentNumber.trim() === "") {
            body.shipmentNumber = `SHP-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        if (!body.trackingNumber || body.trackingNumber.trim() === "") {
            body.trackingNumber = `TRK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        body.companyId = activeCompanyId.toString();

        const validation = shipmentCreateValidationSchema.safeParse(body);
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

        const existingShipment = await Shipment.findOne({
            shipmentNumber: data.shipmentNumber,
            deletedAt: null,
        });

        if (existingShipment) {
            return NextResponse.json(
                { success: false, message: "رقم الشحنة مسجل بالفعل في النظام" },
                { status: 409 }
            );
        }

        const orderIds = data.orderIds || [];
        const ordersCount = orderIds.length > 0 ? orderIds.length : (data.ordersCount || 0);

        const newShipment = await Shipment.create({
            shipmentNumber: data.shipmentNumber,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            type: data.type || "ftl",
            origin: data.origin.trim(),
            destination: data.destination.trim(),
            routeId: data.routeId && mongoose.Types.ObjectId.isValid(data.routeId) ? new mongoose.Types.ObjectId(data.routeId) : undefined,
            carrierId: data.carrierId && mongoose.Types.ObjectId.isValid(data.carrierId) ? new mongoose.Types.ObjectId(data.carrierId) : undefined,
            vehicleId: data.vehicleId && mongoose.Types.ObjectId.isValid(data.vehicleId) ? new mongoose.Types.ObjectId(data.vehicleId) : undefined,
            invoiceId: data.invoiceId && mongoose.Types.ObjectId.isValid(data.invoiceId) ? new mongoose.Types.ObjectId(data.invoiceId) : undefined,
            ordersCount,
            shippingCost: data.shippingCost,
            customerPrice: data.customerPrice,
            waybillNumber: data.waybillNumber ? data.waybillNumber.trim() : undefined,
            trackingNumber: data.trackingNumber ? data.trackingNumber.trim() : undefined,
            status: data.status || "created",
            deletedAt: null,
        });

        if (orderIds.length > 0) {
            const validOrderObjectIds = orderIds
                .filter((id) => mongoose.Types.ObjectId.isValid(id))
                .map((id) => new mongoose.Types.ObjectId(id));

            if (validOrderObjectIds.length > 0) {
                await Order.updateMany(
                    {
                        _id: { $in: validOrderObjectIds },
                        companyId: new mongoose.Types.ObjectId(activeCompanyId),
                        deletedAt: null,
                    },
                    {
                        $set: {
                            shipmentId: newShipment._id,
                            status: "grouped",
                        },
                    }
                );
            }
        }

        return NextResponse.json(
            { success: true, message: "تم إنشاء وتجميع الشحنة بنجاح", data: newShipment },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء إنشاء الشحنة",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
