/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/invoice";
import Company from "@/models/companies";
import Shipment from "@/models/shipment";
import Order from "@/models/order";

// get invoices
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
                { success: false, message: "غير مصرح لك: تصفح الفواتير مخصص لحسابات الشركات فقط" },
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

        if (search) {
            filter.invoiceNumber = { $regex: search, $options: "i" };
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

        if (noPagination) {
            const invoices = await Invoice.find(filter)
                .populate("companyId", "companyName taxNumber city address phone email vatRate vatExemptionReason")
                .sort({ createdAt: -1 })
                .lean();

            return NextResponse.json(
                { success: true, data: invoices, count: invoices.length, total: invoices.length },
                { status: 200 }
            );
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const [rawInvoices, total, draftCount, issuedCount, paidCount, overdueCount, cancelledCount] = await Promise.all([
            Invoice.find(filter)
                .populate("companyId", "companyName taxNumber city address phone email vatRate vatExemptionReason")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Invoice.countDocuments(filter),
            Invoice.countDocuments({ ...filter, status: "draft" }),
            Invoice.countDocuments({ ...filter, status: "issued" }),
            Invoice.countDocuments({ ...filter, status: "paid" }),
            Invoice.countDocuments({ ...filter, status: "overdue" }),
            Invoice.countDocuments({ ...filter, status: "cancelled" }),
        ]);

        const invoices = await Promise.all(
            rawInvoices.map(async (inv: any) => {
                const linkedShipment = await Shipment.findOne({
                    $or: [{ invoiceId: inv._id }, { _id: inv.shipmentId }],
                    deletedAt: null,
                })
                    .populate("routeId")
                    .populate("carrierId", "name phone email")
                    .populate("vehicleId", "type capacityWeight plateNumber model year")
                    .lean();

                let shipPrice = linkedShipment ? Number(linkedShipment.customerPrice || linkedShipment.shippingCost || 0) : 0;

                if (shipPrice === 0 && linkedShipment && (linkedShipment.routeId as any)?.basePrice) {
                    shipPrice = Number((linkedShipment.routeId as any).basePrice);
                }

                if (!inv.subtotal || inv.subtotal === 0 || !inv.total || inv.total === 0) {
                    const finalVal = shipPrice > 0 ? shipPrice : (inv.subtotal || inv.total || 0);
                    inv.subtotal = finalVal;
                    inv.total = finalVal;
                    await Invoice.updateOne({ _id: inv._id }, { $set: { subtotal: inv.subtotal, total: inv.total } });
                }

                if (linkedShipment) {
                    if (!linkedShipment.waybillNumber || linkedShipment.waybillNumber.trim() === '') {
                        linkedShipment.waybillNumber = `WB-${new Date().getFullYear()}-${linkedShipment._id.toString().slice(-6).toUpperCase()}`;
                    }
                    inv.shipment = linkedShipment;
                }
                return inv;
            })
        );

        return NextResponse.json(
            {
                success: true,
                data: invoices,
                count: invoices.length,
                stats: {
                    total,
                    draft: draftCount,
                    issued: issuedCount,
                    paid: paidCount,
                    overdue: overdueCount,
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
                message: "حدث خطأ في الخادم أثناء جلب الفواتير",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
