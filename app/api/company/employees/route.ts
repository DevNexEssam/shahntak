/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import CompanyUser from "@/models/Companyuser";
import Company from "@/models/companies";

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
                { success: false, message: "Unauthorized access: Viewing employees is restricted to company accounts" },
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
                { success: false, message: "Company account is inactive or disabled" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search")?.trim() || "";
        const noPagination = searchParams.get("nopagination") === "true";
        const statusFilter = searchParams.get("status");

        const filter: Record<string, any> = {
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        };

        if (statusFilter) {
            filter.status = statusFilter;
        }

        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: "i" } },
                { userEmail: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        if (noPagination) {
            const users = await CompanyUser.find(filter)
                .select("-password")
                .populate("companyId", "companyName email")
                .sort({ createdAt: -1 })
                .lean();

            return NextResponse.json(
                { success: true, data: users, count: users.length },
                { status: 200 }
            );
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const [users, total, activeCount, inactiveCount] = await Promise.all([
            CompanyUser.find(filter)
                .select("-password")
                .populate("companyId", "companyName email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            CompanyUser.countDocuments(filter),
            CompanyUser.countDocuments({ ...filter, userIsActive: true }),
            CompanyUser.countDocuments({ ...filter, userIsActive: false }),
        ]);

        return NextResponse.json(
            {
                success: true,
                data: users,
                count: users.length,
                stats: {
                    active: activeCount,
                    inactive: inactiveCount,
                    total,
                },
                pagination: {
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    totalRecords: total,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error occurred while fetching employees list",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
