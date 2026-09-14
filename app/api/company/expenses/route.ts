/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Expense from "@/models/expense";
import Company from "@/models/companies";
import { checkPlanFeature } from "@/lib/guards/checkPlanFeature";
import { createExpenseSchema } from "@/lib/validations/expense.schema";

// GET
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
                { success: false, message: "Unauthorized access: Viewing expenses is restricted to company accounts" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json(
                { success: false, message: "Invalid company ID" },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const query: any = {
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        };

        if (category && category.trim() !== "" && category !== "all") {
            query.category = category.trim();
        }

        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { title: regex },
                { category: regex },
                { receiptNumber: regex },
                { notes: regex },
            ];
        }

        if (startDate || endDate) {
            query.expenseDate = {};
            if (startDate) {
                query.expenseDate.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                if (endDate.length === 10) {
                    end.setHours(23, 59, 59, 999);
                }
                query.expenseDate.$lte = end;
            }
        }

        const skip = (page - 1) * limit;

        const [expenses, totalRecords, statsAgg] = await Promise.all([
            Expense.find(query).sort({ expenseDate: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
            Expense.countDocuments(query),
            Expense.aggregate([
                { $match: { companyId: new mongoose.Types.ObjectId(activeCompanyId), deletedAt: null } },
                { $group: { _id: null, totalSum: { $sum: "$amount" } } },
            ]),
        ]);

        const totalExpensesAmount = statsAgg.length > 0 ? statsAgg[0].totalSum : 0;
        const totalPages = Math.ceil(totalRecords / limit) || 1;

        return NextResponse.json(
            {
                success: true,
                data: expenses,
                pagination: {
                    page,
                    limit,
                    totalRecords,
                    totalPages,
                },
                stats: {
                    totalCount: totalRecords,
                    totalExpensesAmount,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred while fetching expenses", error: error.message },
            { status: 500 }
        );
    }
}

// POST
export async function POST(req: NextRequest) {
    try {
        await connectDB();

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
                { success: false, message: "Unauthorized access: Expense tracking is restricted to transport companies" },
                { status: 403 }
            );
        }

        if (userRole === "staff") {
            return NextResponse.json(
                { success: false, message: "Unauthorized access: Expense entry is disabled for staff accounts" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json(
                { success: false, message: "Invalid company ID" },
                { status: 400 }
            );
        }

        const company = await Company.findOne({
            _id: activeCompanyId,
            status: "active",
            deletedAt: null,
        });

        if (!company) {
            return NextResponse.json(
                { success: false, message: "Company account is inactive" },
                { status: 403 }
            );
        }

        const subCheck = await checkPlanFeature(activeCompanyId, "hasExpensesTracking");
        if (!subCheck.isAllowed) {
            return subCheck.response;
        }

        const body = await req.json();
        const validation = createExpenseSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Incomplete or invalid expense data",
                    errors: validation.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const expenseData = validation.data;

        const newExpense = await Expense.create({
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            title: expenseData.title,
            category: expenseData.category,
            amount: expenseData.amount,
            taxIncluded: expenseData.taxIncluded || false,
            taxAmount: expenseData.taxAmount || 0,
            expenseDate: expenseData.expenseDate ? new Date(expenseData.expenseDate) : new Date(),
            receiptNumber: expenseData.receiptNumber || undefined,
            notes: expenseData.notes || undefined,
            createdBy: new mongoose.Types.ObjectId(userId),
            deletedAt: null,
        });

        return NextResponse.json(
            { success: true, message: "Expense recorded successfully", data: newExpense },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred while adding expense", error: error.message },
            { status: 500 }
        );
    }
}
