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
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        const { pathname } = new URL(req.url);
        const id = pathname.split("/").pop();

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid employee ID" },
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
                { success: false, message: "Employee not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: employee }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred while fetching employee", error: error.message },
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
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        const { pathname } = new URL(req.url);
        const id = pathname.split("/").pop();

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid employee ID" },
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
                { success: false, message: "Employee not found or you do not have permission to update this record" },
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
                    message: "Invalid input data",
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
                            ? "Email is already registered for another employee"
                            : "Phone number is already registered for another employee",
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
            { success: true, message: "Employee updated successfully", data: updatedEmployee },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error occurred while updating employee",
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
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        const { searchParams, pathname } = new URL(req.url);
        const id = pathname.split("/").pop();
        const isHardDelete = searchParams.get("hard") === "true";

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid employee ID" },
                { status: 400 }
            );
        }

        const employee = await CompanyUser.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
        });

        if (!employee) {
            return NextResponse.json(
                { success: false, message: "Employee to delete not found" },
                { status: 404 }
            );
        }

        if (isHardDelete) {
            await CompanyUser.deleteOne({ _id: id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            return NextResponse.json(
                { success: true, message: "Employee account permanently deleted from system" },
                { status: 200 }
            );
        } else {
            employee.deletedAt = new Date();
            employee.userIsActive = false;
            await employee.save();
            return NextResponse.json(
                { success: true, message: "Employee account successfully archived and deactivated" },
                { status: 200 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error occurred while deleting employee",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
