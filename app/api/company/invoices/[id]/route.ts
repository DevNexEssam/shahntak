/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/invoice";
import Shipment from "@/models/shipment";
import Company from "@/models/companies";
import { invoiceUpdateValidationSchema } from "@/lib/validations/invoice.schema";

// get invoice
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
                { success: false, message: "Invalid invoice ID" },
                { status: 400 }
            );
        }

        const invoice = await Invoice.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        })
            .populate("companyId", "companyName taxNumber city address phone email vatRate vatExemptionReason")
            .populate("invoicePayments")
            .populate("invoiceShipments")
            .lean();

        if (!invoice) {
            return NextResponse.json(
                { success: false, message: "Invoice not found" },
                { status: 404 }
            );
        }

        // calculate discount and vat
        const companyRecord = await Company.findById(activeCompanyId).lean();
        const effectiveTaxRate = invoice.taxRateSnapshot !== undefined 
            ? Number(invoice.taxRateSnapshot) 
            : (companyRecord?.vatRate !== undefined ? Number(companyRecord.vatRate) : 15);

        const discount = Number(invoice.discount || 0);
        let basePrice = Number(invoice.subtotal || 0);

        const linkedShipment = invoice.invoiceShipments && invoice.invoiceShipments.length > 0 
            ? invoice.invoiceShipments[0] 
            : await Shipment.findOne({ $or: [{ invoiceId: invoice._id }, { _id: (invoice as any).shipmentId }], deletedAt: null }).lean();

        if (linkedShipment && (!linkedShipment.waybillNumber || linkedShipment.waybillNumber.trim() === '')) {
            linkedShipment.waybillNumber = `WB-${new Date().getFullYear()}-${linkedShipment._id.toString().slice(-6).toUpperCase()}`;
        }

        if (linkedShipment && (linkedShipment.customerPrice > 0 || linkedShipment.shippingCost > 0)) {
            basePrice = Number(linkedShipment.customerPrice || linkedShipment.shippingCost);
        } else if (basePrice === 0) {
            const rawTotal = Number(invoice.total || 0);
            const rateMultiplier = 1 + (effectiveTaxRate / 100);
            basePrice = Math.round(((rawTotal / rateMultiplier) + discount) * 100) / 100;
        }

        const validDiscount = Math.min(basePrice, Math.max(0, discount));
        const discountedSubtotal = Math.max(0, basePrice - validDiscount);
        const vatAmount = Math.round(discountedSubtotal * (effectiveTaxRate / 100) * 100) / 100;
        const computedTotal = Math.round((discountedSubtotal + vatAmount) * 100) / 100;

        const enrichedInvoice = {
            ...invoice,
            subtotal: basePrice,
            discount: validDiscount,
            discountedSubtotal,
            vatAmount,
            taxRateSnapshot: effectiveTaxRate,
            taxRate: effectiveTaxRate,
            vatExemptionReason: effectiveTaxRate === 0 ? (companyRecord?.vatExemptionReason || "Transport services exempt under regulations") : "",
            total: computedTotal,
            shipment: linkedShipment || (invoice.invoiceShipments && invoice.invoiceShipments[0]) || null,
        };

        return NextResponse.json({ success: true, data: enrichedInvoice }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred while fetching invoice", error: error.message },
            { status: 500 }
        );
    }
}

