/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/invoice";
import Company from "@/models/companies";
import Shipment from "@/models/shipment";

// create invoice
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        const { role, userRole, companyId, id: userId } = session.user as any;

        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "Unauthorized access: Invoice creation is restricted to company accounts" },
                { status: 403 }
            );
        }

        if (userRole === "staff") {
            return NextResponse.json(
                { success: false, message: "Unauthorized access: Invoice creation is disabled for staff accounts" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json(
                { success: false, message: "Invalid company ID" },
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
                { success: false, message: "Company account is inactive or disabled" },
                { status: 403 }
            );
        }

        const body = await req.json();

        let targetShipment: any = null;
        let basePrice = 0;

        if (body.shipmentId) {
            if (!mongoose.Types.ObjectId.isValid(body.shipmentId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid shipment ID specified" },
                    { status: 400 }
                );
            }

            targetShipment = await Shipment.findOne({
                _id: body.shipmentId,
                companyId: new mongoose.Types.ObjectId(activeCompanyId),
                deletedAt: null,
            });

            if (!targetShipment) {
                return NextResponse.json(
                    { success: false, message: "Specified shipment was not found" },
                    { status: 404 }
                );
            }

            const existingLinkedInvoice = await Invoice.findOne({
                companyId: new mongoose.Types.ObjectId(activeCompanyId),
                $or: [
                    { _id: targetShipment.invoiceId },
                    { shipmentId: targetShipment._id },
                ],
                status: { $ne: "cancelled" },
                deletedAt: null,
            });

            if (existingLinkedInvoice || targetShipment.invoiceId) {
                const invNumber = existingLinkedInvoice?.invoiceNumber || "previously";
                return NextResponse.json(
                    {
                        success: false,
                        message: `Anti-Duplication Guard: This shipment already has an issued invoice (${invNumber}) and cannot have a duplicate invoice created`,
                    },
                    { status: 409 }
                );
            }

            basePrice = Number(targetShipment.customerPrice || targetShipment.shippingCost || 0);
        } else {
            basePrice = Number(body.subtotal || body.basePrice || body.total || 0);
        }

        if (basePrice <= 0) {
            return NextResponse.json(
                { success: false, message: "Base amount before tax must be greater than zero" },
                { status: 400 }
            );
        }

        const effectiveTaxRate = company.vatRate !== undefined ? Number(company.vatRate) : 15;
        const inputDiscount = Number(body.discount || 0);
        const discount = Math.min(basePrice, Math.max(0, isNaN(inputDiscount) ? 0 : inputDiscount));
        const discountedSubtotal = Math.max(0, basePrice - discount);
        const vatAmount = Math.round(discountedSubtotal * (effectiveTaxRate / 100) * 100) / 100;
        const total = Math.round((discountedSubtotal + vatAmount) * 100) / 100;

        const invoiceNumber = body.invoiceNumber && body.invoiceNumber.trim() !== ""
            ? body.invoiceNumber.trim()
            : `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

        const existingInvNum = await Invoice.findOne({
            invoiceNumber,
            deletedAt: null,
        });

        if (existingInvNum) {
            return NextResponse.json(
                { success: false, message: "Invoice number is already registered in the system" },
                { status: 409 }
            );
        }

        const newInvoice = await Invoice.create({
            invoiceNumber,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            subtotal: basePrice,
            discount,
            vatAmount,
            taxRateSnapshot: effectiveTaxRate,
            total,
            status: body.status || "issued",
            dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
            deletedAt: null,
        });

        if (targetShipment) {
            targetShipment.invoiceId = newInvoice._id;
            await targetShipment.save();
        }

        return NextResponse.json(
            { success: true, message: "Tax invoice created and linked successfully", data: newInvoice },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error occurred while creating invoice",
                error: error.message,
            },
            { status: 500 }
        );
    }
}

