/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Shipment from "@/models/shipment";
import Order from "@/models/order";
import Invoice from "@/models/invoice";
import Route from "@/models/route";
import { shipmentUpdateValidationSchema } from "@/lib/validations/shipment.schema";

// get shipment
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
                { success: false, message: "Invalid shipment ID" },
                { status: 400 }
            );
        }

        const shipment = await Shipment.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        })
            .populate("companyId", "companyName taxNumber city address phone email")
            .populate("vehicleId")
            .populate("carrierId")
            .populate("routeId")
            .populate("shipmentOrders")
            .lean();

        if (!shipment) {
            return NextResponse.json(
                { success: false, message: "Shipment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: shipment }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred while fetching shipment", error: error.message },
            { status: 500 }
        );
    }
}

// update shipment
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
        const { pathname } = new URL(req.url);
        const id = pathname.split("/").pop();

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid shipment ID" },
                { status: 400 }
            );
        }

        const shipment = await Shipment.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!shipment) {
            return NextResponse.json(
                { success: false, message: "Shipment not found or you do not have permission to update it" },
                { status: 404 }
            );
        }

        const body = await req.json();

        // Strict Lock: Delivered shipments cannot be modified in any way
        if (shipment.status === "delivered") {
            return NextResponse.json(
                { success: false, message: "Shipment is fully delivered and locked; no updates or status changes are permitted" },
                { status: 400 }
            );
        }

        // block route edits in transit
        const inTransitStates = ["picked_up", "in_transit", "arrived", "out_for_delivery"];
        if (inTransitStates.includes(shipment.status)) {
            if (
                (body.origin && body.origin.trim() !== shipment.origin) ||
                (body.destination && body.destination.trim() !== shipment.destination)
            ) {
                return NextResponse.json(
                    { success: false, message: "Cannot modify origin or destination city for a shipment already picked up or in transit on the road" },
                    { status: 400 }
                );
            }
        }

        delete body.companyId;
        delete body._id;
        delete body.shipmentNumber;

        // Auto-recalculate prices based on Route & Orders (block manual edits)
        const targetRouteId = body.routeId !== undefined ? body.routeId : shipment.routeId;
        let routeBasePrice = 0;

        if (targetRouteId && mongoose.Types.ObjectId.isValid(targetRouteId)) {
            const routeObj = await Route.findOne({
                _id: targetRouteId,
                companyId: new mongoose.Types.ObjectId(activeCompanyId),
                deletedAt: null,
            });
            if (routeObj) {
                routeBasePrice = Number(routeObj.basePrice || 0);
            }
        }

        const linkedOrders = await Order.find({
            shipmentId: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        }).lean();

        const ordersValueSum = linkedOrders.reduce(
            (sum: number, ord: any) => sum + (Number(ord.orderValue) || Number(ord.codAmount) || 0),
            0
        );

        body.shippingCost = routeBasePrice;
        body.customerPrice = ordersValueSum + routeBasePrice;

        const validation = shipmentUpdateValidationSchema.safeParse(body);
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

        const newStatus = validation.data.status;

        // Prevent moving directly from cancelled to delivered or in_transit
        if (shipment.status === "cancelled" && (newStatus === "delivered" || newStatus === "in_transit")) {
            return NextResponse.json(
                { success: false, message: "Cannot set a cancelled shipment directly to in-transit or delivered without re-launching it first" },
                { status: 400 }
            );
        }

        // check delivery retry state
        if (shipment.status === "delivery_failed" && newStatus === "delivered") {
            return NextResponse.json(
                { success: false, message: "Cannot set a delivery-failed shipment directly to delivered without sending it out for delivery again" },
                { status: 400 }
            );
        }

        const calculatedTotal = validation.data.customerPrice;

        if (newStatus === "delivered") {
            await Order.updateMany(
                { shipmentId: id, companyId: new mongoose.Types.ObjectId(activeCompanyId), deletedAt: null },
                { $set: { status: "delivered" } }
            );

            let existingInvoice = shipment.invoiceId
                ? await Invoice.findOne({ _id: shipment.invoiceId, deletedAt: null })
                : null;

            if (existingInvoice) {
                existingInvoice.status = "paid";
                await existingInvoice.save();
            } else {
                const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
                const newInvoice = await Invoice.create({
                    invoiceNumber,
                    companyId: new mongoose.Types.ObjectId(activeCompanyId),
                    subtotal: calculatedTotal,
                    total: calculatedTotal,
                    status: "paid",
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    deletedAt: null,
                });
                (validation.data as any).invoiceId = newInvoice._id;
            }
        } else if (newStatus === "in_transit") {
            await Order.updateMany(
                { shipmentId: id, companyId: new mongoose.Types.ObjectId(activeCompanyId), deletedAt: null },
                { $set: { status: "shipped" } }
            );
        } else if (newStatus === "cancelled") {
            // reset attached orders
            await Order.updateMany(
                { shipmentId: id, companyId: new mongoose.Types.ObjectId(activeCompanyId), deletedAt: null },
                { $set: { shipmentId: null, status: "pending" } }
            );
        } else if (!shipment.invoiceId) {
            // Ensure invoice exists even if created/pending
            const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
            const newInvoice = await Invoice.create({
                invoiceNumber,
                companyId: new mongoose.Types.ObjectId(activeCompanyId),
                subtotal: calculatedTotal,
                total: calculatedTotal,
                status: "issued",
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                deletedAt: null,
            });
            (validation.data as any).invoiceId = newInvoice._id;
        }

        const updatedShipment = await Shipment.findByIdAndUpdate(
            id,
            { $set: validation.data },
            { new: true, runValidators: true }
        );

        return NextResponse.json(
            { success: true, message: "Shipment updated successfully", data: updatedShipment },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error occurred while updating shipment",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// delete shipment
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
        const { searchParams, pathname } = new URL(req.url);
        const id = pathname.split("/").pop();
        const isHardDelete = searchParams.get("hard") === "true";

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid shipment ID" },
                { status: 400 }
            );
        }

        const shipment = await Shipment.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
        });

        if (!shipment) {
            return NextResponse.json(
                { success: false, message: "Shipment to delete not found" },
                { status: 404 }
            );
        }

        // check deletion state
        const activeShipmentStates = ["delivered", "in_transit", "out_for_delivery"];
        if (activeShipmentStates.includes(shipment.status)) {
            return NextResponse.json(
                { success: false, message: "Cannot delete a shipment that is currently in transit or already delivered to customers. Please use official cancellation or return procedures" },
                { status: 400 }
            );
        }

        // Unlink associated orders and return them to pending
        await Order.updateMany(
            { shipmentId: id },
            { $set: { shipmentId: null, status: "pending" } }
        );

        // Cascade delete or cancel associated unpaid invoice
        const linkedInvoice = shipment.invoiceId
            ? await Invoice.findOne({ _id: shipment.invoiceId, companyId: new mongoose.Types.ObjectId(activeCompanyId), deletedAt: null })
            : await Invoice.findOne({ companyId: new mongoose.Types.ObjectId(activeCompanyId), deletedAt: null, $or: [{ _id: shipment.invoiceId }] });

        if (linkedInvoice && linkedInvoice.status !== "paid") {
            if (isHardDelete) {
                await Invoice.deleteOne({ _id: linkedInvoice._id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            } else {
                linkedInvoice.deletedAt = new Date();
                linkedInvoice.status = "cancelled";
                await linkedInvoice.save();
            }
        }

        if (isHardDelete) {
            await Shipment.deleteOne({ _id: id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            return NextResponse.json(
                { success: true, message: "Shipment deleted, unpaid invoice cancelled, and linked orders released successfully" },
                { status: 200 }
            );
        } else {
            shipment.deletedAt = new Date();
            shipment.status = "cancelled";
            await shipment.save();
            return NextResponse.json(
                { success: true, message: "Shipment archived, unpaid invoice cancelled, and linked orders released successfully" },
                { status: 200 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error occurred while deleting shipment",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
