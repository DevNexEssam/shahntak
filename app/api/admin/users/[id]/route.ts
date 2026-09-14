/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { userUpdateValidationSchema } from "@/lib/validations";
import User from "@/models/user";
import { ACTIVE } from "@/utils/constants";
import { can } from "@/utils/permissions";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET single user
export async function GET(_req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "user", "read")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid user ID" },
                { status: 400 }
            );
        }

        const user = await User.findOne({ _id: id, ...ACTIVE }).select("-password");

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: user },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred, please try again later", error: error.message },
            { status: 500 }
        );
    }
}

// PATCH update user
export async function PATCH(req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "user", "update")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid user ID" },
                { status: 400 }
            );
        }

        let updates;
        try {
            updates = await req.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid data format" },
                { status: 400 }
            );
        }

        const validation = userUpdateValidationSchema.safeParse(updates);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid data",
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

        const updatedUser = await User.findOneAndUpdate(
            { _id: id, ...ACTIVE },
            updatePayload,
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "User details updated successfully", data: updatedUser },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred, please try again later", error: error.message },
            { status: 500 }
        );
    }
}

// DELETE user
export async function DELETE(_req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        const canSoftDelete = role && can(role, "user", "softDelete");
        const canHardDelete = role && can(role, "user", "delete");

        if (!canSoftDelete && !canHardDelete) {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid user ID" },
                { status: 400 }
            );
        }

        let deletedUser;

        // Perform soft delete if permitted, otherwise hard delete
        if (canSoftDelete) {
            deletedUser = await User.findOneAndUpdate(
                { _id: id, ...ACTIVE },
                { status: "inactive", deletedAt: new Date() },
                { new: true }
            );
        } else {
            deletedUser = await User.findByIdAndDelete(id);
        }

        if (!deletedUser) {
            return NextResponse.json(
                { success: false, message: "User not found or already deleted" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "User deleted successfully" },
            { status: 200 }
        );

    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred, please try again later", error: error.message },
            { status: 500 }
        );
    }
}