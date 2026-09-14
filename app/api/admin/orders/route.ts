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
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get("companyId");
        const status = searchParams.get("status");
        const city = searchParams.get("city");
        const search = searchParams.get("search");
        const noPagination = searchParams.get("nopagination") === "true";
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const filter: Record<string, any> = { ...ACTIVE };
        if (companyId) filter.companyId = companyId;
        if (status && status !== "all") filter.status = status;
        if (city) filter.recipientCity = { $regex: city, $options: "i" };

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

        if (search && search.trim() !== "") {
            const searchRegex = { $regex: search.trim(), $options: "i" };
            filter.$or = [
                { orderNumber: searchRegex },
                { recipientName: searchRegex },
                { recipientPhone: searchRegex },
                { recipientCity: searchRegex },
                { recipientAddress: searchRegex },
            ];
        }

        if (noPagination) {
            const orders = await Order.find(filter)
                .populate("companyId", "companyName email")
                .populate("createdByUserId", "userName userEmail")
                .sort({ createdAt: -1 });

            return NextResponse.json(
                { success: true, data: orders, count: orders.length, total: orders.length },
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
                total,
                stats: { pending, validated, grouped, shipped, delivered, cancelled, total },
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred, please try again later", error: error.message },
            { status: 500 }
        );
    }
}
