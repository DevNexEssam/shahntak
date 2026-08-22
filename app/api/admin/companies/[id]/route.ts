/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { updateCompanyValidationSchema } from "@/lib/validations";
import Company from "@/models/companies";
import User from "@/models/user";
import { ACTIVE } from "@/utils/constants";
import { can } from "@/utils/permissions";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET single company
export async function GET(_req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "company", "read")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الشركة غير صالح" },
                { status: 400 }
            );
        }

        const company = await Company.findOne({ _id: id, ...ACTIVE }).select("-password");

        if (!company) {
            return NextResponse.json(
                { success: false, message: "الشركة غير موجودة" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: company },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}

// PATCH update company
export async function PATCH(req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "company", "update")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الشركة غير صالح" },
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

        const validation = updateCompanyValidationSchema.safeParse(updates);

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

        // Verify referential integrity for approvedBy if provided
        if (updatePayload.approvedBy && updatePayload.approvedBy.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(updatePayload.approvedBy)) {
                return NextResponse.json(
                    { success: false, message: "معرف مسؤول الاعتماد (approvedBy) غير صالح" },
                    { status: 400 }
                );
            }

            const approverExists = await User.findOne({ _id: updatePayload.approvedBy, ...ACTIVE }).lean();
            if (!approverExists) {
                return NextResponse.json(
                    { success: false, message: "مسؤول الاعتماد المحنط (User) غير موجود بالنظام" },
                    { status: 400 }
                );
            }

            if (!updatePayload.approvedAt) {
                updatePayload.approvedAt = new Date();
            }
        }

        const updatedCompany = await Company.findOneAndUpdate(
            { _id: id, ...ACTIVE },
            updatePayload,
            { new: true }
        ).select("-password");

        if (!updatedCompany) {
            return NextResponse.json(
                { success: false, message: "الشركة غير موجودة" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "تم تعديل بيانات الشركة بنجاح", data: updatedCompany },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}

// DELETE company
export async function DELETE(_req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        const canSoftDelete = role && can(role, "company", "softDelete");
        const canHardDelete = role && can(role, "company", "delete");

        if (!canSoftDelete && !canHardDelete) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف الشركة غير صالح" },
                { status: 400 }
            );
        }

        let deletedCompany;

        // Perform soft delete if permitted, otherwise hard delete
        if (canSoftDelete) {
            deletedCompany = await Company.findOneAndUpdate(
                { _id: id, ...ACTIVE },
                { status: "archived", deletedAt: new Date() },
                { new: true }
            );
        } else {
            deletedCompany = await Company.findByIdAndDelete(id);
        }

        if (!deletedCompany) {
            return NextResponse.json(
                { success: false, message: "الشركة غير موجودة أو تم حذفها سابقاً" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "تم أرشفة وحذف الشركة بنجاح" },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}
