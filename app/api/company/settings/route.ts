/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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

        const { userRole } = session.user as any;
        if (userRole === "staff") {
            return NextResponse.json(
                { success: false, message: "غير مصرح لك: حظر تعديل الإعدادات المالية والضريبية على حسابات الموظفين" },
                { status: 403 }
            );
        }

        const body = await req.json();

        const company = await Company.findOne({
            _id: activeCompanyId,
            status: "active",
            deletedAt: null,
        });

        if (!company) {
            return NextResponse.json(
                { success: false, message: "حساب الشركة غير موجود أو غير نشط" },
                { status: 404 }
            );
        }

        const allowedFields = ["phone", "city", "address", "facilityInfo"];
        const updateData: Record<string, any> = {};

        for (const key of allowedFields) {
            if (body[key] !== undefined) {
                updateData[key] = typeof body[key] === "string" ? body[key].trim() : body[key];
            }
        }

        // Tax Rate &  Settings Validation
        if (body.vatRate !== undefined) {
            const parsedRate = Number(body.vatRate);

            if (parsedRate !== 15 && parsedRate !== 0) {
                return NextResponse.json(
                    { success: false, message: "نسبة ضريبة القيمة المضافة غير مقبولة. النسب المعتمدة هي 15% أساسية أو 0% معفاة وفقاً للائحة " },
                    { status: 400 }
                );
            }

            const currentTaxNumber = company.taxNumber || body.taxNumber;
            if (parsedRate === 15 && (!currentTaxNumber || currentTaxNumber.trim() === "")) {
                return NextResponse.json(
                    { success: false, message: "حماية النزاهة الضريبية: يجب تسجيل وتوثيق الرقم الضريبي للشركة (VAT Registration Number) أولاً لتفعيل نسبة ضريبة 15%" },
                    { status: 400 }
                );
            }

            if (parsedRate === 0) {
                if (!body.vatExemptionReason || body.vatExemptionReason.trim().length < 3) {
                    return NextResponse.json(
                        { success: false, message: "عند اختيار نسبة ضريبة 0% (معفاة)، يجب اختيار أو كتابة سبب الإعفاء الضريبي الرسمي" },
                        { status: 400 }
                    );
                }
                updateData.vatExemptionReason = body.vatExemptionReason.trim();
            } else {
                updateData.vatExemptionReason = "";
            }

            const previousRate = company.vatRate !== undefined ? company.vatRate : 15;
            if (parsedRate !== previousRate) {
                if (!body.vatRateReason || body.vatRateReason.trim().length < 3) {
                    return NextResponse.json(
                        { success: false, message: "حماية النزاهة الضريبية ( Audit Log): يجب إدخال سبب تعديل نسبة الضريبة حتمياً لحفظ السجل التاريخي للتغيير" },
                        { status: 400 }
                    );
                }

                updateData.vatRate = parsedRate;
                const newAuditLogEntry = {
                    rate: parsedRate,
                    changedAt: new Date(),
                    changedBy: new mongoose.Types.ObjectId(String(userId || (session.user as any).id)),
                    changedByName: session.user.name || session.user.email || "حساب الشركة الرئيسي",
                    reason: body.vatRateReason.trim(),
                };

                company.taxRateAuditLog = company.taxRateAuditLog || [];
                company.taxRateAuditLog.unshift(newAuditLogEntry);
                await company.save();
            }
        }

        // Change Password Logic
        if (body.currentPassword || body.newPassword) {
            if (!body.currentPassword || !body.newPassword) {
                return NextResponse.json(
                    { success: false, message: "تغيير كلمة المرور يستوجب إدخال كلمة المرور الحالية والجديدة" },
                    { status: 400 }
                );
            }

            if (body.newPassword.length < 6) {
                return NextResponse.json(
                    { success: false, message: "كلمة المرور الجديدة يجب أن تكون على الأقل 6 أحرف" },
                    { status: 400 }
                );
            }

            const companyAccount = await Company.findOne({
                _id: activeCompanyId,
                status: "active",
                deletedAt: null,
            }).select("+password");

            if (!companyAccount) {
                return NextResponse.json(
                    { success: false, message: "حساب الشركة غير موجود أو غير نشط" },
                    { status: 404 }
                );
            }

            const isPasswordValid = await bcrypt.compare(body.currentPassword, companyAccount.password);
            if (!isPasswordValid) {
                return NextResponse.json(
                    { success: false, message: "كلمة المرور الحالية غير صحيحة" },
                    { status: 400 }
                );
            }

            const hashedNewPassword = await bcrypt.hash(body.newPassword, 10);
            updateData.password = hashedNewPassword;
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            activeCompanyId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        return NextResponse.json(
            {
                success: true,
                message: body.newPassword ? "تم تحديث إعدادات الشركة وكلمة المرور بنجاح" : "تم تحديث بيانات ونسب الضريبة للشركة بنجاح",
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
