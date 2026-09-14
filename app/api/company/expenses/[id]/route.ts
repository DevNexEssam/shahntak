/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Expense from "@/models/expense";
import { updateExpenseSchema } from "@/lib/validations/expense.schema";

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await context.params;

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        const { role, userRole, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "Unauthorized access: Modifying expenses is restricted to transport companies" },
                { status: 403 }
            );
        }

        if (userRole === "staff") {
            return NextResponse.json(
                { success: false, message: "Unauthorized access: Expense modification is disabled for staff accounts" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json(
                { success: false, message: "Invalid expense or company ID" },
                { status: 400 }
            );
        }

        const existingExpense = await Expense.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!existingExpense) {
            return NextResponse.json(
                { success: false, message: "The specified expense was not found or has been deleted" },
                { status: 404 }
            );
        }

        const body = await req.json();
        const validation = updateExpenseSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid update data",
                    errors: validation.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const updateData = validation.data;

        if (updateData.title !== undefined) existingExpense.title = updateData.title;
        if (updateData.category !== undefined) existingExpense.category = updateData.category;
        if (updateData.amount !== undefined) existingExpense.amount = updateData.amount;
        if (updateData.taxIncluded !== undefined) existingExpense.taxIncluded = updateData.taxIncluded;
        if (updateData.taxAmount !== undefined) existingExpense.taxAmount = updateData.taxAmount;
        if (updateData.expenseDate !== undefined) existingExpense.expenseDate = new Date(updateData.expenseDate);
        if (updateData.receiptNumber !== undefined) existingExpense.receiptNumber = updateData.receiptNumber;
        if (updateData.notes !== undefined) existingExpense.notes = updateData.notes;

        await existingExpense.save();

        return NextResponse.json(
            { success: true, message: "Expense updated successfully", data: existingExpense },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred while updating expense", error: error.message },
            { status: 500 }
        );
    }
}

// DELETE
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await context.params;

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        const { role, userRole, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "Unauthorized access: Deleting expenses is restricted to transport companies" },
                { status: 403 }
            );
        }

        if (userRole === "staff") {
            return NextResponse.json(
                { success: false, message: "Unauthorized access: Expense deletion is disabled for staff accounts" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json(
                { success: false, message: "Invalid expense ID" },
                { status: 400 }
            );
        }

        const existingExpense = await Expense.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!existingExpense) {
            return NextResponse.json(
                { success: false, message: "The specified expense was not found or was previously deleted" },
                { status: 404 }
            );
        }

        existingExpense.deletedAt = new Date();
        await existingExpense.save();

        return NextResponse.json(
            { success: true, message: "Expense deleted successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred while deleting expense", error: error.message },
            { status: 500 }
        );
    }
}
