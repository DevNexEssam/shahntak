/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { orderCreateValidationSchema } from "@/lib/validations";
import Order from "@/models/order";
import Company from "@/models/companies";
import CompanyUser from "@/models/Companyuser";
import Shipment from "@/models/shipment";
import User from "@/models/user";
import Subscription from "@/models/subscription";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
import mongoose from "mongoose";

// POST create new order
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;
        const sessionUserId = (session?.user as any)?.id || (session?.user as any)?._id;

        if (!role || !can(role, "order", "create")) {
            return NextResponse.json(
                { success: false, message: "Unauthorized action" },
                { status: 403 }
            );
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid data format" },
                { status: 400 }
            );
        }

        const validation = orderCreateValidationSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid data",
                    errors: validation.error.flatten().fieldErrors,
                },
                { status: 422 }
            );
        }

        const data = validation.data;

        if (!mongoose.Types.ObjectId.isValid(data.companyId)) {
            return NextResponse.json(
                { success: false, message: "Invalid company ID" },
                { status: 400 }
            );
        }

        await connectDB();

        const targetCompany = await Company.findOne({ _id: data.companyId, ...ACTIVE }).lean();
        if (!targetCompany) {
            return NextResponse.json({ success: false, message: "Associated company does not exist" }, { status: 400 });
        }

        // Subscription Quota Check
        const activeSub: any = await Subscription.findOne({ companyId: data.companyId, status: "active", ...ACTIVE }).populate("planId");
        if (activeSub && activeSub.planId) {
            const maxOrders = activeSub.planId.maxOrdersPerMonth;
            if (maxOrders !== -1 && (activeSub.ordersUsedThisMonth || 0) >= maxOrders) {
                return NextResponse.json({
                    success: false,
                    message: `Company has reached the maximum allowed monthly orders limit for its plan (${maxOrders} orders). Please upgrade the subscription.`
                }, { status: 403 });
            }
        }

        // Resolve creator: check CompanyUser -> User (Admin/SuperAdmin) -> Session User
        let creatorId: string | null = null;
        let createdByUserType: "user" | "company_user" = "user";

        const candidateId = data.createdByUserId && mongoose.Types.ObjectId.isValid(data.createdByUserId)
            ? data.createdByUserId
            : null;

        if (candidateId) {
            const companyUserDoc = await CompanyUser.findOne({ _id: candidateId, ...ACTIVE }).lean();
            if (companyUserDoc) {
                creatorId = candidateId;
                createdByUserType = "company_user";
            } else {
                const userDoc = await User.findById(candidateId).lean();
                if (userDoc) {
                    creatorId = candidateId;
                    createdByUserType = "user";
                }
            }
        }

        // Fallback to session user if not resolved yet
        if (!creatorId && sessionUserId && mongoose.Types.ObjectId.isValid(sessionUserId)) {
            const adminUserDoc = await User.findById(sessionUserId).lean();
            if (adminUserDoc) {
                creatorId = sessionUserId;
                createdByUserType = "user";
            } else {
                const compUserDoc = await CompanyUser.findOne({ _id: sessionUserId, ...ACTIVE }).lean();
                if (compUserDoc) {
                    creatorId = sessionUserId;
                    createdByUserType = "company_user";
                }
            }
        }

        if (!creatorId) {
            return NextResponse.json(
                { success: false, message: "Failed to resolve order creator account" },
                { status: 400 }
            );
        }

        if (data.shipmentId && data.shipmentId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(data.shipmentId)) {
                return NextResponse.json({ success: false, message: "Invalid shipment ID" }, { status: 400 });
            }
            const targetShipment = await Shipment.findOne({ _id: data.shipmentId, ...ACTIVE }).lean();
            if (!targetShipment) {
                return NextResponse.json({ success: false, message: "Associated shipment does not exist" }, { status: 400 });
            }
        }

        // Mandatory auto-generation of orderNumber based on sequential order count in database
        const count = await Order.countDocuments();
        let seq = count + 1;
        let finalOrderNumber = `ORD-${String(seq).padStart(4, "0")}`;
        while (await Order.findOne({ orderNumber: finalOrderNumber }).lean()) {
            seq++;
            finalOrderNumber = `ORD-${String(seq).padStart(4, "0")}`;
        }

        const newOrder = await Order.create({
            orderNumber: finalOrderNumber,
            companyId: data.companyId,
            shipmentId: data.shipmentId || null,
            createdByUserId: creatorId,
            createdByUserType: createdByUserType,
            recipientName: data.recipientName,
            recipientPhone: data.recipientPhone,
            recipientCity: data.recipientCity,
            recipientDistrict: data.recipientDistrict || "",
            recipientAddress: data.recipientAddress,
            description: data.description || "",
            quantity: data.quantity || 1,
            weight: data.weight,
            orderValue: data.orderValue,
            codAmount: data.codAmount || 0,
            status: data.status || "pending",
        });

        if (activeSub) {
            activeSub.ordersUsedThisMonth = (activeSub.ordersUsedThisMonth || 0) + 1;
            await activeSub.save();
        }

        return NextResponse.json(
            { success: true, message: "Order created successfully", data: newOrder },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred, please try again later", error: error.message },
            { status: 500 }
        );
    }
}
