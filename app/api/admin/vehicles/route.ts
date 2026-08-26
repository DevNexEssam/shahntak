/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Vehicle from "@/models/vehicle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "vehicle", "read")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");
        const status = searchParams.get("status");
        const noPagination = searchParams.get("nopagination") === "true";

        const filter: Record<string, any> = { ...ACTIVE };
        if (status === "active") filter.isActive = true;
        if (status === "inactive") filter.isActive = false;

        if (search && search.trim() !== "") {
            filter.type = { $regex: search.trim(), $options: "i" };
        }

        if (noPagination) {
            const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
            return NextResponse.json({ success: true, data: vehicles, count: vehicles.length, total: vehicles.length }, { status: 200 });
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

        const active = await Vehicle.countDocuments({ ...filter, isActive: true });
        const inactive = await Vehicle.countDocuments({ ...filter, isActive: false });
        const total = await Vehicle.countDocuments(filter);

        return NextResponse.json({
            success: true,
            data: vehicles,
            count: vehicles.length,
            total,
            stats: { active, inactive, total },
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
