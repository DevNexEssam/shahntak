/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Route from "@/models/route";
import Company from "@/models/companies";

// get routes
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json({ success: false, message: "غير مصرح لك: تصفح المسارات مخصص لحسابات الشركات فقط" }, { status: 403 });
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json({ success: false, message: "معرف الشركة غير صالح" }, { status: 400 });
        }

        const company = await Company.findOne({ _id: activeCompanyId, status: "active", deletedAt: null });
        if (!company) {
            return NextResponse.json({ success: false, message: "حساب الشركة غير نشط أو تم تعطيله" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search")?.trim() || "";
        const status = searchParams.get("status");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const noPagination = searchParams.get("nopagination") === "true";

        const filter: Record<string, any> = {
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        };

        if (status === "active") filter.isActive = true;
        if (status === "inactive") filter.isActive = false;

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
                { origin: { $regex: search, $options: "i" } },
                { destination: { $regex: search, $options: "i" } },
                { vehicleType: { $regex: search, $options: "i" } },
                { estimatedTransitTime: { $regex: search, $options: "i" } },
            ];
        }

        if (noPagination) {
            const routes = await Route.find(filter)
                .populate("carrierId", "name phone")
                .sort({ createdAt: -1 })
                .lean();

            return NextResponse.json({ success: true, data: routes, count: routes.length, total: routes.length }, { status: 200 });
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const [routes, total, activeCount, inactiveCount] = await Promise.all([
            Route.find(filter)
                .populate("carrierId", "name phone")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Route.countDocuments(filter),
            Route.countDocuments({ ...filter, isActive: true }),
            Route.countDocuments({ ...filter, isActive: false }),
        ]);

        return NextResponse.json(
            {
                success: true,
                data: routes,
                count: routes.length,
                stats: { total, active: activeCount, inactive: inactiveCount },
                pagination: { page, limit, totalPages: Math.ceil(total / limit), totalRecords: total },
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم أثناء جلب المسارات", error: error.message }, { status: 500 });
    }
}
