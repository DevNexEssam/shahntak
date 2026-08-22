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
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const invoiceId = searchParams.get("invoiceId");
        const noPagination = searchParams.get("nopagination") === "true";

        const filter: Record<string, any> = {};
        if (invoiceId) filter.invoiceId = invoiceId;

        if (noPagination) {
            const payments = await Payment.find(filter).populate("invoiceId", "invoiceNumber total status").sort({ createdAt: -1 });
            return NextResponse.json({ success: true, data: payments, count: payments.length }, { status: 200 });
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const payments = await Payment.find(filter).populate("invoiceId", "invoiceNumber total status").sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Payment.countDocuments(filter);

        return NextResponse.json({ success: true, data: payments, count: payments.length, total }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
