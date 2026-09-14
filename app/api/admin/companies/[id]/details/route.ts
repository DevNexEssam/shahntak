/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/companies";
import CompanyUser from "@/models/Companyuser";
import Invoice from "@/models/invoice";
import Order from "@/models/order";
import Shipment from "@/models/shipment";
import { ACTIVE } from "@/utils/constants";
import { can } from "@/utils/permissions";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


// GET single company details
export async function GET(_req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "company", "read")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid company ID" },
                { status: 400 }
            );
        }

        const [
            employeesCount,
            ordersCount,
            shipmentsCount,
            completedShipmentsCount,
            activeShipmentsCount,
            revenueResult,
            pendingResult,
        ] = await Promise.all([
            CompanyUser.countDocuments({ companyId: id, userIsActive: true }),
            Order.countDocuments({ companyId: id }),
            Shipment.countDocuments({ companyId: id }),
            Shipment.countDocuments({ companyId: id, status: "delivered" }),
            Shipment.countDocuments({
                companyId: id,
                status: { $nin: ["delivered", "cancelled", "returned"] },
            }),
            Invoice.aggregate([
                { $match: { companyId: id, status: "paid" } },
                { $group: { _id: null, total: { $sum: "$total" } } },
            ]),
            Invoice.aggregate([
                { $match: { companyId: id, status: "issued" } },
                { $group: { _id: null, total: { $sum: "$total" } } },
            ]),
        ]);

        const company = await Company.findOne({ _id: id, ...ACTIVE }).select("-password");

        if (!company) {
            return NextResponse.json(
                { success: false, message: "Company not found" },
                { status: 404 }
            );
        }


        return NextResponse.json(
            {
                success: true,
                employeesCount,
                ordersCount,
                shipmentsCount,
                completedShipmentsCount,
                activeShipmentsCount,
                totalRevenue: revenueResult[0]?.total ?? 0,
                pendingAmount: pendingResult[0]?.total ?? 0,
                company,
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error, please try again later", error: error.message },
            { status: 500 }
        );
    }
}