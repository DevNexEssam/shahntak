import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { orderUpdateValidationSchema } from "@/lib/validations";
import Order from "@/models/order";
import Company from "@/models/companies";
import CompanyUser from "@/models/Companyuser";
import Shipment from "@/models/shipment";
import User from "@/models/user";
import { ACTIVE } from "@/utils/constants";
import { can } from "@/utils/permissions";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET single order
export async function GET(_req: Request, context: any) {
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

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid order ID" },
                { status: 400 }
            );
        }

        const order = await Order.findOne({ _id: id, ...ACTIVE })
            .populate("companyId", "companyName email")
            .populate("createdByUserId", "userName userEmail")
            .populate("shipmentId", "shipmentNumber status");

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: order },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred, please try again later", error: error.message },
            { status: 500 }
        );
    }
}

// PATCH update order
export async function PATCH(req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "order", "update")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid order ID" },
                { status: 400 }
            );
        }

        let updates;
        try {
            updates = await req.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid data format" },
                { status: 400 }
            );
        }

        const validation = orderUpdateValidationSchema.safeParse(updates);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid data",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const updatePayload: Record<string, any> = { ...validation.data };

        if (updatePayload.companyId && updatePayload.companyId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(updatePayload.companyId)) {
                return NextResponse.json({ success: false, message: "Invalid company ID" }, { status: 400 });
            }
            const targetCompany = await Company.findOne({ _id: updatePayload.companyId, ...ACTIVE }).lean();
            if (!targetCompany) {
                return NextResponse.json({ success: false, message: "Associated company does not exist" }, { status: 400 });
            }
        }

        if (updatePayload.createdByUserId && updatePayload.createdByUserId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(updatePayload.createdByUserId)) {
                return NextResponse.json({ success: false, message: "Invalid creator user ID" }, { status: 400 });
            }
            const targetCompUser = await CompanyUser.findOne({ _id: updatePayload.createdByUserId, ...ACTIVE }).lean();
            if (targetCompUser) {
                updatePayload.createdByUserType = "company_user";
            } else {
                const targetAdmin = await User.findById(updatePayload.createdByUserId).lean();
                if (targetAdmin) {
                    updatePayload.createdByUserType = "user";
                } else {
                    return NextResponse.json({ success: false, message: "Order creator does not exist" }, { status: 400 });
                }
            }
        }

        if (updatePayload.shipmentId && updatePayload.shipmentId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(updatePayload.shipmentId)) {
                return NextResponse.json({ success: false, message: "Invalid shipment ID" }, { status: 400 });
            }
            const targetShipment = await Shipment.findOne({ _id: updatePayload.shipmentId, ...ACTIVE }).lean();
            if (!targetShipment) {
                return NextResponse.json({ success: false, message: "Associated shipment does not exist" }, { status: 400 });
            }
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: id, ...ACTIVE },
            updatePayload,
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Order updated successfully", data: updatedOrder },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred, please try again later", error: error.message },
            { status: 500 }
        );
    }
}

// DELETE order
export async function DELETE(_req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        const canSoftDelete = role && can(role, "order", "softDelete");
        const canHardDelete = role && can(role, "order", "delete");

        if (!canSoftDelete && !canHardDelete) {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid order ID" },
                { status: 400 }
            );
        }

        const url = new URL(_req.url);
        const isHardDelete = url.searchParams.get("hard") === "true";

        let deletedOrder;

        if (isHardDelete && canHardDelete) {
            deletedOrder = await Order.findByIdAndDelete(id);
        } else if (canSoftDelete) {
            deletedOrder = await Order.findOneAndUpdate(
                { _id: id, ...ACTIVE },
                { status: "cancelled", deletedAt: new Date() },
                { new: true }
            );
        } else if (canHardDelete) {
            deletedOrder = await Order.findByIdAndDelete(id);
        }

        if (!deletedOrder) {
            return NextResponse.json(
                { success: false, message: "Order not found or already deleted" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Order deleted successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred, please try again later", error: error.message },
            { status: 500 }
        );
    }
}
