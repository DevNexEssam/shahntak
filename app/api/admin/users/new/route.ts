/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { userCreateValidationSchema } from "@/lib/validations";
import User from "@/models/user";
import { can } from "@/utils/permissions";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "user", "create")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        let body;
        try {
            body = await req.json();
        } catch (error) {
            console.error("[CREATE_USER_ERROR]", error);
            return NextResponse.json(
                { success: false, message: "صيغة البيانات المرسلة غير صالحة" },
                { status: 400 }
            );
        }

        const validation = userCreateValidationSchema.safeParse(body);

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
        const adminExists = await User.findOne({ email: normalizedEmail }).lean();

        if (adminExists) {
            return NextResponse.json(
                { success: false, message: "البريد الإلكتروني مستخدم بالفعل" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);

        const newUser = await User.create({
            name: data.name,
            email: normalizedEmail,
            phone: data.phone,
            password: hashedPassword,
            role: data.role,
            status: data.status,
            createdBy: (session.user as any).id,
        });

        const safeUser = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
            status: newUser.status,
            createdAt: (newUser as any).createdAt
        };

        return NextResponse.json(
            { success: true, message: "تم إنشاء حساب المستخدم بنجاح", user: safeUser },
            { status: 201 }
        );

    } catch (error) {
        console.error("[CREATE_USER_ERROR]", error);
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً" },
            { status: 500 }
        );
    }
}