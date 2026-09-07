/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/order";
import Company from "@/models/companies";
import Subscription from "@/models/subscription";
import "@/models/plan";
import { orderCreateValidationSchema } from "@/lib/validations/order.schema";

// bulk create orders
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

        const body = await req.json();
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

        // Quota check
        const subscription = await Subscription.findOne({
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            status: "active",
            deletedAt: null,
        }).populate("planId");

        if (subscription && (subscription.planId as any)?.maxOrders) {
            const maxOrders = (subscription.planId as any).maxOrders;
            const currentOrdersCount = subscription.usedOrdersCount || 0;
            const remainingQuota = maxOrders - currentOrdersCount;

            if (remainingQuota < ordersInput.length) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `تجاوز حصة الباقة: المتبقي من حصة طلبات باقتك الشهرية هو ${Math.max(0, remainingQuota)} طلب فقط، والملف يحتوي على ${ordersInput.length} طلب.`,
                    },
                    { status: 403 }
                );
            }
        }

        // Collect explicit order numbers to check DB duplicates
        const explicitOrderNumbers = ordersInput
            .map((o: any) => o.orderNumber && String(o.orderNumber).trim())
            .filter(Boolean);

        const existingOrders = explicitOrderNumbers.length > 0
            ? await Order.find({ orderNumber: { $in: explicitOrderNumbers }, deletedAt: null }).select("orderNumber").lean()
            : [];
        const existingDBNumbersSet = new Set(existingOrders.map((o: any) => o.orderNumber));
        const seenBatchNumbersSet = new Set<string>();

        // Validate and format each item
        const validOrdersToInsert: any[] = [];
        const validationErrors: Array<{ index: number; errors: any }> = [];

        const totalExistingCount = await Order.countDocuments();
        let seqNumber = totalExistingCount + 1;

        for (let i = 0; i < ordersInput.length; i++) {
            const item = { ...ordersInput[i] };

            // Mandatory multi-tenant isolation injection
            item.companyId = activeCompanyId.toString();
            item.createdByUserId = userId.toString();
            item.createdByUserType = "company_user";
            item.source = "bulk_upload";

            const rawOrderNum = item.orderNumber && String(item.orderNumber).trim();

            // Check duplicates if custom number provided
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
                // Pass dummy orderNumber for Zod validation check
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

                // Assign sequential number (ORD-0001, ORD-0002, ...) for auto-generated items
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

        // Insert valid orders
        const createdOrders = await Order.insertMany(validOrdersToInsert);

        // Increment subscription used count if subscription exists
        if (subscription) {
            subscription.usedOrdersCount = (subscription.usedOrdersCount || 0) + createdOrders.length;
            await subscription.save();
        }

        return NextResponse.json(
            {
                success: true,
                message: `تم استيراد وإضافة ${createdOrders.length} طلب بنجاح إلى النظام`,
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
