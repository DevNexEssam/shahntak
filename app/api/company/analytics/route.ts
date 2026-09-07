/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Invoice from "@/models/invoice";
import Expense from "@/models/expense";
import Shipment from "@/models/shipment";
import Company from "@/models/companies";

export async function GET(req: NextRequest) {
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
                { success: false, message: "غير مصرح لك: جلب التحليلات مخصص لشركات النقل" },
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

        const companyObjId = new mongoose.Types.ObjectId(activeCompanyId);

        // Parse query params
        const { searchParams } = new URL(req.url);
        const tab = searchParams.get("tab") || "summary";
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");

        // Date Range Construction
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        if (startDateParam) {
            startDate = new Date(startDateParam);
        }
        if (endDateParam) {
            endDate = new Date(endDateParam);
            if (endDateParam.length === 10) {
                endDate.setHours(23, 59, 59, 999);
            }
        }

        // Base Queries for models
        const invoiceBase: any = { companyId: companyObjId, deletedAt: null };
        const expenseBase: any = { companyId: companyObjId, deletedAt: null };
        const shipmentBase: any = { companyId: companyObjId, deletedAt: null };

        if (startDate || endDate) {
            invoiceBase.createdAt = {};
            expenseBase.expenseDate = {};
            shipmentBase.createdAt = {};

            if (startDate) {
                invoiceBase.createdAt.$gte = startDate;
                expenseBase.expenseDate.$gte = startDate;
                shipmentBase.createdAt.$gte = startDate;
            }
            if (endDate) {
                invoiceBase.createdAt.$lte = endDate;
                expenseBase.expenseDate.$lte = endDate;
                shipmentBase.createdAt.$lte = endDate;
            }
        }

        // Calculate Previous Period for % change computation
        let prevInvoiceBase: any = null;
        let prevExpenseBase: any = null;

        if (startDate && endDate) {
            const diffMs = endDate.getTime() - startDate.getTime();
            const prevEnd = new Date(startDate.getTime() - 1);
            const prevStart = new Date(prevEnd.getTime() - diffMs);

            prevInvoiceBase = {
                companyId: companyObjId,
                deletedAt: null,
                createdAt: { $gte: prevStart, $lte: prevEnd },
            };
            prevExpenseBase = {
                companyId: companyObjId,
                deletedAt: null,
                expenseDate: { $gte: prevStart, $lte: prevEnd },
            };
        }


        //  SUMMARY (Fixed Executive Top Cards)

        if (tab === "summary") {
            const [
                currentInvoices,
                currentExpenses,
                prevInvoices,
                prevExpenses,
                overdueInvoices,
                companyProfile
            ] = await Promise.all([
                Invoice.find(invoiceBase).select("total status").lean(),
                Expense.find(expenseBase).select("amount category").lean(),
                prevInvoiceBase ? Invoice.find(prevInvoiceBase).select("total").lean() : Promise.resolve([]),
                prevExpenseBase ? Expense.find(prevExpenseBase).select("amount").lean() : Promise.resolve([]),
                Invoice.find({ companyId: companyObjId, status: "overdue", deletedAt: null }).select("total").lean(),
                Company.findById(activeCompanyId).select("vatRate taxNumber name").lean(),
            ]);

            const currentRevenue = currentInvoices.reduce((acc, inv) => acc + Number(inv.total || 0), 0);
            const currentExpensesSum = currentExpenses.reduce((acc, exp) => acc + Number(exp.amount || 0), 0);
            const netProfit = currentRevenue - currentExpensesSum;
            const profitMargin = currentRevenue > 0 ? (netProfit / currentRevenue) * 100 : 0;

            const prevRevenue = prevInvoices.reduce((acc, inv) => acc + Number(inv.total || 0), 0);
            const prevExpensesSum = prevExpenses.reduce((acc, exp) => acc + Number(exp.amount || 0), 0);

            const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
            const expenseChange = prevExpensesSum > 0 ? ((currentExpensesSum - prevExpensesSum) / prevExpensesSum) * 100 : 0;

            const overdueCount = overdueInvoices.length;
            const overdueSum = overdueInvoices.reduce((acc, inv) => acc + Number(inv.total || 0), 0);

            return NextResponse.json({
                success: true,
                tab: "summary",
                data: {
                    revenue: currentRevenue,
                    expenses: currentExpensesSum,
                    netProfit,
                    profitMargin: Math.round(profitMargin * 10) / 10,
                    changes: {
                        revenueChange: Math.round(revenueChange * 10) / 10,
                        expenseChange: Math.round(expenseChange * 10) / 10,
                    },
                    alerts: {
                        overdueCount,
                        overdueSum,
                        taxRegistered: !!companyProfile?.taxNumber,
                        vatRate: companyProfile?.vatRate ?? 15,
                    },
                },
            });
        }


        //  FINANCIAL (الإيرادات والتحصيل)

        if (tab === "financial") {
            const invoices = await Invoice.find(invoiceBase).lean();

            let paidTotal = 0, paidCount = 0;
            let issuedTotal = 0, issuedCount = 0;
            let overdueTotal = 0, overdueCount = 0;

            const monthlyMap: Record<string, number> = {};

            invoices.forEach((inv: any) => {
                const total = Number(inv.total || 0);
                if (inv.status === "paid") {
                    paidTotal += total;
                    paidCount++;
                } else if (inv.status === "issued") {
                    issuedTotal += total;
                    issuedCount++;
                } else if (inv.status === "overdue") {
                    overdueTotal += total;
                    overdueCount++;
                }

                const dateKey = new Date(inv.createdAt || Date.now()).toISOString().substring(0, 7); // YYYY-MM
                monthlyMap[dateKey] = (monthlyMap[dateKey] || 0) + total;
            });

            const totalCount = invoices.length;
            const collectionRate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;
            const avgInvoiceValue = totalCount > 0 ? Math.round((paidTotal + issuedTotal + overdueTotal) / totalCount) : 0;

            const monthlyRevenueChart = Object.keys(monthlyMap).sort().map((month) => ({
                month,
                revenue: monthlyMap[month],
            }));

            return NextResponse.json({
                success: true,
                tab: "financial",
                data: {
                    paidTotal,
                    paidCount,
                    issuedTotal,
                    issuedCount,
                    overdueTotal,
                    overdueCount,
                    collectionRate,
                    avgInvoiceValue,
                    monthlyRevenueChart,
                },
            });
        }


        //  OPERATIONAL (التشغیلي والأسطول)

        if (tab === "operational") {
            const [shipments, invoices, expenses] = await Promise.all([
                Shipment.find(shipmentBase).select("customerPrice shippingCost originCity vehicleId createdAt").lean(),
                Invoice.find(invoiceBase).select("total").lean(),
                Expense.find(expenseBase).select("amount").lean(),
            ]);

            const totalShipments = shipments.length;
            const totalRev = invoices.reduce((acc, inv) => acc + Number(inv.total || 0), 0);
            const totalExp = expenses.reduce((acc, exp) => acc + Number(exp.amount || 0), 0);
            const netProf = totalRev - totalExp;

            const avgProfitPerShipment = totalShipments > 0 ? Math.round((netProf / totalShipments) * 100) / 100 : 0;
            const avgRevPerShipment = totalShipments > 0 ? Math.round((totalRev / totalShipments) * 100) / 100 : 0;

            // Monthly shipments count chart
            const monthlyShipmentsMap: Record<string, number> = {};
            shipments.forEach((s: any) => {
                const monthKey = new Date(s.createdAt || Date.now()).toISOString().substring(0, 7);
                monthlyShipmentsMap[monthKey] = (monthlyShipmentsMap[monthKey] || 0) + 1;
            });

            const monthlyShipmentsChart = Object.keys(monthlyShipmentsMap).sort().map((month) => ({
                month,
                shipmentsCount: monthlyShipmentsMap[month],
            }));

            return NextResponse.json({
                success: true,
                tab: "operational",
                data: {
                    totalShipments,
                    avgProfitPerShipment,
                    avgRevPerShipment,
                    monthlyShipmentsChart,
                },
            });
        }


        //  EXPENSES (المصروفات والنفقات)

        if (tab === "expenses") {
            const [expenses, shipments] = await Promise.all([
                Expense.find(expenseBase).lean(),
                Shipment.find(shipmentBase).select("_id").lean(),
            ]);

            const categoryMap: Record<string, number> = {};
            let totalExpensesSum = 0;
            let inputVatTotal = 0;

            expenses.forEach((exp: any) => {
                const amount = Number(exp.amount || 0);
                totalExpensesSum += amount;
                categoryMap[exp.category] = (categoryMap[exp.category] || 0) + amount;
                if (exp.taxIncluded || exp.taxAmount > 0) {
                    inputVatTotal += exp.taxAmount > 0 ? Number(exp.taxAmount) : Math.round((amount - (amount / 1.15)) * 100) / 100;
                }
            });

            const totalShipments = shipments.length;
            const avgExpensePerShipment = totalShipments > 0 ? Math.round((totalExpensesSum / totalShipments) * 100) / 100 : 0;

            // Categories Chart Array (Top expense categories)
            const categoriesChart = Object.keys(categoryMap).map((cat) => ({
                name: cat,
                value: categoryMap[cat],
                percentage: totalExpensesSum > 0 ? Math.round((categoryMap[cat] / totalExpensesSum) * 100) : 0,
            })).sort((a, b) => b.value - a.value);

            const topExpenseCategory = categoriesChart.length > 0 ? categoriesChart[0].name : "لا يوجد";

            return NextResponse.json({
                success: true,
                tab: "expenses",
                data: {
                    totalExpensesSum,
                    totalExpensesCount: expenses.length,
                    topExpenseCategory,
                    avgExpensePerShipment,
                    inputVatTotal: Math.round(inputVatTotal * 100) / 100,
                    categoriesChart,
                },
            });
        }


        //  TAX (الضريبي - ZATCA VAT Report)

        if (tab === "tax") {
            const [invoices, expenses, company] = await Promise.all([
                Invoice.find(invoiceBase).select("subtotal vatAmount total taxRateSnapshot").lean(),
                Expense.find(expenseBase).select("amount taxIncluded taxAmount").lean(),
                Company.findById(activeCompanyId).select("vatRate taxNumber vatExemptionReason").lean(),
            ]);

            let outputVat = 0;
            invoices.forEach((inv: any) => {
                const snapshot = inv.taxRateSnapshot !== undefined ? Number(inv.taxRateSnapshot) : 15;
                if (snapshot > 0) {
                    const grand = Number(inv.total || 0);
                    const subtotal = inv.subtotal || (grand / (1 + snapshot / 100));
                    outputVat += inv.vatAmount || (grand - subtotal);
                }
            });

            let inputVat = 0;
            expenses.forEach((exp: any) => {
                const amount = Number(exp.amount || 0);
                if (exp.taxIncluded || exp.taxAmount > 0) {
                    inputVat += exp.taxAmount > 0 ? Number(exp.taxAmount) : Math.round((amount - (amount / 1.15)) * 100) / 100;
                }
            });

            outputVat = Math.round(outputVat * 100) / 100;
            inputVat = Math.round(inputVat * 100) / 100;
            const netPayableVat = Math.round((outputVat - inputVat) * 100) / 100;

            return NextResponse.json({
                success: true,
                tab: "tax",
                data: {
                    outputVat,
                    inputVat,
                    netPayableVat,
                    vatRate: company?.vatRate ?? 15,
                    taxNumber: company?.taxNumber || null,
                    vatExemptionReason: company?.vatExemptionReason || null,
                },
            });
        }

        return NextResponse.json(
            { success: false, message: "التبويب المحدد غير معروف" },
            { status: 400 }
        );

    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: "حدث خطأ في الخادم أثناء جلب التحليلات", error: error.message },
            { status: 500 }
        );
    }
}
