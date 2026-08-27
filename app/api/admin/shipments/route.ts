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
        const search = searchParams.get("search");
        const noPagination = searchParams.get("nopagination") === "true";

        const filter: Record<string, any> = { ...ACTIVE };
        if (companyId && companyId.trim() !== "") filter.companyId = companyId;
        if (type && type !== "all") filter.type = type;
        if (status && status !== "all") filter.status = status;

        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { shipmentNumber: regex },
                { origin: regex },
                { destination: regex },
                { trackingNumber: regex },
                { waybillNumber: regex },
            ];
        }

        if (noPagination) {
            const shipments = await Shipment.find(filter)
                .populate("companyId", "companyName email")
                .populate("carrierId", "name type")
                .populate("vehicleId", "type capacityWeight")
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
            .populate("vehicleId", "type capacityWeight")
            .populate("routeId", "origin destination")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const [created, inTransit, delivered, cancelled, total] = await Promise.all([
            Shipment.countDocuments({ ...ACTIVE, status: "created" }),
            Shipment.countDocuments({ ...ACTIVE, status: "in_transit" }),
            Shipment.countDocuments({ ...ACTIVE, status: "delivered" }),
            Shipment.countDocuments({ ...ACTIVE, status: "cancelled" }),
            Shipment.countDocuments(ACTIVE),
        ]);

        const filteredTotal = await Shipment.countDocuments(filter);

        return NextResponse.json(
            {
                success: true,
                data: shipments,
                count: shipments.length,
                total: filteredTotal,
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
