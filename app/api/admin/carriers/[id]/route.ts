/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import { carrierUpdateValidationSchema } from "@/lib/validations";
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

        if (!role || !can(role, "carrier", "read")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid carrier ID" }, { status: 400 });
        }

        const carrier = await Carrier.findOne({ _id: id, ...ACTIVE });
        if (!carrier) {
            return NextResponse.json({ success: false, message: "Carrier not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: carrier }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error, please try again later", error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "carrier", "update")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid carrier ID" }, { status: 400 });
        }

        let updates;
        try {
            updates = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Invalid data format" }, { status: 400 });
        }

        const validation = carrierUpdateValidationSchema.safeParse(updates);
        if (!validation.success) {
            return NextResponse.json({ success: false, message: "Invalid data", errors: validation.error.flatten().fieldErrors }, { status: 422 });
        }

        const updated = await Carrier.findOneAndUpdate({ _id: id, ...ACTIVE }, validation.data, { new: true });
        if (!updated) {
            return NextResponse.json({ success: false, message: "Carrier not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Carrier updated successfully", data: updated }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error, please try again later", error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: any) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        const canSoftDelete = role && can(role, "carrier", "softDelete");
        const canHardDelete = role && can(role, "carrier", "delete");

        if (!canSoftDelete && !canHardDelete) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid carrier ID" }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const isHardDelete = searchParams.get("hard") === "true";

        let deleted;

        if (isHardDelete && canHardDelete) {
            deleted = await Carrier.findByIdAndDelete(id);
        } else if (canSoftDelete) {
            deleted = await Carrier.findOneAndUpdate({ _id: id, ...ACTIVE }, { isActive: false, deletedAt: new Date() }, { new: true });
        } else if (canHardDelete) {
            deleted = await Carrier.findByIdAndDelete(id);
        }

        if (!deleted) {
            return NextResponse.json({ success: false, message: "Carrier not found or already deleted" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Carrier deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error, please try again later", error: error.message }, { status: 500 });
    }
}
