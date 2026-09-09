/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Shipment from "@/models/shipment";
import Company from "@/models/companies";

import "@/models/vehicle";
import "@/models/carrier";
import "@/models/route";

// get shipments
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "يجب تسجيل الدخول أولاً" },
                { status: 401 }
            );
        }

        const { role, companyId, id: userId } = session.user as any;

        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك: تصفح الشحنات مخصص لحسابات الشركات فقط" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json(
                { success: false, message: "معرف الشركة غير صالح" },
                { status: 400 }
            );
        }

        const company = await Company.findOne({
            _id: activeCompanyId,
            status: "active",
            deletedAt: null,
        });

        if (!company) {
            return NextResponse.json(
                { success: false, message: "حساب الشركة غير نشط أو تم تعطيله" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search")?.trim() || "";
        const status = searchParams.get("status");
        const type = searchParams.get("type");
        const noPagination = searchParams.get("nopagination") === "true";
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const filter: Record<string, any> = {
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        };

        if (status) {
            filter.status = status;
        }

        if (type) {
            filter.type = type;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                if (endDate.length === 10) {
                    end.setHours(23, 59, 59, 999);
                }
                filter.createdAt.$lte = end;
            }
        }

        if (search) {
            filter.$or = [
                { shipmentNumber: { $regex: search, $options: "i" } },
                { trackingNumber: { $regex: search, $options: "i" } },
                { waybillNumber: { $regex: search, $options: "i" } },
                { origin: { $regex: search, $options: "i" } },
                { destination: { $regex: search, $options: "i" } },
            ];
        }

        if (noPagination) {
            const shipments = await Shipment.find(filter)
                .populate("companyId", "companyName taxNumber city address phone email")
                .populate("vehicleId", "type capacityWeight plateNumber model year")
                .populate("carrierId", "name phone email")
                .populate("routeId", "name routeName origin destination basePrice distance estimatedHours")
                .sort({ createdAt: -1 })
                .lean();

            return NextResponse.json(
                { success: true, data: shipments, count: shipments.length, total: shipments.length },
                { status: 200 }
            );
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const [shipments, total, createdCount, inTransitCount, deliveredCount, cancelledCount] = await Promise.all([
            Shipment.find(filter)
                .populate("companyId", "companyName taxNumber city address phone email")
                .populate("vehicleId", "type capacityWeight plateNumber model year")
                .populate("carrierId", "name phone email")
                .populate("routeId", "name routeName origin destination basePrice distance estimatedHours")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Shipment.countDocuments(filter),
            Shipment.countDocuments({ ...filter, status: "created" }),
            Shipment.countDocuments({ ...filter, status: "in_transit" }),
            Shipment.countDocuments({ ...filter, status: "delivered" }),
            Shipment.countDocuments({ ...filter, status: "cancelled" }),
        ]);

        return NextResponse.json(
            {
                success: true,
                data: shipments,
                count: shipments.length,
                stats: {
                    total,
                    created: createdCount,
                    in_transit: inTransitCount,
                    delivered: deliveredCount,
                    cancelled: cancelledCount,
                },
                pagination: {
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    totalRecords: total,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء جلب الشحنات",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
