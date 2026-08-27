/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import CompanyUser from "@/models/Companyuser";
import Order from "@/models/order";
import User from "@/models/user";
import { ACTIVE } from "@/utils/constants";
import { can } from "@/utils/permissions";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET full company user details
export async function GET(_req: Request, context: any) {
    try {
        await connectDB();

        // Check authentication & permissions
        const session = await getServerSession(authOptions);
        const role = session?.user?.role;

        if (!role || !can(role, "companyUser", "read")) {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك بهذا الإجراء" },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "معرف المستخدم غير صالح" },
                { status: 400 }
            );
        }

        const companyUser = await CompanyUser.findOne({ _id: id, ...ACTIVE })
            .select("-password")
            .populate("companyId", "companyName email phone city taxNumber address");

        if (!companyUser) {
            return NextResponse.json(
                { success: false, message: "الموظف غير موجود" },
                { status: 404 }
            );
        }

        const [ordersCount, recentOrders] = await Promise.all([
            Order.countDocuments({ createdByUserId: id }),
            Order.find({ createdByUserId: id })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean(),
        ]);

        // Resolve creator details (with fallbacks to get the exact name)
        let createdByDetails: { _id?: string; name: string; email: string; type: "user" | "company_user" } | undefined = undefined;
        if (companyUser.createdBy && mongoose.Types.ObjectId.isValid(companyUser.createdBy)) {
            if (companyUser.createdByType === "company_user") {
                const creatorCompUser = await CompanyUser.findById(companyUser.createdBy)
                    .select("userName userEmail")
                    .lean();
                if (creatorCompUser) {
                    createdByDetails = {
                        _id: creatorCompUser._id.toString(),
                        name: creatorCompUser.userName,
                        email: creatorCompUser.userEmail,
                        type: "company_user",
                    };
                }
            }
            if (!createdByDetails) {
                const creatorUser = await User.findById(companyUser.createdBy)
                    .select("name email")
                    .lean();
                if (creatorUser) {
                    createdByDetails = {
                        _id: creatorUser._id.toString(),
                        name: creatorUser.name,
                        email: creatorUser.email,
                        type: "user",
                    };
                } else if (companyUser.createdByType !== "company_user") {
                    const creatorCompUser = await CompanyUser.findById(companyUser.createdBy)
                        .select("userName userEmail")
                        .lean();
                    if (creatorCompUser) {
                        createdByDetails = {
                            _id: creatorCompUser._id.toString(),
                            name: creatorCompUser.userName,
                            email: creatorCompUser.userEmail,
                            type: "company_user",
                        };
                    }
                }
            }
        }

        return NextResponse.json(
            {
                success: true,
                companyUser,
                ordersCount,
                recentOrders,
                createdByDetails,
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً", error: error.message },
            { status: 500 }
        );
    }
}
