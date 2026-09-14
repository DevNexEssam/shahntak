/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font
} from '@react-pdf/renderer';
import { fixArabicText } from '@/lib/pdf/arabicPdfHelper';

// Register Cairo Font for React-PDF
Font.register({
    family: 'Cairo',
    fonts: [
        {
            src: 'https://cdn.jsdelivr.net/fontsource/fonts/cairo@latest/arabic-400-normal.ttf',
            fontWeight: 'normal',
        },
        {
            src: 'https://cdn.jsdelivr.net/fontsource/fonts/cairo@latest/arabic-700-normal.ttf',
            fontWeight: 'bold',
        },
    ],
});

// Disable hyphenation for Arabic text
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Cairo',
        fontSize: 9,
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
    },
    // Top Bar Header
    brandHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#2563EB',
        paddingBottom: 12,
        marginBottom: 15,
    },
    brandTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E3A8A',
        textAlign: 'right',
    },
    brandSub: {
        fontSize: 9,
        color: '#64748B',
        textAlign: 'right',
        marginTop: 2,
    },
    invoiceMetaBadge: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignItems: 'flex-end',
    },
    invNumberText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1D4ED8',
    },
    invStatusText: {
        fontSize: 9,
        fontWeight: 'bold',
        marginTop: 2,
    },

    // Parties Grid (Company & Customer Info)
    partiesContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginBottom: 15,
        gap: 10,
    },
    partyCard: {
        width: '49%',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 5,
        padding: 10,
    },
    partyHeader: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1E293B',
        borderBottomWidth: 1,
        borderBottomColor: '#CBD5E1',
        paddingBottom: 4,
        marginBottom: 6,
        textAlign: 'right',
    },
    infoRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    infoLabel: {
        fontSize: 8,
        color: '#64748B',
        textAlign: 'right',
    },
    infoVal: {
        fontSize: 8.5,
        fontWeight: 'bold',
        color: '#0F172A',
        textAlign: 'right',
    },

    // Logistics Details Box
    logisticsCard: {
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: '#BAE6FD',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    logisticsTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0369A1',
        borderBottomWidth: 1,
        borderBottomColor: '#E0F2FE',
        paddingBottom: 4,
        marginBottom: 8,
        textAlign: 'right',
    },
    gridThreeCol: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    colItem: {
        width: '32%',
        alignItems: 'flex-end',
    },

    // Table Styling
    table: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 15,
    },
    tableHeader: {
        flexDirection: 'row-reverse',
        backgroundColor: '#1E3A8A',
        padding: 7,
    },
    tableHeaderCell: {
        fontSize: 8.5,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'right',
    },
    tableRow: {
        flexDirection: 'row-reverse',
        padding: 7,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
    },
    tableRowAlt: {
        flexDirection: 'row-reverse',
        padding: 7,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#F8FAFC',
    },
    tableCell: {
        fontSize: 8.5,
        color: '#334155',
        textAlign: 'right',
    },
    col1: { width: '40%' },
    col2: { width: '20%' },
    col3: { width: '20%' },
    col4: { width: '20%' },

    // Financial Totals Summary
    financialSummaryRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    exemptionBox: {
        width: '48%',
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: 5,
        padding: 8,
    },
    exemptionTitle: {
        fontSize: 8.5,
        fontWeight: 'bold',
        color: '#92400E',
        marginBottom: 3,
        textAlign: 'right',
    },
    exemptionText: {
        fontSize: 8,
        color: '#B45309',
        textAlign: 'right',
    },
    summaryCard: {
        width: '48%',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 5,
        padding: 10,
    },
    summaryLine: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        paddingVertical: 2.5,
    },
    grandTotalLine: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        paddingTop: 6,
        marginTop: 4,
        borderTopWidth: 1.5,
        borderTopColor: '#2563EB',
    },
    grandTotalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1E3A8A',
    },
    grandTotalVal: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1D4ED8',
    },

    // Footer & ZATCA Declaration
    footer: {
        position: 'absolute',
        bottom: 25,
        left: 30,
        right: 30,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 8,
        alignItems: 'center',
    },
    footerNotice: {
        fontSize: 7.5,
        color: '#94A3B8',
        textAlign: 'center',
    },
});

interface InvoicePDFDocumentProps {
    invoiceData: any;
}

