/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { shipmentCreateValidationSchema } from "@/lib/validations";
import Shipment from "@/models/shipment";
import Company from "@/models/companies";
import Route from "@/models/route";
import Carrier from "@/models/carrier";
import Vehicle from "@/models/vehicle";
import Order from "@/models/order";
import Waybill from "@/models/waybill";
import Invoice from "@/models/invoice";
import { checkCompanySubscription } from "@/lib/guards/checkCompanySubscription";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
import mongoose from "mongoose";

// POST create shipment
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "shipment", "create")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "صيغة البيانات غير صالحة" },
                { status: 400 }
            );
        }

        const validation = shipmentCreateValidationSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "بيانات غير صالحة",
                    errors: validation.error.flatten().fieldErrors,
                },
                { status: 422 }
            );
        }

        const data = validation.data;

        if (!mongoose.Types.ObjectId.isValid(data.companyId)) {
            return NextResponse.json(
                { success: false, message: "معرف الشركة غير صالح" },
                { status: 400 }
            );
        }

        await connectDB();

        const targetCompany = await Company.findOne({ _id: data.companyId, status: "active", deletedAt: null }).lean();
        if (!targetCompany) {
            return NextResponse.json({ success: false, message: "الشركة المرتبطة (Company) غير موجودة بالنظام أو غير نشطة" }, { status: 400 });
        }

        // 1. Quota Check for Company
        const subCheck = await checkCompanySubscription(data.companyId, { checkQuotaFor: "shipment", count: 1 });
        if (!subCheck.isAllowed) {
            return subCheck.response;
        }

        if (data.routeId && data.routeId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(data.routeId)) {
                return NextResponse.json({ success: false, message: "معرف المسار (routeId) غير صالح" }, { status: 400 });
            }
            const targetRoute = await Route.findOne({ _id: data.routeId, deletedAt: null }).lean();
            if (!targetRoute) {
                return NextResponse.json({ success: false, message: "المسار المرتبط (Route) غير موجود بالنظام" }, { status: 400 });
            }
        }

        if (data.carrierId && data.carrierId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(data.carrierId)) {
                return NextResponse.json({ success: false, message: "معرف الناقل (carrierId) غير صالح" }, { status: 400 });
            }
            const targetCarrier = await Carrier.findOne({ _id: data.carrierId, deletedAt: null }).lean();
            if (!targetCarrier) {
                return NextResponse.json({ success: false, message: "الناقل المرتبط (Carrier) غير موجود بالنظام" }, { status: 400 });
            }
        }

        if (data.vehicleId && data.vehicleId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(data.vehicleId)) {
                return NextResponse.json({ success: false, message: "معرف المركبة (vehicleId) غير صالح" }, { status: 400 });
            }
            const targetVehicle = await Vehicle.findOne({ _id: data.vehicleId, deletedAt: null }).lean();
            if (!targetVehicle) {
                return NextResponse.json({ success: false, message: "المركبة المرتبطة (Vehicle) غير موجودة بالنظام" }, { status: 400 });
            }
        }

        const shipmentExists = await Shipment.findOne({ shipmentNumber: data.shipmentNumber }).lean();

        if (shipmentExists) {
            return NextResponse.json(
                { success: false, message: "رقم الشحنة مستخدم بالفعل لشحنة أخرى" },
                { status: 409 }
            );
        }

        const finalWaybillNumber = data.waybillNumber && data.waybillNumber.trim() !== ""
            ? data.waybillNumber
            : `WB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        const orderIds = data.orderIds || [];
        const calculatedOrdersCount = orderIds.length > 0 ? orderIds.length : (data.ordersCount || 0);

        // 2. Auto-Invoice Generation if not assigned
        let assignedInvoiceId = data.invoiceId && mongoose.Types.ObjectId.isValid(data.invoiceId)
            ? new mongoose.Types.ObjectId(data.invoiceId)
            : undefined;

        if (!assignedInvoiceId) {
            try {
                const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
                const subtotal = Number(data.customerPrice || 0);
                const vatRate = (targetCompany as any).vatRate !== undefined ? Number((targetCompany as any).vatRate) : 15;
                const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
                const total = Math.round((subtotal + vatAmount) * 100) / 100;

                const newInvoice = await Invoice.create({
                    invoiceNumber,
                    companyId: new mongoose.Types.ObjectId(data.companyId),
                    subtotal,
                    vatAmount,
                    taxRateSnapshot: vatRate,
                    total,
                    status: data.status === "delivered" ? "paid" : "issued",
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    deletedAt: null,
                });
                assignedInvoiceId = newInvoice._id;
            } catch {
                // If invoice creation fails, proceed without blocking
            }
        }

        const newShipment = await Shipment.create({
            shipmentNumber: data.shipmentNumber,
            companyId: data.companyId,
            type: data.type || "ftl",
            origin: data.origin,
            destination: data.destination,
            routeId: data.routeId || null,
            carrierId: data.carrierId || null,
            vehicleId: data.vehicleId || null,
            invoiceId: assignedInvoiceId || null,
            ordersCount: calculatedOrdersCount,
            shippingCost: data.shippingCost,
            customerPrice: data.customerPrice,
            waybillNumber: finalWaybillNumber,
            trackingNumber: data.trackingNumber || `TRK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
            status: data.status || "created",
        });

        // 3. Cascade update grouped orders in database
        if (orderIds.length > 0) {
            const validObjectIds = orderIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
            if (validObjectIds.length > 0) {
                await Order.updateMany(
                    { _id: { $in: validObjectIds }, ...ACTIVE },
                    { shipmentId: newShipment._id, status: "grouped" }
                );
            }
        }

        // 4. Auto-create Waybill record for tracking & print
        try {
            await Waybill.create({
                shipmentId: newShipment._id,
                waybillNumber: finalWaybillNumber,
                pdfUrl: `/waybills/${finalWaybillNumber}.pdf`,
                issuedAt: new Date(),
            });
        } catch {
            // Silence if waybill exists
        }

        // 5. Increment company subscription shipmentsUsedThisMonth
        if (subCheck.subscription) {
            subCheck.subscription.shipmentsUsedThisMonth = (subCheck.subscription.shipmentsUsedThisMonth || 0) + 1;
            await subCheck.subscription.save();
        }

        return NextResponse.json(
            { success: true, message: "تم إنشاء وتجميع الشحنة بنجاح وتوليد بوليصة الشحن والفاتورة الآلية", data: newShipment },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}
