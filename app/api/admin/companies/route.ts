/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/companies";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";

// GET - List companies
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "company", "read")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const noPagination = searchParams.get("nopagination") === "true";

        if (noPagination) {
            const companies = await Company.find(ACTIVE).select("-password").sort({ createdAt: -1 });
            return NextResponse.json(
                { success: true, data: companies, count: companies.length },
                { status: 200 }
            );
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const companies = await Company.find(ACTIVE)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const active = await Company.countDocuments({ ...ACTIVE, status: "active" });
        const inactive = await Company.countDocuments({ ...ACTIVE, status: "inactive" });
        const archived = await Company.countDocuments({ ...ACTIVE, status: "archived" });
        const banned = await Company.countDocuments({ ...ACTIVE, status: "banned" });
        const total = await Company.countDocuments(ACTIVE);

        const stats = {
            active,
            inactive,
            archived,
            banned,
            total,
        };

        return NextResponse.json(
            {
                success: true,
                data: companies,
                count: companies.length,
                stats,
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error, please try again later", error: error.message },
            { status: 500 }
        );
    }
}
