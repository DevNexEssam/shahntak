/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/order";
import Shipment from "@/models/shipment";
import { checkCompanySubscription } from "@/lib/guards/checkCompanySubscription";
import { orderUpdateValidationSchema } from "@/lib/validations/order.schema";

// get order
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        const { pathname } = new URL(req.url);
        const id = pathname.split("/").pop();

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid order ID" },
                { status: 400 }
            );
        }

        const order = await Order.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: order }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred while fetching order", error: error.message },
            { status: 500 }
        );
    }
}

// update order
export async function PUT(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        const subCheck = await checkCompanySubscription(activeCompanyId);
        if (!subCheck.isAllowed) {
            return subCheck.response;
        }

        const { pathname } = new URL(req.url);
        const id = pathname.split("/").pop();

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid order ID" },
                { status: 400 }
            );
        }

        const order = await Order.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found or you do not have permission to update it" },
                { status: 404 }
            );
        }

        const body = await req.json();

        // State Machine
        const currentStatus = order.status;
        const newStatus = body.status;

        // Strict Lock
        if (currentStatus === "delivered") {
            return NextResponse.json(
                { success: false, message: "Order is fully delivered and locked; no updates or status changes are permitted" },
                { status: 400 }
            );
        }

        if (currentStatus === "cancelled" && (newStatus === "shipped" || newStatus === "delivered")) {
            return NextResponse.json(
                { success: false, message: "Cannot set a cancelled order directly to shipped or delivered without returning it to pending first" },
                { status: 400 }
            );
        }

        if (currentStatus === "pending" && newStatus === "delivered" && !order.shipmentId) {
            return NextResponse.json(
                { success: false, message: "Cannot transition an order from pending to delivered directly without assembling and shipping it" },
                { status: 400 }
            );
        }

        if (currentStatus === "error" && (newStatus === "validated" || newStatus === "pending")) {
            const mergedRecipientName = body.recipientName || order.recipientName;
            const mergedPhone = body.recipientPhone || order.recipientPhone;
            const mergedCity = body.recipientCity || order.recipientCity;
            const mergedAddress = body.recipientAddress || order.recipientAddress;

            if (!mergedRecipientName || !mergedPhone || !mergedCity || !mergedAddress) {
                return NextResponse.json(
                    { success: false, message: "Please correct incomplete recipient details (Name, Phone, City, Address) before activating order" },
                    { status: 400 }
                );
            }
        }

        delete body.companyId;
        delete body.createdByUserId;
        delete body._id;
        delete body.orderNumber;

        const validation = orderUpdateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid input data",
                    errors: validation.error.flatten().fieldErrors,
                },
                { status: 422 }
            );
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { $set: validation.data },
            { new: true, runValidators: true }
        );

        return NextResponse.json(
            { success: true, message: "Order updated successfully", data: updatedOrder },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error occurred while updating order",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// delete order
export async function DELETE(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        const subCheck = await checkCompanySubscription(activeCompanyId);
        if (!subCheck.isAllowed) {
            return subCheck.response;
        }

        const { searchParams, pathname } = new URL(req.url);
        const id = pathname.split("/").pop();
        const isHardDelete = searchParams.get("hard") === "true";

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid order ID" },
                { status: 400 }
            );
        }

        const order = await Order.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order to delete not found" },
                { status: 404 }
            );
        }

        if (order.shipmentId) {
            await Shipment.findByIdAndUpdate(order.shipmentId, {
                $inc: { ordersCount: -1 }
            });
        }

        if (isHardDelete) {
            await Order.deleteOne({ _id: id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            return NextResponse.json(
                { success: true, message: "Order permanently deleted from system" },
                { status: 200 }
            );
        } else {
            order.deletedAt = new Date();
            order.status = "cancelled";
            order.shipmentId = undefined;
            await order.save();
            return NextResponse.json(
                { success: true, message: "Order successfully archived and cancelled" },
                { status: 200 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error occurred while deleting order",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
