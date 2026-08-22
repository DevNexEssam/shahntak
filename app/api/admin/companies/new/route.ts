/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { companyCreateValidationSchema } from "@/lib/validations";
import Company from "@/models/companies";
import { can } from "@/utils/permissions";

// POST - Create company
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "company", "create")) {
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
                { success: false, message: "صيغة البيانات المرسلة غير صالحة" },
                { status: 400 }
            );
        }

        const validation = companyCreateValidationSchema.safeParse(body);

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

        await connectDB();

        const normalizedEmail = data.email.toLowerCase().trim();
        const companyExists = await Company.findOne({
            $or: [{ email: normalizedEmail }, { phone: data.phone }],
        }).lean();

        if (companyExists) {
            return NextResponse.json(
                { success: false, message: "البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل لشركة أخرى" },
                { status: 409 }
            );
        }

        const rawPassword = data.password && data.password.trim() !== "" ? data.password : "123456";
        const hashedPassword = await bcrypt.hash(rawPassword, 12);

        const newCompany = await Company.create({
            companyName: data.companyName,
            email: normalizedEmail,
            password: hashedPassword,
            phone: data.phone,
            city: data.city,
            taxNumber: data.taxNumber || "",
            address: data.address || "",
            facilityInfo: data.facilityInfo || "",
            status: data.status || "active",
            approvedBy: (session.user as any)?.id,
            approvedAt: new Date(),
        });

        const safeCompany = {
            id: newCompany._id,
            companyName: newCompany.companyName,
            email: newCompany.email,
            phone: newCompany.phone,
            city: newCompany.city,
            taxNumber: newCompany.taxNumber,
            address: newCompany.address,
            facilityInfo: newCompany.facilityInfo,
            status: newCompany.status,
            createdAt: (newCompany as any).createdAt,
        };

        return NextResponse.json(
            { success: true, message: "تم إنشاء حساب الشركة بنجاح", data: safeCompany },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}
