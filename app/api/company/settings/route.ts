/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/companies";
import Subscription from "@/models/subscription";
import "@/models/plan";

// get settings
export async function GET() {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "يجب تسجيل الدخول أولاً" },
                { status: 401 }
            );
        }

        const { role, companyId, id: userId } = session.user as any;

        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك: استعراض الإعدادات مخصص لحسابات الشركات فقط" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json(
                { success: false, message: "معرف الشركة غير صالح" },
                { status: 400 }
            );
        }

        const company = await Company.findOne({
            _id: activeCompanyId,
            status: "active",
            deletedAt: null,
        }).lean();

        if (!company) {
            return NextResponse.json(
                { success: false, message: "حساب الشركة غير نشط أو تم تعطيله" },
                { status: 403 }
            );
        }

        const subscription = await Subscription.findOne({
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        })
            .populate("planId")
            .lean();

        return NextResponse.json(
            {
                success: true,
                data: {
                    profile: company,
                    subscription: subscription || null,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ أثناء جلب إعدادات الشركة", error: error.message },
            { status: 500 }
        );
    }
}

// update settings
export async function PUT(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "يجب تسجيل الدخول أولاً" },
                { status: 401 }
            );
        }

        const { role, companyId, id: userId } = session.user as any;

        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك: تعديل الإعدادات مخصص لحسابات الشركات فقط" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json(
                { success: false, message: "معرف الشركة غير صالح" },
                { status: 400 }
            );
        }

        const body = await req.json();

        const allowedFields = ["companyName", "phone", "city", "taxNumber", "address", "facilityInfo"];
        const updateData: Record<string, any> = {};

        for (const key of allowedFields) {
            if (body[key] !== undefined) {
                updateData[key] = typeof body[key] === "string" ? body[key].trim() : body[key];
            }
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            activeCompanyId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        return NextResponse.json(
            {
                success: true,
                message: "تم تحديث بيانات وملف الشركة بنجاح",
                data: updatedCompany,
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ أثناء تحديث إعدادات الشركة", error: error.message },
            { status: 500 }
        );
    }
}