export const InvoicePDFDocument: React.FC<InvoicePDFDocumentProps> = ({ invoiceData }) => {
    if (!invoiceData) return null;

    const company = invoiceData.companyId || invoiceData.company || {};
    const linkedShipment = invoiceData.shipment || (invoiceData.invoiceShipments && invoiceData.invoiceShipments[0]) || {};
    const routeInfo = linkedShipment.routeId || {};

    const taxRate = Number(invoiceData.taxRateSnapshot ?? invoiceData.taxRate ?? company.vatRate ?? 15);
    const discount = Number(invoiceData.discount || 0);
    const rawTotal = Number(invoiceData.total ?? invoiceData.amount ?? invoiceData.totalAmount ?? 0);
    const rateMultiplier = 1 + (taxRate / 100);

    const shippingCost = Number(linkedShipment.customerPrice || linkedShipment.shippingCost || 0);
    const subtotalVal = Number(invoiceData.subtotal || 0);
    const basePrice = subtotalVal > 0
        ? subtotalVal
        : (shippingCost > 0
            ? shippingCost
            : (rawTotal > 0 ? Math.round(((rawTotal / rateMultiplier) + discount) * 100) / 100 : 0));

    const discountedSubtotal = Math.max(0, basePrice - discount);
    const vatAmount = Number(invoiceData.vatAmount ?? Math.round((discountedSubtotal * (taxRate / 100)) * 100) / 100);
    const finalTotal = Number(invoiceData.total ?? Math.round((discountedSubtotal + vatAmount) * 100) / 100);

    const issueDate = new Date(invoiceData.createdAt || Date.now()).toLocaleDateString('en-US');
    const dueDate = invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('en-US') : 'Upon Receipt';

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid': return 'Paid & Fully Collected';
            case 'issued': return 'Issued - Pending Collection';
            case 'overdue': return 'Overdue';
            case 'cancelled': return 'Cancelled';
            default: return 'Draft Invoice';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return '#059669';
            case 'issued': return '#2563EB';
            case 'overdue': return '#DC2626';
            default: return '#D97706';
        }
    };

    const getShipmentTypeName = (type?: string) => {
        switch (type) {
            case 'ftl': return 'Full Truck Load (FTL)';
            case 'ltl': return 'Less Than Truckload (LTL)';
            case 'local_delivery': return 'Local Last-Mile Delivery';
            default: return 'Freight & Logistics Service';
        }
    };

    return (
        <Document title={`Invoice_${invoiceData.invoiceNumber || 'ZATCA'}`}>
            <Page size="A4" style={styles.page}>

                <View style={styles.brandHeader}>
                    <View>
                        <Text style={styles.brandTitle}>Shahntak Logistics Platform</Text>
                        <Text style={styles.brandSub}>Simplified Tax Invoice & Payment Voucher - Company Portal</Text>
                    </View>
                    <View style={styles.invoiceMetaBadge}>
                        <Text style={styles.invNumberText}>{`Invoice #: ${invoiceData.invoiceNumber || '---'}`}</Text>
                        <Text style={[styles.invStatusText, { color: getStatusColor(invoiceData.status) }]}>
                            {`Status: ${getStatusText(invoiceData.status)}`}
                        </Text>
                    </View>
                </View>

                <View style={styles.partiesContainer}>

                    {/* Company Supplier Info */}
                    <View style={styles.partyCard}>
                        <Text style={styles.partyHeader}>Supplier Entity / Company Details</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Company Name:</Text>
                            <Text style={styles.infoVal}>{company.companyName || 'Freight Carrier Partner'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Tax Number (ZATCA VAT):</Text>
                            <Text style={styles.infoVal}>{company.taxNumber || '310459871200003'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>City & Address:</Text>
                            <Text style={styles.infoVal}>{`${company.city || 'Riyadh'} - ${company.address || 'Saudi Arabia'}`}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Contact / Email:</Text>
                            <Text style={styles.infoVal}>{company.phone || company.email || 'support@shahntak.sa'}</Text>
                        </View>
                    </View>

                    {/* Invoice Meta & Dates */}
                    <View style={styles.partyCard}>
                        <Text style={styles.partyHeader}>Invoice & Due Date Details</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Official Issue Date:</Text>
                            <Text style={styles.infoVal}>{issueDate}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Payment Due Date:</Text>
                            <Text style={styles.infoVal}>{dueDate}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Applied Tax Rate:</Text>
                            <Text style={styles.infoVal}>{`${taxRate}%`}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Payment Currency:</Text>
                            <Text style={styles.infoVal}>Saudi Riyal (SAR)</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.logisticsCard}>
                    <Text style={styles.logisticsTitle}>Logistics & Transport Service Details</Text>

                    <View style={styles.gridThreeCol}>
                        <View style={styles.colItem}>
                            <Text style={styles.infoLabel}>Linked Shipment #:</Text>
                            <Text style={styles.infoVal}>{linkedShipment.shipmentNumber || invoiceData.shipmentNumber || 'General Shipment'}</Text>
                        </View>
                        <View style={styles.colItem}>
                            <Text style={styles.infoLabel}>Waybill Number:</Text>
                            <Text style={styles.infoVal}>{linkedShipment.waybillNumber || 'WB-GENERAL'}</Text>
                        </View>
                        <View style={styles.colItem}>
                            <Text style={styles.infoLabel}>Logistics Shipping Type:</Text>
                            <Text style={styles.infoVal}>{getShipmentTypeName(linkedShipment.type)}</Text>
                        </View>
                    </View>

                    <View style={styles.gridThreeCol}>
                        <View style={styles.colItem}>
                            <Text style={styles.infoLabel}>Transport Route:</Text>
                            <Text style={styles.infoVal}>
                                {`${linkedShipment.origin || routeInfo.origin || 'Riyadh'} ➡️ ${linkedShipment.destination || routeInfo.destination || 'Jeddah'}`}
                            </Text>
                        </View>
                        <View style={styles.colItem}>
                            <Text style={styles.infoLabel}>Registered Route Name:</Text>
                            <Text style={styles.infoVal}>{routeInfo.routeName || 'Direct Route'}</Text>
                        </View>
                        <View style={styles.colItem}>
                            <Text style={styles.infoLabel}>Packages / Orders Count:</Text>
                            <Text style={styles.infoVal}>{`${linkedShipment.ordersCount || 1} Consolidated Package(s)`}</Text>
                        </View>
                    </View>

                    {(linkedShipment.driverName || linkedShipment.carrierName) && (
                        <View style={styles.gridThreeCol}>
                            <View style={styles.colItem}>
                                <Text style={styles.infoLabel}>Driver / Carrier Name:</Text>
                                <Text style={styles.infoVal}>{linkedShipment.driverName || linkedShipment.carrierName || 'Assigned Driver'}</Text>
                            </View>
                            <View style={styles.colItem}>
                                <Text style={styles.infoLabel}>Driver Phone:</Text>
                                <Text style={styles.infoVal}>{linkedShipment.driverPhone || 'Not Registered'}</Text>
                            </View>
                            <View style={styles.colItem}>
                                <Text style={styles.infoLabel}>Shipment Status:</Text>
                                <Text style={styles.infoVal}>{linkedShipment.status || 'Completed'}</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, styles.col1]}>Service Description / Logistics Cost</Text>
                        <Text style={[styles.tableHeaderCell, styles.col2]}>Subtotal Before Tax</Text>
                        <Text style={[styles.tableHeaderCell, styles.col3]}>VAT Amount</Text>
                        <Text style={[styles.tableHeaderCell, styles.col4]}>Total Incl. VAT</Text>
                    </View>

                    {/* Freight Row */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.col1]}>Consolidated Freight & Transport Service Charges</Text>
                        <Text style={[styles.tableCell, styles.col2]}>{`${basePrice.toFixed(2)} SAR`}</Text>
                        <Text style={[styles.tableCell, styles.col3]}>{`${(basePrice * (taxRate / 100)).toFixed(2)} SAR`}</Text>
                        <Text style={[styles.tableCell, styles.col4]}>{`${(basePrice * (1 + taxRate / 100)).toFixed(2)} SAR`}</Text>
                    </View>

                    {/* Discount Row (If Any) */}
                    {discount > 0 && (
                        <View style={styles.tableRowAlt}>
                            <Text style={[styles.tableCell, styles.col1]}>Applied Trade / Cash Discount</Text>
                            <Text style={[styles.tableCell, styles.col2]}>{`-${discount.toFixed(2)} SAR`}</Text>
                            <Text style={[styles.tableCell, styles.col3]}>0.00 SAR</Text>
                            <Text style={[styles.tableCell, styles.col4]}>{`-${discount.toFixed(2)} SAR`}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.financialSummaryRow}>

                    {/* Exemption Notice or Notes */}
                    <View style={styles.exemptionBox}>
                        {taxRate === 0 && (invoiceData.vatExemptionReason || company.vatExemptionReason) ? (
                            <View>
                                <Text style={styles.exemptionTitle}>Official VAT Exemption Notice (ZATCA):</Text>
                                <Text style={styles.exemptionText}>
                                    {invoiceData.vatExemptionReason || company.vatExemptionReason || 'Exempted per executive regulations'}
                                </Text>
                            </View>
                        ) : (
                            <View>
                                <Text style={styles.exemptionTitle}>Financial Terms & Conditions:</Text>
                                <Text style={styles.exemptionText}>
                                    This invoice is issued electronically and serves as an official due payment voucher for the carrier company account.
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Financial Summary Calculation Card */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryLine}>
                            <Text style={styles.infoLabel}>Base Subtotal (Before Discount):</Text>
                            <Text style={styles.infoVal}>{`${basePrice.toFixed(2)} SAR`}</Text>
                        </View>

                        {discount > 0 && (
                            <View style={styles.summaryLine}>
                                <Text style={styles.infoLabel}>Applied Discount Amount:</Text>
                                <Text style={styles.infoVal}>{`-${discount.toFixed(2)} SAR`}</Text>
                            </View>
                        )}

                        <View style={styles.summaryLine}>
                            <Text style={styles.infoLabel}>Taxable Subtotal:</Text>
                            <Text style={styles.infoVal}>{`${discountedSubtotal.toFixed(2)} SAR`}</Text>
                        </View>

                        <View style={styles.summaryLine}>
                            <Text style={styles.infoLabel}>{`Value Added Tax (${taxRate}%):`}</Text>
                            <Text style={styles.infoVal}>{`${vatAmount.toFixed(2)} SAR`}</Text>
                        </View>

                        <View style={styles.grandTotalLine}>
                            <Text style={styles.grandTotalLabel}>Final Total Amount Due:</Text>
                            <Text style={styles.grandTotalVal}>{`${finalTotal.toFixed(2)} SAR`}</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerNotice}>
                        Official certified document issued by Shahntak Logistics Platform © 2026 - All Rights Reserved
                    </Text>
                </View>

            </Page>
        </Document>
    );
};
