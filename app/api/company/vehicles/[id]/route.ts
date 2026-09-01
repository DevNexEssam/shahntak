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
            return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json({ success: false, message: "غير مصرح لك" }, { status: 403 });
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
            return NextResponse.json({ success: false, message: "لم يتم العثور على المركبة" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: vehicle }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم", error: error.message }, { status: 500 });
    }
}

// update vehicle
export async function PUT(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json({ success: false, message: "غير مصرح لك" }, { status: 403 });
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
            return NextResponse.json({ success: false, message: "لم يتم العثور على المركبة أو لا تملك صلاحية التعديل عليها" }, { status: 404 });
        }

        const body = await req.json();

        delete body.companyId;
        delete body._id;

        const validation = vehicleUpdateValidationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: "بيانات الإدخال غير صالحة", errors: validation.error.flatten().fieldErrors },
                { status: 422 }
            );
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            id,
            { $set: validation.data },
            { new: true, runValidators: true }
        );

        return NextResponse.json({ success: true, message: "تم تحديث بيانات المركبة بنجاح", data: updatedVehicle }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم أثناء تحديث المركبة", error: error.message }, { status: 500 });
    }
}

// delete vehicle
export async function DELETE(req: NextRequest) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً" }, { status: 401 });
        }

        const { role, companyId, id: userId } = session.user as any;
        if (role !== "company") {
            return NextResponse.json({ success: false, message: "غير مصرح لك" }, { status: 403 });
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
            return NextResponse.json({ success: false, message: "لم يتم العثور على المركبة المراد حذفها" }, { status: 404 });
        }

        if (isHardDelete) {
            await Vehicle.deleteOne({ _id: id, companyId: new mongoose.Types.ObjectId(activeCompanyId) });
            return NextResponse.json({ success: true, message: "تم حذف المركبة نهائياً من النظام" }, { status: 200 });
        } else {
            vehicle.deletedAt = new Date();
            vehicle.isActive = false;
            await vehicle.save();
            return NextResponse.json({ success: true, message: "تم أرشفة وتجميد المركبة بنجاح" }, { status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "حدث خطأ في الخادم أثناء حذف المركبة", error: error.message }, { status: 500 });
    }
}
