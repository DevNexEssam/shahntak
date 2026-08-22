/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Shipment from "@/models/shipment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";

// GET shipments list
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "shipment", "read")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get("companyId");
        const type = searchParams.get("type");
        const status = searchParams.get("status");
        const noPagination = searchParams.get("nopagination") === "true";

        const filter: Record<string, any> = { ...ACTIVE };
        if (companyId) filter.companyId = companyId;
        if (type) filter.type = type;
        if (status) filter.status = status;

        if (noPagination) {
            const shipments = await Shipment.find(filter)
                .populate("companyId", "companyName email")
                .populate("carrierId", "name type")
                .populate("vehicleId", "type")
                .populate("routeId", "origin destination")
                .sort({ createdAt: -1 });

            return NextResponse.json(
                { success: true, data: shipments, count: shipments.length },
                { status: 200 }
            );
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const shipments = await Shipment.find(filter)
            .populate("companyId", "companyName email")
            .populate("carrierId", "name type")
            .populate("vehicleId", "type")
            .populate("routeId", "origin destination")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const created = await Shipment.countDocuments({ ...filter, status: "created" });
        const inTransit = await Shipment.countDocuments({ ...filter, status: "in_transit" });
        const delivered = await Shipment.countDocuments({ ...filter, status: "delivered" });
        const cancelled = await Shipment.countDocuments({ ...filter, status: "cancelled" });
        const total = await Shipment.countDocuments(filter);

        return NextResponse.json(
            {
                success: true,
                data: shipments,
                count: shipments.length,
                stats: { created, inTransit, delivered, cancelled, total },
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
