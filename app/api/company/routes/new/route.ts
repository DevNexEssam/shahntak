/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Route from "@/models/route";
import Company from "@/models/companies";
import { checkPlanFeature } from "@/lib/guards/checkPlanFeature";
import { routeCreateValidationSchema } from "@/lib/validations/route.schema";

// create route
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json({ success: false, message: "غير مصرح لك: إضافة المسارات مخصصة لحسابات الشركات فقط" }, { status: 403 });
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json({ success: false, message: "معرف الشركة غير صالح" }, { status: 400 });
        }

        const company = await Company.findOne({ _id: activeCompanyId, status: "active", deletedAt: null });
        if (!company) {
            return NextResponse.json({ success: false, message: "حساب الشركة غير نشط أو تم تعطيله" }, { status: 403 });
        }

        const subCheck = await checkPlanFeature(activeCompanyId, "hasCustomRoutes");
        if (!subCheck.isAllowed) {
            return subCheck.response;
        }

        const body = await req.json();
        body.companyId = activeCompanyId.toString();
        body.createdBy = userId.toString();

        const validation = routeCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: "بيانات الإدخال غير صالحة", errors: validation.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const data = validation.data;
        const cleanOrigin = data.origin.trim();
        const cleanDestination = data.destination.trim();
        const cleanVehicleType = data.vehicleType.trim();

        const existingRoute = await Route.findOne({
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            origin: cleanOrigin,
            destination: cleanDestination,
            vehicleType: cleanVehicleType,
            deletedAt: null,
        });

        if (existingRoute) {
            return NextResponse.json({ success: false, message: "هذا المسار بنوع المركبة المحدد مسجل بالفعل لشركتك" }, { status: 409 });
        }

        const newRoute = await Route.create({
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            origin: cleanOrigin,
            destination: cleanDestination,
            vehicleType: cleanVehicleType,
            basePrice: data.basePrice,
            carrierId: data.carrierId ? new mongoose.Types.ObjectId(data.carrierId) : undefined,
            estimatedTransitTime: data.estimatedTransitTime?.trim() || "",
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdBy: new mongoose.Types.ObjectId(userId),
            deletedAt: null,
        });

        return NextResponse.json({ success: true, message: "تم إضافة المسار اللوجستي بنجاح", data: newRoute }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم أثناء إضافة المسار", error: error.message }, { status: 500 });
    }
}
