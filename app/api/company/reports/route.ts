/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/order";
import Shipment from "@/models/shipment";
import Invoice from "@/models/invoice";
import Vehicle from "@/models/vehicle";
import CompanyUser from "@/models/Companyuser";
import Company from "@/models/companies";

// get reports
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
                { success: false, message: "غير مصرح لك: تصفح التقارير مخصص لحسابات الشركات فقط" },
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
        });

        if (!company) {
            return NextResponse.json(
                { success: false, message: "حساب الشركة غير نشط أو تم تعطيله" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const reportType = searchParams.get("type") || "overview";

        const companyObjId = new mongoose.Types.ObjectId(activeCompanyId);
        const baseFilter = { companyId: companyObjId, deletedAt: null };

        let resultData: Record<string, any> = {};

        if (reportType === "operations" || reportType === "overview") {
            const [
                totalOrders,
                pendingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                orderFinancials,
                totalShipments,
                inTransitShipments,
                deliveredShipments,
                ftlShipments,
                ltlShipments,
                localShipments,
                shipmentFinancials,
            ] = await Promise.all([
                Order.countDocuments(baseFilter),
                Order.countDocuments({ ...baseFilter, status: "pending" }),
                Order.countDocuments({ ...baseFilter, status: "shipped" }),
                Order.countDocuments({ ...baseFilter, status: "delivered" }),
                Order.countDocuments({ ...baseFilter, status: "cancelled" }),
                Order.aggregate([
                    { $match: baseFilter },
                    {
                        $group: {
                            _id: null,
                            totalOrderValue: { $sum: "$orderValue" },
                            totalCodAmount: { $sum: "$codAmount" },
                        },
                    },
                ]),
                Shipment.countDocuments(baseFilter),
                Shipment.countDocuments({ ...baseFilter, status: "in_transit" }),
                Shipment.countDocuments({ ...baseFilter, status: "delivered" }),
                Shipment.countDocuments({ ...baseFilter, type: "ftl" }),
                Shipment.countDocuments({ ...baseFilter, type: "ltl" }),
                Shipment.countDocuments({ ...baseFilter, type: "local_delivery" }),
                Shipment.aggregate([
                    { $match: baseFilter },
                    {
                        $group: {
                            _id: null,
                            totalShippingCost: { $sum: "$shippingCost" },
                            totalCustomerPrice: { $sum: "$customerPrice" },
                        },
                    },
                ]),
            ]);

            resultData.orders = {
                total: totalOrders,
                pending: pendingOrders,
                shipped: shippedOrders,
                delivered: deliveredOrders,
                cancelled: cancelledOrders,
                totalValue: orderFinancials[0]?.totalOrderValue || 0,
                totalCod: orderFinancials[0]?.totalCodAmount || 0,
                successRate: totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0,
            };

            resultData.shipments = {
                total: totalShipments,
                inTransit: inTransitShipments,
                delivered: deliveredShipments,
                ftl: ftlShipments,
                ltl: ltlShipments,
                localDelivery: localShipments,
                totalCost: shipmentFinancials[0]?.totalShippingCost || 0,
                totalPrice: shipmentFinancials[0]?.totalCustomerPrice || 0,
            };
        }

        if (reportType === "financial" || reportType === "overview") {
            const [
                totalInvoices,
                paidInvoices,
                issuedInvoices,
                overdueInvoices,
                invoiceFinancials,
                orderCod,
            ] = await Promise.all([
                Invoice.countDocuments(baseFilter),
                Invoice.countDocuments({ ...baseFilter, status: "paid" }),
                Invoice.countDocuments({ ...baseFilter, status: "issued" }),
                Invoice.countDocuments({ ...baseFilter, status: "overdue" }),
                Invoice.aggregate([
                    { $match: baseFilter },
                    {
                        $group: {
                            _id: null,
                            totalInvoicedAmount: { $sum: "$total" },
                        },
                    },
                ]),
                Order.aggregate([
                    { $match: baseFilter },
                    {
                        $group: {
                            _id: null,
                            totalCod: { $sum: "$codAmount" },
                        },
                    },
                ]),
            ]);

            resultData.invoices = {
                total: totalInvoices,
                paid: paidInvoices,
                issued: issuedInvoices,
                overdue: overdueInvoices,
                totalInvoiced: invoiceFinancials[0]?.totalInvoicedAmount || 0,
                collectionRate: totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0,
                totalCod: orderCod[0]?.totalCod || 0,
            };
        }

        if (reportType === "fleet" || reportType === "overview") {
            const [
                totalVehicles,
                activeVehicles,
                totalEmployees,
                activeEmployees,
            ] = await Promise.all([
                Vehicle.countDocuments(baseFilter),
                Vehicle.countDocuments({ ...baseFilter, isActive: true }),
                CompanyUser.countDocuments(baseFilter),
                CompanyUser.countDocuments({ ...baseFilter, userIsActive: true }),
            ]);

            resultData.vehicles = {
                total: totalVehicles,
                active: activeVehicles,
                inactive: totalVehicles - activeVehicles,
                utilizationRate: totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0,
            };

            resultData.employees = {
                total: totalEmployees,
                active: activeEmployees,
                inactive: totalEmployees - activeEmployees,
            };
        }

        return NextResponse.json(
            {
                success: true,
                type: reportType,
                data: resultData,
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "حدث خطأ في الخادم أثناء جلب التقارير",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
