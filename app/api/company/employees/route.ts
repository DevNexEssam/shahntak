/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import CompanyUser from "@/models/Companyuser";
import Company from "@/models/companies";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // 1️⃣ فحص التوثيق والجلسة
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "يجب تسجيل الدخول أولاً" },
                { status: 401 }
            );
        }

        const { role, companyId, id: userId } = session.user as any;

        // 2️⃣ فحص صلاحية حساب الشركة الحصري
        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك: عرض الموظفين مخصص لحسابات الشركات فقط" },
                { status: 403 }
            );
        }

        // 3️⃣ استخراج والتحقق من معرف الشركة المعزول
        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json(
                { success: false, message: "معرف الشركة غير صالح" },
                { status: 400 }
            );
        }

        // 4️⃣ التأكد من أن حساب الشركة نشط وغير محذوف
        const company = await Company.findOne({
            _id: activeCompanyId,
            status: "active",
            deletedAt: null,
        });

        if (!company) {
            return NextResponse.json(
                { success: false, message: "حساب الشركة غير نشط أو تم تعطيله" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search")?.trim() || "";
        const noPagination = searchParams.get("nopagination") === "true";
        const statusFilter = searchParams.get("status");

        // 5️⃣ بناء فلتر الاستعلام المعزول تلقائياً للشركة الحالية فقط
        const filter: Record<string, any> = {
            companyId: new mongoose.Types.ObjectId(activeCompanyId),
            deletedAt: null,
        };

        if (statusFilter) {
            filter.status = statusFilter;
        }

        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: "i" } },
                { userEmail: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        // 6️⃣ الاستعلام بدون ترقيم عند إرسال nopagination=true
        if (noPagination) {
            const users = await CompanyUser.find(filter)
                .select("-password")
                .populate("companyId", "companyName email")
                .sort({ createdAt: -1 })
                .lean();

            return NextResponse.json(
                { success: true, data: users, count: users.length },
                { status: 200 }
            );
        }

        // 7️⃣ الترقيم الافتراضي والاستعلام المقسم
        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const [users, total, activeCount, inactiveCount] = await Promise.all([
            CompanyUser.find(filter)
                .select("-password")
                .populate("companyId", "companyName email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            CompanyUser.countDocuments(filter),
            CompanyUser.countDocuments({ ...filter, userIsActive: true }),
            CompanyUser.countDocuments({ ...filter, userIsActive: false }),
        ]);

        return NextResponse.json(
            {
                success: true,
                data: users,
                count: users.length,
                stats: {
                    active: activeCount,
                    inactive: inactiveCount,
                    total,
                },
                pagination: {
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    totalRecords: total,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء جلب قائمة الموظفين",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
