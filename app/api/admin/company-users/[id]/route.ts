/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { companyUserUpdateValidationSchema } from "@/lib/validations";
import CompanyUser from "@/models/Companyuser";
import Company from "@/models/companies";
import { ACTIVE } from "@/utils/constants";
import { can } from "@/utils/permissions";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET single company user
export async function GET(_req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "companyUser", "read")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف المستخدم غير صالح" },
                { status: 400 }
            );
        }

        const user = await CompanyUser.findOne({ _id: id, ...ACTIVE })
            .select("-password")
            .populate("companyId", "companyName email");

        if (!user) {
            return NextResponse.json(
                { success: false, message: "الموظف غير موجود" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: user },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}

// PATCH update company user
export async function PATCH(req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "companyUser", "update")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف المستخدم غير صالح" },
                { status: 400 }
            );
        }

        let updates;
        try {
            updates = await req.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "صيغة البيانات غير صالحة" },
                { status: 400 }
            );
        }

        const validation = companyUserUpdateValidationSchema.safeParse(updates);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "بيانات غير صالحة",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const updatePayload: Record<string, any> = { ...validation.data };

        // Hash new password if provided
        if (updatePayload.password && updatePayload.password.trim() !== "") {
            updatePayload.password = await bcrypt.hash(updatePayload.password, 12);
        } else {
            delete updatePayload.password;
        }

        // Verify referential integrity for companyId if provided
        if (updatePayload.companyId && updatePayload.companyId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(updatePayload.companyId)) {
                return NextResponse.json(
                    { success: false, message: "معرف الشركة (companyId) غير صالح" },
                    { status: 400 }
                );
            }
            const targetCompany = await Company.findOne({ _id: updatePayload.companyId, ...ACTIVE }).lean();
            if (!targetCompany) {
                return NextResponse.json(
                    { success: false, message: "الشركة المرتبطة (Company) غير موجودة بالنظام" },
                    { status: 400 }
                );
            }
        }

        const updatedUser = await CompanyUser.findOneAndUpdate(
            { _id: id, ...ACTIVE },
            updatePayload,
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "الموظف غير موجود" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "تم تعديل بيانات الموظف بنجاح", data: updatedUser },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}

// DELETE company user
export async function DELETE(_req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        const canSoftDelete = role && can(role, "companyUser", "softDelete");
        const canHardDelete = role && can(role, "companyUser", "delete");

        if (!canSoftDelete && !canHardDelete) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف المستخدم غير صالح" },
                { status: 400 }
            );
        }

        let deletedUser;

        // Perform soft delete if permitted, otherwise hard delete
        if (canSoftDelete) {
            deletedUser = await CompanyUser.findOneAndUpdate(
                { _id: id, ...ACTIVE },
                { userIsActive: false, deletedAt: new Date() },
                { new: true }
            );
        } else {
            deletedUser = await CompanyUser.findByIdAndDelete(id);
        }

        if (!deletedUser) {
            return NextResponse.json(
                { success: false, message: "الموظف غير موجود أو تم حذفه سابقاً" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "تم حذف الموظف بنجاح" },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}
