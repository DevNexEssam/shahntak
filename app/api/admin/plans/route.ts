/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Plan from "@/models/plan";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "company", "read")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const nopagination = searchParams.get("nopagination") === "true";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
        const search = searchParams.get("search") || "";
        const cycle = searchParams.get("cycle") || "all";

        await connectDB();

        const query: any = { ...ACTIVE };

        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: regex },
                { description: regex },
            ];
        }

        if (cycle && cycle !== "all") {
            query.billingCycle = cycle;
        }

        if (nopagination) {
            const plans = await Plan.find(query).sort({ price: 1 }).lean();
            return NextResponse.json({
                success: true,
                data: plans,
                total: plans.length,
                count: plans.length,
            });
        }

        const skip = (page - 1) * limit;

        const [plans, total, activeCount, inactiveCount] = await Promise.all([
            Plan.find(query).sort({ price: 1 }).skip(skip).limit(limit).lean(),
            Plan.countDocuments(query),
            Plan.countDocuments({ ...ACTIVE, isActive: true }),
            Plan.countDocuments({ ...ACTIVE, isActive: false }),
        ]);

        return NextResponse.json({
            success: true,
            data: plans,
            total,
            count: plans.length,
            stats: {
                active: activeCount,
                inactive: inactiveCount,
                total,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
