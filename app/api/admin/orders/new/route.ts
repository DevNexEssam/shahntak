/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { orderCreateValidationSchema } from "@/lib/validations";
import Order from "@/models/order";
import Company from "@/models/companies";
import CompanyUser from "@/models/Companyuser";
import Shipment from "@/models/shipment";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
import mongoose from "mongoose";

// POST create new order
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "order", "create")) {
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

        const validation = orderCreateValidationSchema.safeParse(body);

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

        if (!mongoose.Types.ObjectId.isValid(data.companyId) || !mongoose.Types.ObjectId.isValid(data.createdByUserId)) {
            return NextResponse.json(
                { success: false, message: "معرف الشركة أو المنشئ غير صالح" },
                { status: 400 }
            );
        }

        await connectDB();

        const targetCompany = await Company.findOne({ _id: data.companyId, ...ACTIVE }).lean();
        if (!targetCompany) {
            return NextResponse.json({ success: false, message: "الشركة المرتبطة (Company) غير موجودة بالنظام" }, { status: 400 });
        }

        const targetUser = await CompanyUser.findOne({ _id: data.createdByUserId, ...ACTIVE }).lean();
        if (!targetUser) {
            return NextResponse.json({ success: false, message: "منشئ الطلب (CompanyUser) غير موجود بالنظام" }, { status: 400 });
        }

        if (data.shipmentId && data.shipmentId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(data.shipmentId)) {
                return NextResponse.json({ success: false, message: "معرف الشحنة (shipmentId) غير صالح" }, { status: 400 });
            }
            const targetShipment = await Shipment.findOne({ _id: data.shipmentId, ...ACTIVE }).lean();
            if (!targetShipment) {
                return NextResponse.json({ success: false, message: "الشحنة المرتبطة (Shipment) غير موجودة بالنظام" }, { status: 400 });
            }
        }

        const orderExists = await Order.findOne({ orderNumber: data.orderNumber }).lean();

        if (orderExists) {
            return NextResponse.json(
                { success: false, message: "رقم الطلب مستخدم بالفعل لطلب آخر" },
                { status: 409 }
            );
        }

        const newOrder = await Order.create({
            orderNumber: data.orderNumber,
            companyId: data.companyId,
            shipmentId: data.shipmentId || null,
            createdByUserId: data.createdByUserId,
            recipientName: data.recipientName,
            recipientPhone: data.recipientPhone,
            recipientCity: data.recipientCity,
            recipientDistrict: data.recipientDistrict || "",
            recipientAddress: data.recipientAddress,
            description: data.description || "",
            quantity: data.quantity || 1,
            weight: data.weight,
            orderValue: data.orderValue,
            codAmount: data.codAmount || 0,
            status: data.status || "pending",
            source: data.source || "manual",
        });

        return NextResponse.json(
            { success: true, message: "تم إنشاء الطلب بنجاح", data: newOrder },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}
