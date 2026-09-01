/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { companyUserCreateValidationSchema } from "@/lib/validations";
import CompanyUser from "@/models/Companyuser";
import Company from "@/models/companies";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
import mongoose from "mongoose";

// POST create company user
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "companyUser", "create")) {
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

        const validation = companyUserCreateValidationSchema.safeParse(body);

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

        if (!data.companyId || !mongoose.Types.ObjectId.isValid(data.companyId)) {
            return NextResponse.json(
                { success: false, message: "معرف الشركة غير صالح" },
                { status: 400 }
            );
        }

        await connectDB();

        const targetCompany = await Company.findOne({ _id: data.companyId, ...ACTIVE }).lean();
        if (!targetCompany) {
            return NextResponse.json(
                { success: false, message: "الشركة المرتبطة (Company) غير موجودة بالنظام" },
                { status: 400 }
            );
        }

        const normalizedEmail = data.userEmail.toLowerCase().trim();
        const userExists = await CompanyUser.findOne({ userEmail: normalizedEmail }).lean();

        if (userExists) {
            return NextResponse.json(
                { success: false, message: "البريد الإلكتروني مستخدم بالفعل لموظف آخر" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);

        const newUser = await CompanyUser.create({
            companyId: data.companyId,
            userName: data.userName,
            userEmail: normalizedEmail,
            password: hashedPassword,
            phone: data.phone,
            userRole: data.userRole || "staff",
            permissions: data.permissions || [],
            userIsActive: data.userIsActive ?? true,
            createdBy: (session?.user as any)?.id || data.companyId,
        });

        const safeUser = {
            id: newUser._id,
            companyId: newUser.companyId,
            userName: newUser.userName,
            userEmail: newUser.userEmail,
            phone: newUser.phone,
            userRole: newUser.userRole,
            permissions: newUser.permissions,
            userIsActive: newUser.userIsActive,
            createdAt: (newUser as any).createdAt,
        };

        return NextResponse.json(
            { success: true, message: "تم إنشاء حساب موظف الشركة بنجاح", data: safeUser },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}
