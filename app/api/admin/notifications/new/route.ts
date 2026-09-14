/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { notificationCreateValidationSchema } from "@/lib/validations";
import Notification from "@/models/notification";
import User from "@/models/user";
import CompanyUser from "@/models/Companyuser";
import { can } from "@/utils/permissions";
import { ACTIVE } from "@/utils/constants";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "notification", "create")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Invalid data format" }, { status: 400 });
        }

        const validation = notificationCreateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({
                success: false,
                message: "Invalid data",
                errors: validation.error.flatten().fieldErrors,
            }, { status: 422 });
        }

        const data = validation.data;
        if (!mongoose.Types.ObjectId.isValid(data.recipientId)) {
            return NextResponse.json({ success: false, message: "Invalid recipient ID" }, { status: 400 });
        }

        await connectDB();

        if (data.recipientType === "user") {
            const recipientExists = await User.findOne({ _id: data.recipientId, ...ACTIVE }).lean();
            if (!recipientExists) {
                return NextResponse.json({ success: false, message: "Notification recipient (User) does not exist" }, { status: 400 });
            }
        } else if (data.recipientType === "company_user") {
            const recipientExists = await CompanyUser.findOne({ _id: data.recipientId, ...ACTIVE }).lean();
            if (!recipientExists) {
                return NextResponse.json({ success: false, message: "Notification recipient (CompanyUser) does not exist" }, { status: 400 });
            }
        }

        const newNotification = await Notification.create({
            recipientType: data.recipientType,
            recipientId: data.recipientId,
            channel: data.channel,
            event: data.event,
            title: data.title,
            body: data.body,
            isRead: data.isRead ?? false,
            sentAt: data.sentAt || new Date(),
        });

        return NextResponse.json({ success: true, message: "Notification sent and saved successfully", data: newNotification }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}
