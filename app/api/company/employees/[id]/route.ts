/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import CompanyUser from "@/models/Companyuser";
import { companyUserUpdateValidationSchema } from "@/lib/validations/companyUser.schema";

// get employee
export async function GET(req: NextRequest) {
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
                { success: false, message: "غير مصرح لك" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        const { pathname } = new URL(req.url);
        const id = pathname.split("/").pop();

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الموظف غير صالح" },
                { status: 400 }
            );
        }

        const employee = await CompanyUser.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        })
            .select("-password")
            .populate("companyId", "companyName email")
            .lean();

        if (!employee) {
            return NextResponse.json(
                { success: false, message: "لم يتم العثور على الموظف" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: employee }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم أثناء جلب الموظف", error: error.message },
            { status: 500 }
        );
    }
}

// update employee
export async function PUT(req: NextRequest) {
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
                { success: false, message: "غير مصرح لك" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        const { pathname } = new URL(req.url);
        const id = pathname.split("/").pop();

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الموظف غير صالح" },
                { status: 400 }
            );
        }

        const employee = await CompanyUser.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!employee) {
            return NextResponse.json(
                { success: false, message: "لم يتم العثور على الموظف أو لا تملك صلاحية التعديل عليه" },
                { status: 404 }
            );
        }

        const body = await req.json();

        delete body.companyId;
        delete body._id;
        delete body.createdBy;

        const validation = companyUserUpdateValidationSchema.safeParse(body);
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

        const updateData = { ...validation.data } as Record<string, any>;

        if (updateData.userEmail || updateData.phone) {
            const normalizedEmail = updateData.userEmail ? updateData.userEmail.toLowerCase().trim() : undefined;
            const cleanPhone = updateData.phone ? updateData.phone.trim() : undefined;

            const existingEmployee = await CompanyUser.findOne({
                _id: { $ne: id },
                deletedAt: null,
                $or: [
                    ...(normalizedEmail ? [{ userEmail: normalizedEmail }] : []),
                    ...(cleanPhone ? [{ phone: cleanPhone }] : []),
                ],
            });

            if (existingEmployee) {
                const isEmailTaken = normalizedEmail && existingEmployee.userEmail === normalizedEmail;
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

            if (normalizedEmail) updateData.userEmail = normalizedEmail;
            if (cleanPhone) updateData.phone = cleanPhone;
        }

        if (updateData.password && updateData.password.trim() !== "") {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        } else {
            delete updateData.password;
        }

        const updatedEmployee = await CompanyUser.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        return NextResponse.json(
            { success: true, message: "تم تحديث بيانات الموظف بنجاح", data: updatedEmployee },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء تحديث بيانات الموظف",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// delete employee
export async function DELETE(req: NextRequest) {
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
                { success: false, message: "غير مصرح لك" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        const { searchParams, pathname } = new URL(req.url);
        const id = pathname.split("/").pop();
        const isHardDelete = searchParams.get("hard") === "true";

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الموظف غير صالح" },
                { status: 400 }
            );
        }

        const employee = await CompanyUser.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
        });

        if (!employee) {
            return NextResponse.json(
                { success: false, message: "لم يتم العثور على الموظف المراد حذفه" },
                { status: 404 }
            );
        }

        if (isHardDelete) {
            await CompanyUser.deleteOne({ _id: id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            return NextResponse.json(
                { success: true, message: "تم حذف حساب الموظف نهائياً من النظام" },
                { status: 200 }
            );
        } else {
            employee.deletedAt = new Date();
            employee.userIsActive = false;
            await employee.save();
            return NextResponse.json(
                { success: true, message: "تمت أرشفة وتجميد حساب الموظف بنجاح" },
                { status: 200 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء حذف الموظف",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
