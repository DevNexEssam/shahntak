/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { routeCreateValidationSchema } from "@/lib/validations";
import Route from "@/models/route";
import Carrier from "@/models/carrier";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "route", "create")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "صيغة البيانات غير صالحة" }, { status: 400 });
        }

        const validation = routeCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "بيانات غير صالحة",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        await connectDB();

        if (validation.data.carrierId && validation.data.carrierId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(validation.data.carrierId)) {
                return NextResponse.json({ success: false, message: "معرف الناقل (carrierId) غير صالح" }, { status: 400 });
            }
            const targetCarrier = await Carrier.findOne({ _id: validation.data.carrierId, ...ACTIVE }).lean();
            if (!targetCarrier) {
                return NextResponse.json({ success: false, message: "الناقل المرتبط (Carrier) غير موجود بالنظام" }, { status: 400 });
            }
        }
        const newRoute = await Route.create({
            origin: validation.data.origin,
            destination: validation.data.destination,
            vehicleType: validation.data.vehicleType,
            basePrice: validation.data.basePrice,
            carrierId: validation.data.carrierId || null,
            estimatedTransitTime: validation.data.estimatedTransitTime || "",
            isActive: validation.data.isActive ?? true,
        });

        return NextResponse.json({ success: true, message: "تم إضافة المسار بنجاح", data: newRoute }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
