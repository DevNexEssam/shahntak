/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { routeUpdateValidationSchema } from "@/lib/validations";
import Route from "@/models/route";
import Carrier from "@/models/carrier";
import { ACTIVE } from "@/utils/constants";
import { can } from "@/utils/permissions";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(_req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "route", "read")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid route ID" }, { status: 400 });
        }

        const routeData = await Route.findOne({ _id: id, ...ACTIVE }).populate("carrierId", "name type");
        if (!routeData) {
            return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: routeData }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "route", "update")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid route ID" }, { status: 400 });
        }

        let updates;
        try {
            updates = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Invalid data format" }, { status: 400 });
        }

        const validation = routeUpdateValidationSchema.safeParse(updates);
        if (!validation.success) {
            return NextResponse.json({ success: false, message: "Invalid data", errors: validation.error.flatten().fieldErrors }, { status: 422 });
        }

        const updatePayload: Record<string, any> = { ...validation.data };

        if (updatePayload.carrierId && updatePayload.carrierId.trim() !== "") {
            if (!mongoose.Types.ObjectId.isValid(updatePayload.carrierId)) {
                return NextResponse.json({ success: false, message: "Invalid carrier ID" }, { status: 400 });
            }
            const targetCarrier = await Carrier.findOne({ _id: updatePayload.carrierId, ...ACTIVE }).lean();
            if (!targetCarrier) {
                return NextResponse.json({ success: false, message: "Associated carrier does not exist" }, { status: 400 });
            }
        }

        const updated = await Route.findOneAndUpdate({ _id: id, ...ACTIVE }, updatePayload, { new: true });
        if (!updated) {
            return NextResponse.json({ success: false, message: "Route not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Route updated successfully", data: updated }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        const canSoftDelete = role && can(role, "route", "softDelete");
        const canHardDelete = role && can(role, "route", "delete");

        if (!canSoftDelete && !canHardDelete) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid route ID" }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const isHardDelete = searchParams.get("hard") === "true";

        let deleted;

        if (isHardDelete && canHardDelete) {
            deleted = await Route.findByIdAndDelete(id);
        } else if (canSoftDelete) {
            deleted = await Route.findOneAndUpdate({ _id: id, ...ACTIVE }, { isActive: false, deletedAt: new Date() }, { new: true });
        } else if (canHardDelete) {
            deleted = await Route.findByIdAndDelete(id);
        }

        if (!deleted) {
            return NextResponse.json({ success: false, message: "Route not found or already deleted" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Route deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}
