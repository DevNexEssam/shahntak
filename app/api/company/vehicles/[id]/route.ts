/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Vehicle from "@/models/vehicle";
import { vehicleUpdateValidationSchema } from "@/lib/validations/vehicle.schema";

// get vehicle
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const activeCompanyId = companyId || userId;
        const { pathname } = new URL(req.url);
        const id = pathname.split("/").pop();

        const vehicle = await Vehicle.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!vehicle) {
            return NextResponse.json({ success: false, message: "Vehicle not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: vehicle }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred while fetching vehicle", error: error.message }, { status: 500 });
    }
}

// update vehicle
export async function PUT(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const activeCompanyId = companyId || userId;
        const { pathname } = new URL(req.url);
        const id = pathname.split("/").pop();

        const vehicle = await Vehicle.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!vehicle) {
            return NextResponse.json({ success: false, message: "Vehicle not found or you do not have permission to update it" }, { status: 404 });
        }

        const body = await req.json();

        delete body.companyId;
        delete body._id;

        const validation = vehicleUpdateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: "Invalid input data", errors: validation.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            id,
            { $set: validation.data },
            { new: true, runValidators: true }
        );

        return NextResponse.json({ success: true, message: "Vehicle updated successfully", data: updatedVehicle }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred while updating vehicle", error: error.message }, { status: 500 });
    }
}

// delete vehicle
export async function DELETE(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const activeCompanyId = companyId || userId;
        const { searchParams, pathname } = new URL(req.url);
        const id = pathname.split("/").pop();
        const isHardDelete = searchParams.get("hard") === "true";

        const vehicle = await Vehicle.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
        });

        if (!vehicle) {
            return NextResponse.json({ success: false, message: "Vehicle to delete not found" }, { status: 404 });
        }

        if (isHardDelete) {
            await Vehicle.deleteOne({ _id: id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            return NextResponse.json({ success: true, message: "Vehicle permanently deleted from system" }, { status: 200 });
        } else {
            vehicle.deletedAt = new Date();
            vehicle.isActive = false;
            await vehicle.save();
            return NextResponse.json({ success: true, message: "Vehicle successfully archived and deactivated" }, { status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred while deleting vehicle", error: error.message }, { status: 500 });
    }
}
