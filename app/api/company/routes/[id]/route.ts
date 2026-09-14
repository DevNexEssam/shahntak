/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Route from "@/models/route";
import { routeUpdateValidationSchema } from "@/lib/validations/route.schema";

// get route
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

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid route ID" }, { status: 400 });
        }

        const route = await Route.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        }).populate("carrierId", "name phone");

        if (!route) {
            return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: route }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred while fetching route", error: error.message }, { status: 500 });
    }
}

// update route
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

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid route ID" }, { status: 400 });
        }

        const existingRoute = await Route.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        });

        if (!existingRoute) {
            return NextResponse.json({ success: false, message: "Route not found or you do not have permission to update it" }, { status: 404 });
        }

        const body = await req.json();
        delete body.companyId;
        delete body._id;

        const validation = routeUpdateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: "Invalid input data", errors: validation.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const updateData: Record<string, any> = { ...validation.data };
        if (updateData.carrierId && mongoose.Types.ObjectId.isValid(updateData.carrierId)) {
            updateData.carrierId = new mongoose.Types.ObjectId(updateData.carrierId);
        } else if (updateData.carrierId === "") {
            updateData.carrierId = null;
        }

        const updatedRoute = await Route.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return NextResponse.json({ success: true, message: "Route updated successfully", data: updatedRoute }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred while updating route", error: error.message }, { status: 500 });
    }
}

// delete route
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

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid route ID" }, { status: 400 });
        }

        const route = await Route.findOne({
            _id: id,
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
        });

        if (!route) {
            return NextResponse.json({ success: false, message: "Route to delete not found" }, { status: 404 });
        }

        if (isHardDelete) {
            await Route.deleteOne({ _id: id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            return NextResponse.json({ success: true, message: "Route permanently deleted from system" }, { status: 200 });
        } else {
            route.deletedAt = new Date();
            route.isActive = false;
            await route.save();
            return NextResponse.json({ success: true, message: "Route successfully archived and deactivated" }, { status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred while deleting route", error: error.message }, { status: 500 });
    }
}
