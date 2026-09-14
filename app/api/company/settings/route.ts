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
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        const { role, companyId, id: userId } = session.user as any;

        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "Unauthorized access: Viewing settings is restricted to company accounts" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json(
                { success: false, message: "Invalid company ID" },
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
                { success: false, message: "Company account is inactive or disabled" },
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
            { success: false, message: "Server error occurred while fetching company settings", error: error.message },
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
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }

        const { role, companyId, id: userId } = session.user as any;

        if (role !== "company") {
            return NextResponse.json(
                { success: false, message: "Unauthorized access: Updating settings is restricted to company accounts" },
                { status: 403 }
            );
        }

        const activeCompanyId = companyId || userId;
        if (!mongoose.Types.ObjectId.isValid(activeCompanyId)) {
            return NextResponse.json(
                { success: false, message: "Invalid company ID" },
                { status: 400 }
            );
        }

        const { userRole } = session.user as any;
        if (userRole === "staff") {
            return NextResponse.json(
                { success: false, message: "Unauthorized access: Financial and tax settings modification is disabled for staff accounts" },
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
                { success: false, message: "Company account not found or inactive" },
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
                    { success: false, message: "VAT rate is invalid. Accepted rates are 15% standard or 0% exempt under tax regulations" },
                    { status: 400 }
                );
            }

            const currentTaxNumber = company.taxNumber || body.taxNumber;
            if (parsedRate === 15 && (!currentTaxNumber || currentTaxNumber.trim() === "")) {
                return NextResponse.json(
                    { success: false, message: "Tax Integrity Guard: Company Tax Registration Number (VAT TRN) must be registered and verified first before enabling 15% VAT rate" },
                    { status: 400 }
                );
            }

            if (parsedRate === 0) {
                if (!body.vatExemptionReason || body.vatExemptionReason.trim().length < 3) {
                    return NextResponse.json(
                        { success: false, message: "When selecting 0% (Exempt) VAT rate, an official VAT exemption reason must be selected or specified" },
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
                        { success: false, message: "Tax Integrity Guard (Audit Log): A valid reason for changing the VAT rate must be provided to maintain audit trail logs" },
                        { status: 400 }
                    );
                }

                updateData.vatRate = parsedRate;
                const newAuditLogEntry = {
                    rate: parsedRate,
                    changedAt: new Date(),
                    changedBy: new mongoose.Types.ObjectId(String(userId || (session.user as any).id)),
                    changedByName: session.user.name || session.user.email || "Primary Company Account",
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
                    { success: false, message: "Changing password requires providing both current and new passwords" },
                    { status: 400 }
                );
            }

            if (body.newPassword.length < 6) {
                return NextResponse.json(
                    { success: false, message: "New password must be at least 6 characters long" },
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
                    { success: false, message: "Company account not found or inactive" },
                    { status: 404 }
                );
            }

            const isPasswordValid = await bcrypt.compare(body.currentPassword, companyAccount.password);
            if (!isPasswordValid) {
                return NextResponse.json(
                    { success: false, message: "Current password is incorrect" },
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
                message: body.newPassword ? "Company settings and password updated successfully" : "Company profile and tax rate settings updated successfully",
                data: updatedCompany,
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "Server error occurred while updating company settings", error: error.message },
            { status: 500 }
        );
    }
}
