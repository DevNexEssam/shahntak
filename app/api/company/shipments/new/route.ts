/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Shipment from "@/models/shipment";
import Order from "@/models/order";
import Company from "@/models/companies";
import Invoice from "@/models/invoice";
import Route from "@/models/route";
import { checkCompanySubscription } from "@/lib/guards/checkCompanySubscription";
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

        const subCheck = await checkCompanySubscription(activeCompanyId);
        if (!subCheck.isAllowed) {
            return subCheck.response;
        }

        const body = await req.json();

        // Field Aliases & Fallbacks
        if (body.shipmentType && !body.type) body.type = body.shipmentType;
        if (body.originCity && !body.origin) body.origin = body.originCity;
        if (body.destinationCity && !body.destination) body.destination = body.destinationCity;
        if (body.status === "pending" || !body.status) body.status = "created";

        if (!body.shipmentNumber || body.shipmentNumber.trim() === "") {
            body.shipmentNumber = `SHP-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        if (!body.trackingNumber || body.trackingNumber.trim() === "") {
            body.trackingNumber = `TRK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        body.companyId = activeCompanyId.toString();

        // Auto-calculate shippingCost & customerPrice from Route & Linked Orders
        let routeBasePrice = 0;
        if (body.routeId && mongoose.Types.ObjectId.isValid(body.routeId)) {
            const routeObj = await Route.findOne({
                _id: body.routeId,
                companyId: new mongoose.Types.ObjectId(activeCompanyId),
                deletedAt: null,
            });
            if (routeObj) {
                routeBasePrice = Number(routeObj.basePrice || 0);
                if (!body.origin || body.origin.trim() === "") body.origin = routeObj.origin;
                if (!body.destination || body.destination.trim() === "") body.destination = routeObj.destination;
            }
        }

        const orderIds = body.orderIds || [];
        let ordersValueSum = 0;
        const validOrderObjectIds: mongoose.Types.ObjectId[] = [];

        if (Array.isArray(orderIds) && orderIds.length > 0) {
            orderIds.forEach((id: string) => {
                if (mongoose.Types.ObjectId.isValid(id)) {
                    validOrderObjectIds.push(new mongoose.Types.ObjectId(id));
                }
            });

            if (validOrderObjectIds.length > 0) {
                const linkedOrders = await Order.find({
                    _id: { $in: validOrderObjectIds },
                    companyId: new mongoose.Types.ObjectId(activeCompanyId),
                    deletedAt: null,
                }).lean();

                ordersValueSum = linkedOrders.reduce(
                    (sum: number, ord: any) => sum + (Number(ord.orderValue) || Number(ord.codAmount) || 0),
                    0
                );
            }
        }

        // Force exact calculation logic
        body.shippingCost = routeBasePrice;
        body.customerPrice = ordersValueSum + routeBasePrice;

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

        const ordersCount = validOrderObjectIds.length > 0 ? validOrderObjectIds.length : (data.ordersCount || 0);

        let invoiceIdToAssign = data.invoiceId && mongoose.Types.ObjectId.isValid(data.invoiceId) ? new mongoose.Types.ObjectId(data.invoiceId) : undefined;

        if (!invoiceIdToAssign) {
            const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
            const subtotal = data.customerPrice;
            const vatRate = company.vatRate !== undefined ? Number(company.vatRate) : 15;
            const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
            const total = Math.round((subtotal + vatAmount) * 100) / 100;

            const newInvoice = await Invoice.create({
                invoiceNumber,
                companyId: new mongoose.Types.ObjectId(activeCompanyId),
                subtotal,
                vatAmount,
                taxRateSnapshot: vatRate,
                total,
                status: data.status === "delivered" ? "paid" : "issued",
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                deletedAt: null,
            });
            invoiceIdToAssign = newInvoice._id;
        }

        const newShipment = await Shipment.create({
            shipmentNumber: data.shipmentNumber,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            type: data.type || "ftl",
            origin: data.origin.trim(),
            destination: data.destination.trim(),
            routeId: data.routeId && mongoose.Types.ObjectId.isValid(data.routeId) ? new mongoose.Types.ObjectId(data.routeId) : undefined,
            carrierId: data.carrierId && mongoose.Types.ObjectId.isValid(data.carrierId) ? new mongoose.Types.ObjectId(data.carrierId) : undefined,
            vehicleId: data.vehicleId && mongoose.Types.ObjectId.isValid(data.vehicleId) ? new mongoose.Types.ObjectId(data.vehicleId) : undefined,
            invoiceId: invoiceIdToAssign,
            ordersCount,
            shippingCost: data.shippingCost,
            customerPrice: data.customerPrice,
            waybillNumber: data.waybillNumber ? data.waybillNumber.trim() : undefined,
            trackingNumber: data.trackingNumber ? data.trackingNumber.trim() : undefined,
            status: data.status || "created",
            deletedAt: null,
        });

        if (validOrderObjectIds.length > 0) {
            // update linked orders
            await Order.updateMany(
                {
                    _id: { $in: validOrderObjectIds },
                    companyId: new mongoose.Types.ObjectId(activeCompanyId),
                    status: { $in: ["pending", "validated", "error"] },
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
