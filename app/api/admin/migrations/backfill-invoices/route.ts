/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/invoice";

// Migration script to backfill legacy invoices with taxRateSnapshot = 15 and computed subtotal & vatAmount
export async function POST() {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً" }, { status: 401 });
        }

        const { role } = session.user as any;
        if (role !== "super_admin" && role !== "company") {
            return NextResponse.json({ success: false, message: "غير مصرح لك بتشغيل سكريبت الترقية" }, { status: 403 });
        }

        const legacyInvoices = await Invoice.find({
            $or: [
                { taxRateSnapshot: { $exists: false } },
                { taxRateSnapshot: null },
                { subtotal: { $exists: false } },
                { vatAmount: { $exists: false } },
            ],
        });

        let updatedCount = 0;

        for (const inv of legacyInvoices) {
            const taxRateSnapshot = inv.taxRateSnapshot !== undefined ? inv.taxRateSnapshot : 15;
            const discount = inv.discount || 0;
            const total = inv.total || 0;

            const rateMultiplier = 1 + (taxRateSnapshot / 100);
            const subtotal = Math.round(((total / rateMultiplier) + discount) * 100) / 100;
            const discountedSubtotal = Math.max(0, subtotal - discount);
            const vatAmount = Math.round(discountedSubtotal * (taxRateSnapshot / 100) * 100) / 100;

            await Invoice.updateOne(
                { _id: inv._id },
                {
                    $set: {
                        taxRateSnapshot,
                        subtotal,
                        discount,
                        vatAmount,
                        total,
                    },
                }
            );
            updatedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `تم ترقية وترميم ${updatedCount} فاتورة تاريخية وتثبيت نسبتها الضريبية على (15%) بنجاح`,
            migratedInvoicesCount: updatedCount,
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "فشل سكريبت ترقية الفواتير", error: error.message }, { status: 500 });
    }
}
