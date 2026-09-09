/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import CompanyUser from "@/models/Companyuser";
import Company from "@/models/companies";
import { checkCompanySubscription } from "@/lib/guards/checkCompanySubscription";
import { companyUserCreateValidationSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        // Check auth session
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "يجب تسجيل الدخول أولاً" },
                { status: 401 }
            );
        }

        const { role, companyId, id: userId } = session.user as any;

        // Verify company role
        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك: إضافة الموظفين مخصصة لحسابات الشركات فقط" },
                { status: 403 }
            );
        }

        // Validate company ID
        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json(
                { success: false, message: "معرف الشركة غير صالح" },
                { status: 400 }
            );
        }

        // Check active company
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

        // Assign session IDs
        body.companyId = activeCompanyId.toString();
        body.createdBy = userId.toString();

        // Validate payload
        const validation = companyUserCreateValidationSchema.safeParse(body);
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
        const normalizedEmail = data.userEmail.toLowerCase().trim();
        const cleanPhone = data.phone.trim();

        // Check duplicate employee
        const existingEmployee = await CompanyUser.findOne({
            $or: [{ userEmail: normalizedEmail }, { phone: cleanPhone }],
            deletedAt: null,
        });

        if (existingEmployee) {
            const isEmailTaken = existingEmployee.userEmail === normalizedEmail;
            return NextResponse.json(
                {
                    success: false,
                    message: isEmailTaken
                        ? "البريد الإلكتروني مسجل بالفعل لموظف آخر"
                        : "رقم الهاتف مسجل بالفعل لموظف آخر",
                },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create employee
        const newEmployee = await CompanyUser.create({
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            userName: data.userName.trim(),
            userEmail: normalizedEmail,
            phone: cleanPhone,
            password: hashedPassword,
            userRole: data.userRole || "staff",
            status: "active",
            permissions: data.permissions || [],
            userIsActive: data.userIsActive !== undefined ? data.userIsActive : true,
            createdBy: new mongoose.Types.ObjectId(userId),
            createdByType: "company",
            deletedAt: null,
        });

        const employeeResponse = newEmployee.toObject();
        delete employeeResponse.password;

        return NextResponse.json(
            {
                success: true,
                message: "تم إنشاء حساب الموظف بنجاح",
                employee: employeeResponse,
            },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء إنشاء الموظف",
                error: error.message,
            },
            { status: 500 }
        );
    }
}