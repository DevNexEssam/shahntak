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

    const issueDate = new Date(invoiceData.createdAt || Date.now()).toLocaleDateString('ar-SA');
    const dueDate = invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('ar-SA') : 'عند الاستلام';

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid': return 'مسدد ومحصل بالكامل';
            case 'issued': return 'صادرة بانتظار التحصيل';
            case 'overdue': return 'متأخرة السداد';
            case 'cancelled': return 'ملغاة';
            default: return 'مسودة فاتورة';
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
            case 'ftl': return 'شحن نقل كامل (FTL)';
            case 'ltl': return 'شحن طرود جزئية (LTL)';
            case 'local_delivery': return 'توصيل محلي للميل الأخير';
            default: return 'خدمة نقل شحن لوجستي';
        }
    };

    return (
        <Document title={`Invoice_${invoiceData.invoiceNumber || 'ZATCA'}`}>
            <Page size="A4" style={styles.page}>

                {/* 1. Header Banner */}
                <View style={styles.brandHeader}>
                    <View>
                        <Text style={styles.brandTitle}>{fixArabicText('منصة شحنتك اللوجستية')}</Text>
                        <Text style={styles.brandSub}>{fixArabicText('فاتورة ضريبية مبسطة وسند تحصيل - بوابة الشركات')}</Text>
                    </View>
                    <View style={styles.invoiceMetaBadge}>
                        <Text style={styles.invNumberText}>{fixArabicText(`فاتورة #: ${invoiceData.invoiceNumber || '---'}`)}</Text>
                        <Text style={[styles.invStatusText, { color: getStatusColor(invoiceData.status) }]}>
                            {fixArabicText(`الحالة: ${getStatusText(invoiceData.status)}`)}
                        </Text>
                    </View>
                </View>

                {/* 2. Parties Info Grid (Issuer Company & Dates) */}
                <View style={styles.partiesContainer}>

                    {/* Company Supplier Info */}
                    <View style={styles.partyCard}>
                        <Text style={styles.partyHeader}>{fixArabicText('بيانات المنشأة الموردة / الشركة')}</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{fixArabicText('اسم الشركة:')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(company.companyName || 'شركة الشحن المشتركة')}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{fixArabicText('الرقم الضريبي (ZATCA VAT):')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(company.taxNumber || '310459871200003')}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{fixArabicText('المدينة والعنوان:')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(`${company.city || 'الرياض'} - ${company.address || 'المملكة العربية السعودية'}`)}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{fixArabicText('رقم التواصل / البريد:')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(company.phone || company.email || 'support@shahntak.sa')}</Text>
                        </View>
                    </View>

                    {/* Invoice Meta & Dates */}
                    <View style={styles.partyCard}>
                        <Text style={styles.partyHeader}>{fixArabicText('بيانات الفاتورة والاستحقاق')}</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{fixArabicText('تاريخ الإصدار الرسمي:')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(issueDate)}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{fixArabicText('تاريخ الاستحقاق:')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(dueDate)}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{fixArabicText('نسبة الضريبة المطبقة:')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(`${taxRate}%`)}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{fixArabicText('عملة السداد:')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText('ريال سعودي (SAR)')}</Text>
                        </View>
                    </View>

                </View>

                {/* 3. Detailed Logistics & Shipment Card */}
                <View style={styles.logisticsCard}>
                    <Text style={styles.logisticsTitle}>{fixArabicText('تفاصيل الخدمة اللوجستية والنقل المربوط بالفاتورة')}</Text>

                    <View style={styles.gridThreeCol}>
                        <View style={styles.colItem}>
                            <Text style={styles.infoLabel}>{fixArabicText('رقم الشحنة المربوطة:')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(linkedShipment.shipmentNumber || invoiceData.shipmentNumber || 'شحنة عامة')}</Text>
                        </View>
                        <View style={styles.colItem}>
                            <Text style={styles.infoLabel}>{fixArabicText('رقم بوليصة الشحن (Waybill):')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(linkedShipment.waybillNumber || 'WB-GENERAL')}</Text>
                        </View>
                        <View style={styles.colItem}>
                            <Text style={styles.infoLabel}>{fixArabicText('نوع الشحن اللوجستي:')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(getShipmentTypeName(linkedShipment.type))}</Text>
                        </View>
                    </View>

                    <View style={styles.gridThreeCol}>
                        <View style={styles.colItem}>
                            <Text style={styles.infoLabel}>{fixArabicText('مسار السير والاتجاه:')}</Text>
                            <Text style={styles.infoVal}>
                                {fixArabicText(`${linkedShipment.origin || routeInfo.origin || 'الرياض'} ⬅️ ${linkedShipment.destination || routeInfo.destination || 'جدة'}`)}
                            </Text>
                        </View>
                        <View style={styles.colItem}>
                            <Text style={styles.infoLabel}>{fixArabicText('اسم المسار المسجل:')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(routeInfo.routeName || 'خط سير مباشر')}</Text>
                        </View>
                        <View style={styles.colItem}>
                            <Text style={styles.infoLabel}>{fixArabicText('عدد الطرود والطلبات:')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(`${linkedShipment.ordersCount || 1} طرد مجمع`)}</Text>
                        </View>
                    </View>

                    {(linkedShipment.driverName || linkedShipment.carrierName) && (
                        <View style={styles.gridThreeCol}>
                            <View style={styles.colItem}>
                                <Text style={styles.infoLabel}>{fixArabicText('اسم السائق / الناقل:')}</Text>
                                <Text style={styles.infoVal}>{fixArabicText(linkedShipment.driverName || linkedShipment.carrierName || 'سائق معتمد')}</Text>
                            </View>
                            <View style={styles.colItem}>
                                <Text style={styles.infoLabel}>{fixArabicText('هاتف السائق:')}</Text>
                                <Text style={styles.infoVal}>{fixArabicText(linkedShipment.driverPhone || 'غير مسجل')}</Text>
                            </View>
                            <View style={styles.colItem}>
                                <Text style={styles.infoLabel}>{fixArabicText('حالة الشحنة الحالية:')}</Text>
                                <Text style={styles.infoVal}>{fixArabicText(linkedShipment.status || 'مكتملة')}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* 4. Detailed Financial & ZATCA Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, styles.col1]}>{fixArabicText('بيان الخدمة / التكلفة اللوجستية')}</Text>
                        <Text style={[styles.tableHeaderCell, styles.col2]}>{fixArabicText('المبلغ قبل الضريبة')}</Text>
                        <Text style={[styles.tableHeaderCell, styles.col3]}>{fixArabicText('الضريبة (VAT)')}</Text>
                        <Text style={[styles.tableHeaderCell, styles.col4]}>{fixArabicText('الإجمالي شامل الضريبة')}</Text>
                    </View>

                    {/* Freight Row */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.col1]}>{fixArabicText('أجور نقل وشحن لوجستي مجمع')}</Text>
                        <Text style={[styles.tableCell, styles.col2]}>{fixArabicText(`${basePrice.toFixed(2)} ر.س`)}</Text>
                        <Text style={[styles.tableCell, styles.col3]}>{fixArabicText(`${(basePrice * (taxRate / 100)).toFixed(2)} ر.س`)}</Text>
                        <Text style={[styles.tableCell, styles.col4]}>{fixArabicText(`${(basePrice * (1 + taxRate / 100)).toFixed(2)} ر.س`)}</Text>
                    </View>

                    {/* Discount Row (If Any) */}
                    {discount > 0 && (
                        <View style={styles.tableRowAlt}>
                            <Text style={[styles.tableCell, styles.col1]}>{fixArabicText('خصم تجاري / مالي مطبق')}</Text>
                            <Text style={[styles.tableCell, styles.col2]}>{fixArabicText(`-${discount.toFixed(2)} ر.س`)}</Text>
                            <Text style={[styles.tableCell, styles.col3]}>{fixArabicText('0.00 ر.س')}</Text>
                            <Text style={[styles.tableCell, styles.col4]}>{fixArabicText(`-${discount.toFixed(2)} ر.س`)}</Text>
                        </View>
                    )}
                </View>

                {/* 5. Exemption & Financial Summary Grid */}
                <View style={styles.financialSummaryRow}>

                    {/* Exemption Notice or Notes */}
                    <View style={styles.exemptionBox}>
                        {taxRate === 0 && (invoiceData.vatExemptionReason || company.vatExemptionReason) ? (
                            <View>
                                <Text style={styles.exemptionTitle}>{fixArabicText('ملاحظة الإعفاء الضريبي الرسمي (ZATCA Exemption):')}</Text>
                                <Text style={styles.exemptionText}>
                                    {fixArabicText(invoiceData.vatExemptionReason || company.vatExemptionReason || 'معفاه بموجب اللائحة التنفيذية')}
                                </Text>
                            </View>
                        ) : (
                            <View>
                                <Text style={styles.exemptionTitle}>{fixArabicText('الشروط والأحكام المالية:')}</Text>
                                <Text style={styles.exemptionText}>
                                    {fixArabicText('هذه الفاتورة صادرة إلكترونياً وتعتبر سنداً رسمياً مستحق الدفع لحساب الشركة الناقلة.')}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Financial Summary Calculation Card */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryLine}>
                            <Text style={styles.infoLabel}>{fixArabicText('المبلغ الأساسي (قبل الخصم):')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(`${basePrice.toFixed(2)} ر.س`)}</Text>
                        </View>

                        {discount > 0 && (
                            <View style={styles.summaryLine}>
                                <Text style={styles.infoLabel}>{fixArabicText('مبلغ الخصم المالي:')}</Text>
                                <Text style={styles.infoVal}>{fixArabicText(`-${discount.toFixed(2)} ر.س`)}</Text>
                            </View>
                        )}

                        <View style={styles.summaryLine}>
                            <Text style={styles.infoLabel}>{fixArabicText('الصافي الخاضع للضريبة:')}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(`${discountedSubtotal.toFixed(2)} ر.س`)}</Text>
                        </View>

                        <View style={styles.summaryLine}>
                            <Text style={styles.infoLabel}>{fixArabicText(`ضريبة القيمة المضافة (${taxRate}%):`)}</Text>
                            <Text style={styles.infoVal}>{fixArabicText(`${vatAmount.toFixed(2)} ر.س`)}</Text>
                        </View>

                        <View style={styles.grandTotalLine}>
                            <Text style={styles.grandTotalLabel}>{fixArabicText('الإجمالي النهائي المستحق:')}</Text>
                            <Text style={styles.grandTotalVal}>{fixArabicText(`${finalTotal.toFixed(2)} ر.س`)}</Text>
                        </View>
                    </View>

                </View>

                {/* 6. Footer Notice */}
                <View style={styles.footer}>
                    <Text style={styles.footerNotice}>
                        {fixArabicText('وثيقة رسمية معتمدة صادرة من منصة "شحنتك" اللوجستية © 2026 - جميع الحقوق محفوظة')}
                    </Text>
                </View>

            </Page>
        </Document>
    );
};
