/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { routeCreateValidationSchema } from "@/lib/validations";
import Route from "@/models/route";
import Carrier from "@/models/carrier";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "route", "create")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Invalid data format" }, { status: 400 });
        }

        const validation = routeCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid data",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        await connectDB();

        if (validation.data.carrierId && validation.data.carrierId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(validation.data.carrierId)) {
                return NextResponse.json({ success: false, message: "Invalid carrier ID" }, { status: 400 });
            }
            const targetCarrier = await Carrier.findOne({ _id: validation.data.carrierId, ...ACTIVE }).lean();
            if (!targetCarrier) {
                return NextResponse.json({ success: false, message: "Associated carrier does not exist" }, { status: 400 });
            }
        }
        const newRoute = await Route.create({
            origin: validation.data.origin,
            destination: validation.data.destination,
            vehicleType: validation.data.vehicleType,
            basePrice: validation.data.basePrice,
            carrierId: validation.data.carrierId || null,
            estimatedTransitTime: validation.data.estimatedTransitTime || "",
            isActive: validation.data.isActive ?? true,
        });

        return NextResponse.json({ success: true, message: "Route created successfully", data: newRoute }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}
