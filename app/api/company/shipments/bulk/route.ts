/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Shipment from "@/models/shipment";
import Order from "@/models/order";
import Company from "@/models/companies";
import Invoice from "@/models/invoice";
import Route from "@/models/route";
import Subscription from "@/models/subscription";
import "@/models/plan";
import { checkPlanFeature } from "@/lib/guards/checkPlanFeature";
import { checkCompanySubscription } from "@/lib/guards/checkCompanySubscription";
import { shipmentCreateValidationSchema } from "@/lib/validations/shipment.schema";
import { orderCreateValidationSchema } from "@/lib/validations/order.schema";

// bulk create shipments and grouped orders
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

        const { role, companyId, id: userId } = session.user as any;

        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "Unauthorized access: Adding shipments is restricted to company accounts" },
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

        const featureCheck = await checkPlanFeature(activeCompanyId, "hasBulkExcelImport");
        if (!featureCheck.isAllowed) {
            return featureCheck.response;
        }

        const body = await req.json();
        const shipmentsInput = Array.isArray(body.shipments) ? body.shipments : [];

        if (shipmentsInput.length === 0) {
            return NextResponse.json(
                { success: false, message: "No shipments provided for import" },
                { status: 400 }
            );
        }

        if (shipmentsInput.length > 200) {
            return NextResponse.json(
                { success: false, message: "Maximum limit is 200 shipments per file to prevent server load" },
                { status: 400 }
            );
        }

        // Subscription Quota Check for Shipments
        const subCheck = await checkCompanySubscription(activeCompanyId, {
            checkQuotaFor: "shipment",
            count: shipmentsInput.length,
        });
        if (!subCheck.isAllowed) {
            return subCheck.response;
        }

        const createdShipments: any[] = [];
        const creationErrors: Array<{ index: number; errors: any }> = [];

        // Count existing shipments for sequential numbering
        const existingShipmentsCount = await Shipment.countDocuments();
        let shipmentSeq = existingShipmentsCount + 1;

        const existingOrdersCount = await Order.countDocuments();
        let orderSeq = existingOrdersCount + 1;

        for (let sIdx = 0; sIdx < shipmentsInput.length; sIdx++) {
            const shipData = shipmentsInput[sIdx];
            const ordersInShipment = Array.isArray(shipData.orders) ? shipData.orders : [];

            if (ordersInShipment.length === 0) {
                creationErrors.push({
                    index: sIdx,
                    errors: { shipment: ["This shipment has no attached orders"] },
                });
                continue;
            }

            const origin = (shipData.origin || "Riyadh").trim();
            const destination = (shipData.destination || "Jeddah").trim();

            // Smart Route Matching
            const matchedRoute = await Route.findOne({
                companyId: new mongoose.Types.ObjectId(activeCompanyId),
                origin: { $regex: new RegExp(`^${origin}$`, "i") },
                destination: { $regex: new RegExp(`^${destination}$`, "i") },
                deletedAt: null,
            }).lean();

            const routeBasePrice = matchedRoute ? Number(matchedRoute.basePrice || 0) : 0;
            const routeId = matchedRoute ? matchedRoute._id : undefined;

            // Process Orders inside this shipment
            let ordersSum = 0;
            const shipmentOrderIds: mongoose.Types.ObjectId[] = [];
            const shipmentErrors: string[] = [];

            for (let oIdx = 0; oIdx < ordersInShipment.length; oIdx++) {
                const ordItem = { ...ordersInShipment[oIdx] };
                ordItem.companyId = activeCompanyId.toString();
                ordItem.createdByUserId = userId.toString();
                ordItem.createdByUserType = "company_user";
                ordItem.source = "bulk_upload";

                const explicitOrderNum = ordItem.orderNumber && String(ordItem.orderNumber).trim();

                let targetOrderId: mongoose.Types.ObjectId | null = null;
                let orderVal = 0;

                if (explicitOrderNum) {
                    const existingDBOrder = await Order.findOne({
                        orderNumber: explicitOrderNum,
                        companyId: new mongoose.Types.ObjectId(activeCompanyId),
                        deletedAt: null,
                    });

                    if (existingDBOrder) {
                        if (existingDBOrder.shipmentId) {
                            shipmentErrors.push(`Order (${explicitOrderNum}) is already merged in another shipment and cannot be re-merged.`);
                            continue;
                        } else {
                            targetOrderId = existingDBOrder._id as mongoose.Types.ObjectId;
                            orderVal = Number(existingDBOrder.orderValue || existingDBOrder.codAmount || 0);
                        }
                    }
                }

                if (!targetOrderId) {
                    // Create new order
                    let finalOrderNum = explicitOrderNum;
                    if (!finalOrderNum) {
                        let autoNum = `ORD-${String(orderSeq).padStart(4, "0")}`;
                        while (await Order.findOne({ orderNumber: autoNum }).lean()) {
                            orderSeq++;
                            autoNum = `ORD-${String(orderSeq).padStart(4, "0")}`;
                        }
                        finalOrderNum = autoNum;
                        orderSeq++;
                    }
                    ordItem.orderNumber = finalOrderNum;

                    // Dummy validate
                    const ordValidation = orderCreateValidationSchema.safeParse(ordItem);
                    if (!ordValidation.success) {
                        const errMsgs = Object.values(ordValidation.error.flatten().fieldErrors).flat().join(", ");
                        shipmentErrors.push(`Order #${oIdx + 1}: ${errMsgs}`);
                        continue;
                    }

                    const validatedOrdData = ordValidation.data;
                    orderVal = Number(validatedOrdData.orderValue || 0);

                    const createdOrderDoc = await Order.create({
                        orderNumber: validatedOrdData.orderNumber,
                        companyId: new mongoose.Types.ObjectId(activeCompanyId),
                        createdByUserId: new mongoose.Types.ObjectId(userId),
                        createdByUserType: "company_user",
                        recipientName: validatedOrdData.recipientName.trim(),
                        recipientPhone: validatedOrdData.recipientPhone.trim(),
                        recipientCity: validatedOrdData.recipientCity.trim(),
                        recipientDistrict: validatedOrdData.recipientDistrict ? validatedOrdData.recipientDistrict.trim() : undefined,
                        recipientAddress: validatedOrdData.recipientAddress.trim(),
                        description: validatedOrdData.description ? validatedOrdData.description.trim() : undefined,
                        quantity: validatedOrdData.quantity ?? 1,
                        weight: Number(validatedOrdData.weight),
                        orderValue: Number(validatedOrdData.orderValue),
                        codAmount: Number(validatedOrdData.codAmount ?? 0),
                        status: "pending",
                        source: "bulk_upload",
                        deletedAt: null,
                    });

                    targetOrderId = createdOrderDoc._id as mongoose.Types.ObjectId;
                }

                if (targetOrderId) {
                    shipmentOrderIds.push(targetOrderId);
                    ordersSum += orderVal;
                }
            }

            if (shipmentErrors.length > 0 && shipmentOrderIds.length === 0) {
                creationErrors.push({
                    index: sIdx,
                    errors: { shipment: shipmentErrors },
                });
                continue;
            }

            // Generate sequential shipmentNumber and waybillNumber
            let autoShipmentNum = `SHP-${String(shipmentSeq).padStart(4, "0")}`;
            while (await Shipment.findOne({ shipmentNumber: autoShipmentNum }).lean()) {
                shipmentSeq++;
                autoShipmentNum = `SHP-${String(shipmentSeq).padStart(4, "0")}`;
            }
            shipmentSeq++;

            const waybillNumber = `WB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

            // Pricing logic: custom price if provided, else ordersSum + routeBasePrice
            const shippingCost = routeBasePrice;
            const customerPrice = shipData.customPrice && Number(shipData.customPrice) > 0
                ? Number(shipData.customPrice)
                : ordersSum + routeBasePrice;

            // Auto-generate invoice
            const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
            const subtotal = customerPrice;
            const vatRate = company.vatRate !== undefined ? Number(company.vatRate) : 15;
            const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
            const total = Math.round((subtotal + vatAmount) * 100) / 100;

            const newInvoice = await Invoice.create({
                invoiceNumber,
                companyId: new mongoose.Types.ObjectId(activeCompanyId),
                subtotal,
                vatAmount,
                taxRateSnapshot: vatRate,
                total,
                status: "issued",
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                deletedAt: null,
            });

            // Create Shipment document
            const newShipment = await Shipment.create({
                shipmentNumber: autoShipmentNum,
                companyId: new mongoose.Types.ObjectId(activeCompanyId),
                type: shipData.type || "ftl",
                origin: origin,
                destination: destination,
                routeId: routeId,
                invoiceId: newInvoice._id,
                ordersCount: shipmentOrderIds.length,
                shippingCost: shippingCost,
                customerPrice: customerPrice,
                waybillNumber: waybillNumber,
                status: "created",
                deletedAt: null,
            });

            // Link orders to newShipment
            if (shipmentOrderIds.length > 0) {
                await Order.updateMany(
                    { _id: { $in: shipmentOrderIds } },
                    {
                        $set: {
                            shipmentId: newShipment._id,
                            status: "grouped",
                        },
                    }
                );
            }

            createdShipments.push(newShipment);
        }

        if (creationErrors.length > 0 && createdShipments.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "All passed shipments contain errors and failed to import",
                    errors: creationErrors,
                },
                { status: 422 }
            );
        }

        // Increment subscription shipment count if active
        if (subCheck.subscription && createdShipments.length > 0) {
            subCheck.subscription.shipmentsUsedThisMonth = (subCheck.subscription.shipmentsUsedThisMonth || 0) + createdShipments.length;
            await subCheck.subscription.save();
        }

        return NextResponse.json(
            {
                success: true,
                message: `Successfully imported and created ${createdShipments.length} shipments and grouped all related orders`,
                count: createdShipments.length,
                data: createdShipments,
            },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error occurred during bulk shipment import",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
