/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { planCreateValidationSchema } from "@/lib/validations/plan.schema";
import Plan from "@/models/plan";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "company", "create")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "صيغة البيانات غير صالحة" }, { status: 400 });
        }

        const validation = planCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "بيانات غير صالحة",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const data = validation.data;
        await connectDB();

        const exists = await Plan.findOne({ name: data.name, ...ACTIVE }).lean();
        if (exists) {
            return NextResponse.json({ success: false, message: "اسم الباقة مستخدم بالفعل" }, { status: 409 });
        }

        const newPlan = await Plan.create(data);
        return NextResponse.json({ success: true, message: "تم إنشاء الباقة بنجاح", data: newPlan }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
