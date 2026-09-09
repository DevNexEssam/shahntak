/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/order";
import Company from "@/models/companies";
import { checkCompanySubscription } from "@/lib/guards/checkCompanySubscription";
import { orderCreateValidationSchema } from "@/lib/validations/order.schema";

// create order
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
                { success: false, message: "غير مصرح لك: إضافة الطلبات مخصصة للشركات فقط" },
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

        if (!body.orderNumber || body.orderNumber.trim() === "") {
            const count = await Order.countDocuments();
            let seq = count + 1;
            let autoNum = `ORD-${String(seq).padStart(4, "0")}`;
            while (await Order.findOne({ orderNumber: autoNum }).lean()) {
                seq++;
                autoNum = `ORD-${String(seq).padStart(4, "0")}`;
            }
            body.orderNumber = autoNum;
        }

        body.companyId = activeCompanyId.toString();
        body.createdByUserId = userId.toString();
        body.createdByUserType = "company_user";

        const validation = orderCreateValidationSchema.safeParse(body);
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

        const existingOrder = await Order.findOne({
            orderNumber: data.orderNumber,
            deletedAt: null,
        });

        if (existingOrder) {
            return NextResponse.json(
                { success: false, message: "رقم الطلب مسجل بالفعل في النظام" },
                { status: 409 }
            );
        }

        const newOrder = await Order.create({
            orderNumber: data.orderNumber,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            createdByUserId: new mongoose.Types.ObjectId(userId),
            createdByUserType: "company_user",
            recipientName: data.recipientName.trim(),
            recipientPhone: data.recipientPhone.trim(),
            recipientCity: data.recipientCity.trim(),
            recipientDistrict: data.recipientDistrict ? data.recipientDistrict.trim() : undefined,
            recipientAddress: data.recipientAddress.trim(),
            description: data.description ? data.description.trim() : undefined,
            quantity: data.quantity ?? 1,
            weight: data.weight,
            orderValue: data.orderValue,
            codAmount: data.codAmount ?? 0,
            status: data.status || "pending",
            source: data.source || "manual",
            deletedAt: null,
        });

        return NextResponse.json(
            { success: true, message: "تم إنشاء الطلب بنجاح", data: newOrder },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء إنشاء الطلب",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
