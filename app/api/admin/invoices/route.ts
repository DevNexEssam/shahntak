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
        const search = searchParams.get("search");
        const noPagination = searchParams.get("nopagination") === "true";

        const filter: Record<string, any> = { ...ACTIVE };
        if (companyId) filter.companyId = companyId;
        if (status && status !== "all") filter.status = status;

        if (search && search.trim() !== "") {
            filter.invoiceNumber = { $regex: search.trim(), $options: "i" };
        }

        if (noPagination) {
            const invoices = await Invoice.find(filter).populate("companyId", "companyName email").sort({ createdAt: -1 });
            return NextResponse.json({ success: true, data: invoices, count: invoices.length, total: invoices.length }, { status: 200 });
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const invoices = await Invoice.find(filter).populate("companyId", "companyName email").sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Invoice.countDocuments(filter);

        const draft = await Invoice.countDocuments({ ...filter, status: "draft" });
        const issued = await Invoice.countDocuments({ ...filter, status: "issued" });
        const paid = await Invoice.countDocuments({ ...filter, status: "paid" });
        const overdue = await Invoice.countDocuments({ ...filter, status: "overdue" });
        const cancelled = await Invoice.countDocuments({ ...filter, status: "cancelled" });

        // Aggregating collected vs pending totals
        const paidInvoices = await Invoice.find({ ...filter, status: "paid" });
        const totalCollected = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

        const pendingInvoices = await Invoice.find({ ...filter, status: { $in: ["issued", "overdue", "draft"] } });
        const totalPending = pendingInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

        return NextResponse.json({
            success: true,
            data: invoices,
            count: invoices.length,
            total,
            stats: { draft, issued, paid, overdue, cancelled, total, totalCollected, totalPending },
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
