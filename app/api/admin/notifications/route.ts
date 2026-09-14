/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { can } from "@/utils/permissions";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "notification", "read")) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const recipientId = searchParams.get("recipientId");
        const channel = searchParams.get("channel");
        const noPagination = searchParams.get("nopagination") === "true";

        const filter: Record<string, any> = {};
        if (recipientId) filter.recipientId = recipientId;
        if (channel) filter.channel = channel;

        if (noPagination) {
            const notifications = await Notification.find(filter).sort({ createdAt: -1 });
            return NextResponse.json({ success: true, data: notifications, count: notifications.length }, { status: 200 });
        }

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Notification.countDocuments(filter);

        return NextResponse.json({ success: true, data: notifications, count: notifications.length, total }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Server error occurred, please try again later", error: error.message }, { status: 500 });
    }
}
