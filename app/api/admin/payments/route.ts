/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/payment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { can } from "@/utils/permissions";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "payment", "read")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const invoiceId = searchParams.get("invoiceId");
        const method = searchParams.get("method");
        const search = searchParams.get("search");
        const noPagination = searchParams.get("nopagination") === "true";

        const filter: Record<string, any> = {};
        if (invoiceId && invoiceId.trim() !== "") filter.invoiceId = invoiceId;
        if (method && method !== "all") filter.method = method;

        if (noPagination) {
            const payments = await Payment.find(filter).populate("invoiceId", "invoiceNumber total status companyId").sort({ createdAt: -1 });
            return NextResponse.json({ success: true, data: payments, count: payments.length }, { status: 200 });
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const payments = await Payment.find(filter)
            .populate({
                path: "invoiceId",
                select: "invoiceNumber total status companyId",
                populate: { path: "companyId", select: "companyName" }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Payment.countDocuments(filter);

        // Aggregate Stats
        const allPayments = await Payment.find({});
        const totalAmount = allPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const bankTransferCount = allPayments.filter(p => p.method === "bank_transfer").length;
        const cardCount = allPayments.filter(p => p.method === "card").length;
        const cashCount = allPayments.filter(p => p.method === "cash").length;

        const stats = {
            total: allPayments.length,
            totalAmount,
            bankTransferCount,
            cardCount,
            cashCount,
        };

        return NextResponse.json({
            success: true,
            data: payments,
            count: payments.length,
            total,
            stats,
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}
