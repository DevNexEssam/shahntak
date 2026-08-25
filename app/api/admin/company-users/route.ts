/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CompanyUser from "@/models/Companyuser";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";

// GET company users list
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        // if (!role || !can(role, "companyUser", "read")) {
        //     return NextResponse.json(
        //         { success: false, message: "غير مصرح لك بهذا الإجراء" },
        //         { status: 403 }
        //     );
        // }

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get("companyId");
        const noPagination = searchParams.get("nopagination") === "true";

        const filter: Record<string, any> = { ...ACTIVE };
        if (companyId) {
            filter.companyId = companyId;
        }

        if (noPagination) {
            const users = await CompanyUser.find(filter)
                .select("-password")
                .populate("companyId", "companyName email")
                .sort({ createdAt: -1 });

            return NextResponse.json(
                { success: true, data: users, count: users.length },
                { status: 200 }
            );
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const users = await CompanyUser.find(filter)
            .select("-password")
            .populate("companyId", "companyName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const activeCount = await CompanyUser.countDocuments({ ...filter, userIsActive: true });
        const inactiveCount = await CompanyUser.countDocuments({ ...filter, userIsActive: false });
        const total = await CompanyUser.countDocuments(filter);

        return NextResponse.json(
            {
                success: true,
                data: users,
                count: users.length,
                stats: { active: activeCount, inactive: inactiveCount, total },
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}
