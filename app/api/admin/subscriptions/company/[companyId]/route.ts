/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Subscription from "@/models/subscription";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
import mongoose from "mongoose";

export async function GET(req: Request, { params }: { params: Promise<{ companyId: string }> }) {
    try {
        const { companyId } = await params;
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return NextResponse.json({ success: false, message: "معرف الشركة غير صالح" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const role = session?.user?.role;
        if (!role || !can(role, "company", "read")) {
            return NextResponse.json({ success: false, message: "غير مصرح لك بهذا الإجراء" }, { status: 403 });
        }

        await connectDB();

        const subscription: any = await Subscription.findOne({
            companyId,
            status: "active",
            ...ACTIVE,
        })
            .populate("planId")
            .lean();

        if (!subscription) {
            return NextResponse.json({ success: false, message: "لا يوجد اشتراك نشط لهذه الشركة" }, { status: 404 });
        }

        const maxOrders = subscription.planId?.maxOrdersPerMonth ?? -1;
        const maxShipments = subscription.planId?.maxShipmentsPerMonth ?? -1;

        const remainingOrders = maxOrders === -1 ? 999999 : Math.max(0, maxOrders - (subscription.ordersUsedThisMonth || 0));
        const remainingShipments = maxShipments === -1 ? 999999 : Math.max(0, maxShipments - (subscription.shipmentsUsedThisMonth || 0));

        return NextResponse.json({
            success: true,
            data: subscription,
            remainingOrders,
            remainingShipments,
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message }, { status: 500 });
    }
}
