/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/invoice";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "invoice", "read")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get("companyId");
        const status = searchParams.get("status");
        const noPagination = searchParams.get("nopagination") === "true";

        const filter: Record<string, any> = { ...ACTIVE };
        if (companyId) filter.companyId = companyId;
        if (status) filter.status = status;

        if (noPagination) {
            const invoices = await Invoice.find(filter).populate("companyId", "companyName email").sort({ createdAt: -1 });
            return NextResponse.json({ success: true, data: invoices, count: invoices.length }, { status: 200 });
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const invoices = await Invoice.find(filter).populate("companyId", "companyName email").sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Invoice.countDocuments(filter);

        return NextResponse.json({ success: true, data: invoices, count: invoices.length, total }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
