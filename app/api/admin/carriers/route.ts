/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Carrier from "@/models/carrier";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "carrier", "read")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const noPagination = searchParams.get("nopagination") === "true";

        if (noPagination) {
            const carriers = await Carrier.find(ACTIVE).sort({ createdAt: -1 });
            return NextResponse.json({ success: true, data: carriers, count: carriers.length }, { status: 200 });
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "all";
        const typeFilter = searchParams.get("type") || "all";
        const skip = (page - 1) * limit;

        const query: any = { ...ACTIVE };

        if (status === "active") {
            query.isActive = true;
        } else if (status === "inactive") {
            query.isActive = false;
        }

        if (typeFilter === "local" || typeFilter === "external_api") {
            query.type = typeFilter;
        }

        if (search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: regex },
                { contactPhone: regex },
                { contactEmail: regex },
            ];
        }

        const [carriers, total, totalAll, localCount, externalCount, activeCount] = await Promise.all([
            Carrier.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Carrier.countDocuments(query),
            Carrier.countDocuments(ACTIVE),
            Carrier.countDocuments({ ...ACTIVE, type: "local" }),
            Carrier.countDocuments({ ...ACTIVE, type: "external_api" }),
            Carrier.countDocuments({ ...ACTIVE, isActive: true }),
        ]);

        const stats = {
            total: totalAll,
            local: localCount,
            external: externalCount,
            active: activeCount,
        };

        return NextResponse.json({
            success: true,
            data: carriers,
            count: carriers.length,
            total,
            stats,
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
