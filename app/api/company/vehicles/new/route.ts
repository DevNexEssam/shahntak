/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Vehicle from "@/models/vehicle";
import Company from "@/models/companies";
import { checkCompanySubscription } from "@/lib/guards/checkCompanySubscription";
import { vehicleCreateValidationSchema } from "@/lib/validations/vehicle.schema";

// create vehicle
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
                { success: false, message: "Unauthorized access: Adding vehicles is restricted to company accounts" },
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

        const subCheck = await checkCompanySubscription(activeCompanyId);
        if (!subCheck.isAllowed) {
            return subCheck.response;
        }

        const body = await req.json();

        body.companyId = activeCompanyId.toString();
        body.createdBy = userId.toString();

        const validation = vehicleCreateValidationSchema.safeParse(body);
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

        const data = validation.data;

        const newVehicle = await Vehicle.create({
            type: data.type.trim(),
            capacityWeight: data.capacityWeight,
            capacityVolume: data.capacityVolume,
            isActive: data.isActive ?? true,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            createdBy: new mongoose.Types.ObjectId(userId),
            deletedAt: null,
        });

        return NextResponse.json(
            { success: true, message: "Vehicle added successfully", data: newVehicle },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Server error occurred while adding vehicle",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
