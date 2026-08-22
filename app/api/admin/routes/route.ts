/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Route from "@/models/route";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "route", "read")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const origin = searchParams.get("origin");
        const destination = searchParams.get("destination");
        const noPagination = searchParams.get("nopagination") === "true";

        const filter: Record<string, any> = { ...ACTIVE };
        if (origin) filter.origin = { $regex: origin, $options: "i" };
        if (destination) filter.destination = { $regex: destination, $options: "i" };

        if (noPagination) {
            const routes = await Route.find(filter).populate("carrierId", "name type").sort({ createdAt: -1 });
            return NextResponse.json({ success: true, data: routes, count: routes.length }, { status: 200 });
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const routes = await Route.find(filter).populate("carrierId", "name type").sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Route.countDocuments(filter);

        return NextResponse.json({ success: true, data: routes, count: routes.length, total }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
