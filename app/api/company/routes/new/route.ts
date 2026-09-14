/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Route from "@/models/route";
import Company from "@/models/companies";
import { checkPlanFeature } from "@/lib/guards/checkPlanFeature";
import { routeCreateValidationSchema } from "@/lib/validations/route.schema";

// create route
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json({ success: false, message: "Unauthorized access: Adding routes is restricted to company accounts" }, { status: 403 });
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json({ success: false, message: "Invalid company ID" }, { status: 400 });
        }

        const company = await Company.findOne({ _id: activeCompanyId, status: "active", deletedAt: null });
        if (!company) {
            return NextResponse.json({ success: false, message: "Company account is inactive or disabled" }, { status: 403 });
        }

        const subCheck = await checkPlanFeature(activeCompanyId, "hasCustomRoutes");
        if (!subCheck.isAllowed) {
            return subCheck.response;
        }

        const body = await req.json();
        body.companyId = activeCompanyId.toString();
        body.createdBy = userId.toString();

        const validation = routeCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: "Invalid input data", errors: validation.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const data = validation.data;
        const cleanOrigin = data.origin.trim();
        const cleanDestination = data.destination.trim();
        const cleanVehicleType = data.vehicleType.trim();

        const existingRoute = await Route.findOne({
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            origin: cleanOrigin,
            destination: cleanDestination,
            vehicleType: cleanVehicleType,
            deletedAt: null,
        });

        if (existingRoute) {
            return NextResponse.json({ success: false, message: "This route with the specified vehicle type is already registered for your company" }, { status: 409 });
        }

        const newRoute = await Route.create({
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            origin: cleanOrigin,
            destination: cleanDestination,
            vehicleType: cleanVehicleType,
            basePrice: data.basePrice,
            carrierId: data.carrierId ? new mongoose.Types.ObjectId(data.carrierId) : undefined,
            estimatedTransitTime: data.estimatedTransitTime?.trim() || "",
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdBy: new mongoose.Types.ObjectId(userId),
            deletedAt: null,
        });

        return NextResponse.json({ success: true, message: "Logistics route added successfully", data: newRoute }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred while adding route", error: error.message }, { status: 500 });
    }
}
