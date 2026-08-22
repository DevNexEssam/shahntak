/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Waybill from "@/models/waybill";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { can } from "@/utils/permissions";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "waybill", "read")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const shipmentId = searchParams.get("shipmentId");
        const noPagination = searchParams.get("nopagination") === "true";

        const filter: Record<string, any> = {};
        if (shipmentId) filter.shipmentId = shipmentId;

        if (noPagination) {
            const waybills = await Waybill.find(filter).populate("shipmentId", "shipmentNumber status").sort({ createdAt: -1 });
            return NextResponse.json({ success: true, data: waybills, count: waybills.length }, { status: 200 });
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const waybills = await Waybill.find(filter).populate("shipmentId", "shipmentNumber status").sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Waybill.countDocuments(filter);

        return NextResponse.json({ success: true, data: waybills, count: waybills.length, total }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
