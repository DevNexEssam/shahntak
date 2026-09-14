/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { carrierCreateValidationSchema } from "@/lib/validations";
import Carrier from "@/models/carrier";
import { can } from "@/utils/permissions";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "carrier", "create")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Invalid data format" }, { status: 400 });
        }

        const validation = carrierCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid data",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        await connectDB();
        const exists = await Carrier.findOne({ name: validation.data.name }).lean();
        if (exists) {
            return NextResponse.json({ success: false, message: "Carrier name is already in use" }, { status: 409 });
        }

        const newCarrier = await Carrier.create(validation.data);
        return NextResponse.json({ success: true, message: "Carrier created successfully", data: newCarrier }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error, please try again later", error: error.message }, { status: 500 });
    }
}
