/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "user", "read")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const noPagination = searchParams.get("nopagination") === "true";

        if (noPagination) {
            const users = await User.find(ACTIVE).select("-password").sort({ createdAt: -1 });
            return NextResponse.json({ success: true, data: users, count: users.length }, { status: 200 });
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        // Fetch users without passwords
        const users = await User.find(ACTIVE)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const active = await User.countDocuments({ ...ACTIVE, status: "active" });
        const inactive = await User.countDocuments({ ...ACTIVE, status: "inactive" });
        const total = await User.countDocuments(ACTIVE);

        const stats = {
            active,
            inactive,
            total
        };

        return NextResponse.json(
            {
                success: true,
                data: users,
                count: users.length,
                stats
            },
            { status: 200 }
        );
    } catch (error: any) {
        // console.error("Error fetching users:", error);

        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}
