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
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";

// POST bulk create orders for admin on behalf of selected company
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        const role = (session?.user as any)?.role;
        const sessionUserId = (session?.user as any)?.id || (session?.user as any)?._id;

        if (!role || !can(role, "order", "create")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const targetCompanyId = body.companyId;

        if (!targetCompanyId || !mongoose.Types.ObjectId.isValid(targetCompanyId)) {
            return NextResponse.json(
                { success: false, message: "يجب اختيار وتمرير معرف شركة صالح (companyId)" },
                { status: 400 }
            );
        }

        const company = await Company.findOne({
            _id: targetCompanyId,
            ...ACTIVE,
        });

        if (!company) {
            return NextResponse.json(
                { success: false, message: "الشركة المحددة غير موجودة بالنظام أو معطلة" },
                { status: 404 }
            );
        }

        const ordersInput = Array.isArray(body.orders) ? body.orders : [];

        if (ordersInput.length === 0) {
            return NextResponse.json(
                { success: false, message: "لم يتم تمرير أي طلبات للاستيراد" },
                { status: 400 }
            );
        }

        if (ordersInput.length > 500) {
            return NextResponse.json(
                { success: false, message: "حد الأقصى هو 500 طلب في الملف الواحد لتجنب إجهاد الخادم" },
                { status: 400 }
            );
        }

        // Quota check using centralized subscription guard for target company
        const subCheck = await checkCompanySubscription(targetCompanyId, {
            checkQuotaFor: "order",
            count: ordersInput.length,
        });
        if (!subCheck.isAllowed) {
            return subCheck.response;
        }

        const explicitOrderNumbers = ordersInput
            .map((o: any) => o.orderNumber && String(o.orderNumber).trim())
            .filter(Boolean);

        const existingOrders = explicitOrderNumbers.length > 0
            ? await Order.find({ orderNumber: { $in: explicitOrderNumbers }, deletedAt: null }).select("orderNumber").lean()
            : [];
        const existingDBNumbersSet = new Set(existingOrders.map((o: any) => o.orderNumber));
        const seenBatchNumbersSet = new Set<string>();

        const validOrdersToInsert: any[] = [];
        const validationErrors: Array<{ index: number; errors: any }> = [];

        const totalExistingCount = await Order.countDocuments();
        let seqNumber = totalExistingCount + 1;

        for (let i = 0; i < ordersInput.length; i++) {
            const item = { ...ordersInput[i] };

            item.companyId = targetCompanyId.toString();
            item.createdByUserId = sessionUserId ? sessionUserId.toString() : targetCompanyId.toString();
            item.createdByUserType = "user";
            item.source = "bulk_upload";

            const rawOrderNum = item.orderNumber && String(item.orderNumber).trim();

            if (rawOrderNum) {
                if (seenBatchNumbersSet.has(rawOrderNum)) {
                    validationErrors.push({
                        index: i,
                        errors: { orderNumber: ["رقم الطلب مكرر أكثر من مرة في نفس الملف"] },
                    });
                    continue;
                }
                if (existingDBNumbersSet.has(rawOrderNum)) {
                    validationErrors.push({
                        index: i,
                        errors: { orderNumber: ["رقم الطلب مسجل بالفعل في قاعدة البيانات سابقاً"] },
                    });
                    continue;
                }
                item.orderNumber = rawOrderNum;
            } else {
                item.orderNumber = "ORD-TEMP-VALIDATION";
            }

            const validation = orderCreateValidationSchema.safeParse(item);
            if (!validation.success) {
                validationErrors.push({
                    index: i,
                    errors: validation.error.flatten().fieldErrors,
                });
            } else {
                const data = validation.data;
                let finalOrderNum = rawOrderNum;

                if (!finalOrderNum) {
                    let autoNum = `ORD-${String(seqNumber).padStart(4, "0")}`;
                    while (await Order.findOne({ orderNumber: autoNum }).lean() || seenBatchNumbersSet.has(autoNum)) {
                        seqNumber++;
                        autoNum = `ORD-${String(seqNumber).padStart(4, "0")}`;
                    }
                    finalOrderNum = autoNum;
                    seqNumber++;
                }

                seenBatchNumbersSet.add(finalOrderNum);

                validOrdersToInsert.push({
                    orderNumber: finalOrderNum,
                    companyId: new mongoose.Types.ObjectId(targetCompanyId),
                    createdByUserId: new mongoose.Types.ObjectId(sessionUserId || targetCompanyId),
                    createdByUserType: "user",
                    recipientName: data.recipientName.trim(),
                    recipientPhone: data.recipientPhone.trim(),
                    recipientCity: data.recipientCity.trim(),
                    recipientDistrict: data.recipientDistrict ? data.recipientDistrict.trim() : undefined,
                    recipientAddress: data.recipientAddress.trim(),
                    description: data.description ? data.description.trim() : undefined,
                    quantity: data.quantity ?? 1,
                    weight: Number(data.weight),
                    orderValue: Number(data.orderValue),
                    codAmount: Number(data.codAmount ?? 0),
                    status: data.status || "pending",
                    source: "bulk_upload",
                    deletedAt: null,
                });
            }
        }

        if (validationErrors.length > 0 && validOrdersToInsert.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "جميع الطلبات الممررة تحتوي على أخطاء ولا يمكن استيرادها",
                    errors: validationErrors,
                },
                { status: 422 }
            );
        }

        const createdOrders = await Order.insertMany(validOrdersToInsert);

        if (subCheck.subscription) {
            subCheck.subscription.ordersUsedThisMonth = (subCheck.subscription.ordersUsedThisMonth || 0) + createdOrders.length;
            await subCheck.subscription.save();
        }

        return NextResponse.json(
            {
                success: true,
                message: `تم استيراد وإضافة ${createdOrders.length} طلب بنجاح للشركة المحددة (${company.companyName})`,
                count: createdOrders.length,
                data: createdOrders,
            },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء الاستيراد الجماعي للطلبات",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
