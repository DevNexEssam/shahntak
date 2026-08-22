/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";

// GET orders list
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "order", "read")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get("companyId");
        const status = searchParams.get("status");
        const city = searchParams.get("city");
        const noPagination = searchParams.get("nopagination") === "true";

        const filter: Record<string, any> = { ...ACTIVE };
        if (companyId) filter.companyId = companyId;
        if (status) filter.status = status;
        if (city) filter.recipientCity = { $regex: city, $options: "i" };

        if (noPagination) {
            const orders = await Order.find(filter)
                .populate("companyId", "companyName email")
                .populate("createdByUserId", "userName userEmail")
                .sort({ createdAt: -1 });

            return NextResponse.json(
                { success: true, data: orders, count: orders.length },
                { status: 200 }
            );
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find(filter)
            .populate("companyId", "companyName email")
            .populate("createdByUserId", "userName userEmail")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const pending = await Order.countDocuments({ ...filter, status: "pending" });
        const validated = await Order.countDocuments({ ...filter, status: "validated" });
        const grouped = await Order.countDocuments({ ...filter, status: "grouped" });
        const shipped = await Order.countDocuments({ ...filter, status: "shipped" });
        const delivered = await Order.countDocuments({ ...filter, status: "delivered" });
        const cancelled = await Order.countDocuments({ ...filter, status: "cancelled" });
        const total = await Order.countDocuments(filter);

        return NextResponse.json(
            {
                success: true,
                data: orders,
                count: orders.length,
                stats: { pending, validated, grouped, shipped, delivered, cancelled, total },
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