// update invoice
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
                { success: false, message: "Invalid invoice ID" },
                { status: 400 }
            );
        }

        const invoice = await Invoice.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!invoice) {
            return NextResponse.json(
                { success: false, message: "Invoice not found or you do not have permission to update it" },
                { status: 404 }
            );
        }

        // check paid invoice lock
        if (invoice.status === "paid") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Financial Integrity Guard: Paid invoices cannot be modified, updated, or re-opened",
                },
                { status: 400 }
            );
        }

        const body = await req.json();

        // strip read-only fields
        delete body.companyId;
        delete body._id;
        delete body.invoiceNumber;
        delete body.createdAt;
        delete body.issuedAt;
        delete body.issuedDate;
        delete body.updatedAt;

        // check status change
        if (body.status === "paid" && invoice.status !== "paid") {
            const linkedShipment = await Shipment.findOne({ invoiceId: invoice._id, deletedAt: null }).lean();
            if (linkedShipment && linkedShipment.status !== "delivered") {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Cannot manually set invoice status to paid for undelivered shipments",
                    },
                    { status: 400 }
                );
            }
        }

        // calculate totals
        const companyRecord = await Company.findById(activeCompanyId).lean();
        const effectiveTaxRate = invoice.taxRateSnapshot !== undefined 
            ? Number(invoice.taxRateSnapshot) 
            : (companyRecord?.vatRate !== undefined ? Number(companyRecord.vatRate) : 15);

        const linkedShipment = await Shipment.findOne({ invoiceId: invoice._id, deletedAt: null }).lean();

        let basePrice = body.subtotal !== undefined && Number(body.subtotal) >= 0
            ? Number(body.subtotal)
            : Number(invoice.subtotal || 0);

        if (basePrice === 0 && linkedShipment && (linkedShipment.customerPrice > 0 || linkedShipment.shippingCost > 0)) {
            basePrice = Number(linkedShipment.customerPrice || linkedShipment.shippingCost);
        } else if (basePrice === 0) {
            const currentDiscount = Number(invoice.discount || 0);
            const rateMultiplier = 1 + (effectiveTaxRate / 100);
            basePrice = Math.round(((Number(invoice.total || 0) / rateMultiplier) + currentDiscount) * 100) / 100;
        }

        let newDiscount = body.discount !== undefined ? Number(body.discount) : Number(invoice.discount || 0);
        if (isNaN(newDiscount) || newDiscount < 0) {
            newDiscount = 0;
        }
        if (newDiscount > basePrice) {
            newDiscount = basePrice;
        }

        const discountedSubtotal = Math.max(0, basePrice - newDiscount);
        const vatAmount = Math.round(discountedSubtotal * (effectiveTaxRate / 100) * 100) / 100;
        const computedTotal = Math.round((discountedSubtotal + vatAmount) * 100) / 100;

        body.subtotal = basePrice;
        body.discount = newDiscount;
        body.vatAmount = vatAmount;
        body.taxRateSnapshot = effectiveTaxRate;
        body.total = computedTotal;

        const validation = invoiceUpdateValidationSchema.safeParse(body);
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

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            id,
            { $set: validation.data },
            { new: true, runValidators: true }
        );

        return NextResponse.json(
            { success: true, message: "Invoice updated successfully", data: updatedInvoice },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error occurred while updating invoice",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

// delete invoice
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
                { success: false, message: "Invalid invoice ID" },
                { status: 400 }
            );
        }

        const invoice = await Invoice.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
        });

        if (!invoice) {
            return NextResponse.json(
                { success: false, message: "Invoice to delete not found" },
                { status: 404 }
            );
        }

        // check deletion safety
        if (invoice.status === "paid") {
            return NextResponse.json(
                { success: false, message: "Financial Integrity Guard: Cannot delete or cancel paid invoices" },
                { status: 400 }
            );
        }

        const linkedShipment = await Shipment.findOne({ invoiceId: invoice._id, deletedAt: null }).lean();
        if (linkedShipment && linkedShipment.status === "delivered") {
            return NextResponse.json(
                { success: false, message: "Tax Integrity Guard: Cannot delete or cancel invoices linked to completed and delivered shipments" },
                { status: 400 }
            );
        }

        if (isHardDelete) {
            await Invoice.deleteOne({ _id: id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            return NextResponse.json(
                { success: true, message: "Invoice permanently deleted from system" },
                { status: 200 }
            );
        } else {
            invoice.deletedAt = new Date();
            invoice.status = "cancelled";
            await invoice.save();
            return NextResponse.json(
                { success: true, message: "Invoice successfully archived and cancelled" },
                { status: 200 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error occurred while deleting invoice",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

