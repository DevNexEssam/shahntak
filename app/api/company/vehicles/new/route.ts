/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Vehicle from "@/models/vehicle";
import Company from "@/models/companies";
import { vehicleCreateValidationSchema } from "@/lib/validations/vehicle.schema";

// create vehicle
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
                { success: false, message: "غير مصرح لك: إضافة المركبات مخصصة للشركات فقط" },
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

        body.companyId = activeCompanyId.toString();
        body.createdBy = userId.toString();

        const validation = vehicleCreateValidationSchema.safeParse(body);
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

        const newVehicle = await Vehicle.create({
            type: data.type.trim(),
            capacityWeight: data.capacityWeight,
            capacityVolume: data.capacityVolume,
            isActive: data.isActive ?? true,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            createdBy: new mongoose.Types.ObjectId(userId),
            deletedAt: null,
        });

        return NextResponse.json(
            { success: true, message: "تمت إضافة المركبة بنجاح", data: newVehicle },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء إضافة المركبة",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
