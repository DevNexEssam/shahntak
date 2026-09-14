/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { planUpdateValidationSchema } from "@/lib/validations/plan.schema";
import Plan from "@/models/plan";
import Subscription from "@/models/subscription";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
import mongoose from "mongoose";

// GET single plan by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid plan ID" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const role = session?.user?.role;
        if (!role || !can(role, "company", "read")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        await connectDB();

        const plan = await Plan.findOne({ _id: id, ...ACTIVE }).lean();

        if (!plan) {
            return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: plan });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}

// PATCH update plan by ID
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid plan ID" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const role = session?.user?.role;
        if (!role || !can(role, "company", "update")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Invalid data format" }, { status: 400 });
        }

        const validation = planUpdateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid data",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const updates = validation.data;
        await connectDB();

        const plan = await Plan.findOne({ _id: id, ...ACTIVE });
        if (!plan) {
            return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 });
        }

        if (updates.name && updates.name !== plan.name) {
            const nameExists = await Plan.findOne({ name: updates.name, _id: { $ne: id }, ...ACTIVE }).lean();
            if (nameExists) {
                return NextResponse.json({ success: false, message: "Plan name is already in use" }, { status: 409 });
            }
        }

        Object.assign(plan, updates);
        await plan.save();

        return NextResponse.json({ success: true, message: "Plan updated successfully", data: plan });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}

// DELETE plan by ID (Soft delete / Hard delete)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid plan ID" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const role = session?.user?.role;
        if (!role || !can(role, "company", "delete")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const isHardDelete = searchParams.get("hard") === "true";

        await connectDB();

        const plan = await Plan.findOne({ _id: id, ...ACTIVE });
        if (!plan) {
            return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 });
        }

        // Guard Scenario 1: Block deletion if active company subscriptions exist for this plan
        const activeSubscriptionsCount = await Subscription.countDocuments({
            planId: new mongoose.Types.ObjectId(id),
            status: "active",
            deletedAt: null,
        });

        if (activeSubscriptionsCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Cannot delete plan: (${activeSubscriptionsCount}) company currently has an active subscription to this plan. Please transfer these companies to another plan first or disable the plan instead of deleting it.`,
                    activeSubscriptionsCount,
                },
                { status: 409 }
            );
        }

        if (isHardDelete) {
            await Plan.deleteOne({ _id: id });
            return NextResponse.json({ success: true, message: "Plan permanently deleted" });
        } else {
            plan.deletedAt = new Date();
            await plan.save();
            return NextResponse.json({ success: true, message: "Plan archived successfully" });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}
