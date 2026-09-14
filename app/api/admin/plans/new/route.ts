/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { planCreateValidationSchema } from "@/lib/validations/plan.schema";
import Plan from "@/models/plan";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "company", "create")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Invalid data format" }, { status: 400 });
        }

        const validation = planCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid data",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const data = validation.data;
        await connectDB();

        const exists = await Plan.findOne({ name: data.name, ...ACTIVE }).lean();
        if (exists) {
            return NextResponse.json({ success: false, message: "Plan name is already in use" }, { status: 409 });
        }

        const newPlan = await Plan.create(data);
        return NextResponse.json({ success: true, message: "Plan created successfully", data: newPlan }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}
