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
    // Top Header Banner
    brandHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#2563EB',
        paddingBottom: 10,
        marginBottom: 12,
    },
    brandTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E3A8A',
        textAlign: 'right',
    },
    brandSub: {
        fontSize: 8.5,
        color: '#64748B',
        textAlign: 'right',
        marginTop: 2,
    },
    orderBadge: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        alignItems: 'flex-end',
    },
    orderNumberText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1D4ED8',
    },
    orderSourceText: {
        fontSize: 8.5,
        color: '#2563EB',
        marginTop: 2,
    },

    // Grid Container for 2 Columns
    gridTwo: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 10,
    },
    cardHalf: {
        width: '49%',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 5,
        padding: 8,
    },
    cardHeader: {
        fontSize: 9.5,
        fontWeight: 'bold',
        color: '#1E293B',
        borderBottomWidth: 1,
        borderBottomColor: '#CBD5E1',
        paddingBottom: 4,
        marginBottom: 6,
        textAlign: 'right',
    },
    infoLine: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginBottom: 3.5,
    },
    label: {
        fontSize: 8,
        color: '#64748B',
        textAlign: 'right',
    },
    val: {
        fontSize: 8.5,
        fontWeight: 'bold',
        color: '#0F172A',
        textAlign: 'right',
    },

    // Specs & Financial Table
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
    tableCell: {
        fontSize: 8.5,
        color: '#334155',
        textAlign: 'right',
    },
    colW1: { width: '35%' },
    colW2: { width: '20%' },
    colW3: { width: '20%' },
    colW4: { width: '25%' },

    // COD Highlight Banner
    codBanner: {
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: 6,
        padding: 10,
        marginBottom: 15,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    codTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#92400E',
    },
    codAmountText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#B45309',
    },

    // Signatures Section
    signatureSection: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginTop: 15,
        gap: 10,
    },
    sigBox: {
        width: '48%',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 5,
        padding: 10,
        height: 70,
        justifyContent: 'space-between',
    },
    sigTitle: {
        fontSize: 8.5,
        fontWeight: 'bold',
        color: '#475569',
        textAlign: 'right',
    },
    sigLine: {
        borderTopWidth: 1,
        borderTopColor: '#94A3B8',
        borderStyle: 'dashed',
        marginTop: 25,
    },

    // Footer
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

interface OrderPDFDocumentProps {
    orderData: any;
}

export const OrderPDFDocument: React.FC<OrderPDFDocumentProps> = ({ orderData }) => {
    if (!orderData) return null;

    const company = orderData.companyId || orderData.company || {};
    const creationDate = new Date(orderData.createdAt || Date.now()).toLocaleDateString('ar-SA');

    const orderValue = Number(orderData.orderValue || 0);
    const codAmount = Number(orderData.codAmount || 0);

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'قيد الانتظار';
            case 'validated': return 'مؤكد ومفحوص';
            case 'grouped': return 'مجمع بشحنة';
            case 'shipped': return 'تم الشحن';
            case 'delivered': return 'تم التوصيل بنجاح';
            case 'cancelled': return 'ملغي';
            default: return status || 'جديد';
        }
    };

    return (
        <Document title={`Order_${orderData.orderNumber}`}>
            <Page size="A4" style={styles.page}>

                <View style={styles.brandHeader}>
                    <View>
                        <Text style={styles.brandTitle}>{fixArabicText('سند وتسليم طلب شحن فردي')}</Text>
                        <Text style={styles.brandSub}>{fixArabicText('منصة شحنتك اللوجستية - وثيقة تسليم وطرد رسمية')}</Text>
                    </View>
                    <View style={styles.orderBadge}>
                        <Text style={styles.orderNumberText}>{fixArabicText(`طلب #: ${orderData.orderNumber || 'ORD-0000'}`)}</Text>
                        <Text style={styles.orderSourceText}>
                            {fixArabicText(`المصدر: ${orderData.source === 'bulk_upload' ? 'رفع إكسل' : 'إدخال يدوي'}`)}
                        </Text>
                    </View>
                </View>

                <View style={styles.gridTwo}>

                    {/* Sender Company Info */}
                    <View style={styles.cardHalf}>
                        <Text style={styles.cardHeader}>{fixArabicText('بيانات المنشأة المرسلة / الشركة')}</Text>

                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('اسم الشركة:')}</Text>
                            <Text style={styles.val}>{fixArabicText(company.companyName || 'شركة الشحن المشتركة')}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('الرقم الضريبي ZATCA:')}</Text>
                            <Text style={styles.val}>{fixArabicText(company.taxNumber || '310459871200003')}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('المدينة والفرع:')}</Text>
                            <Text style={styles.val}>{fixArabicText(company.city || 'الرياض')}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('تواصل المنشأة:')}</Text>
                            <Text style={styles.val}>{fixArabicText(company.phone || company.email || 'support@shahntak.sa')}</Text>
                        </View>
                    </View>

                    {/* Recipient & Customer Info */}
                    <View style={styles.cardHalf}>
                        <Text style={styles.cardHeader}>{fixArabicText('بيانات المستلم وموقع التوصيل')}</Text>

                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('اسم المستلم:')}</Text>
                            <Text style={styles.val}>{fixArabicText(orderData.recipientName || 'غير مسجل')}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('رقم الجوال:')}</Text>
                            <Text style={styles.val}>{fixArabicText(orderData.recipientPhone || 'غير مسجل')}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('المدينة والحي:')}</Text>
                            <Text style={styles.val}>{fixArabicText(`${orderData.recipientCity || 'الرياض'} ${orderData.recipientDistrict ? `- ${orderData.recipientDistrict}` : ''}`)}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('العنوان التفصيلي:')}</Text>
                            <Text style={styles.val}>{fixArabicText(orderData.recipientAddress || 'العنوان الرئيسي')}</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, styles.colW1]}>{fixArabicText('بيان الطرد / الطلب')}</Text>
                        <Text style={[styles.tableHeaderCell, styles.colW2]}>{fixArabicText('الوزن / الكمية')}</Text>
                        <Text style={[styles.tableHeaderCell, styles.colW3]}>{fixArabicText('تاريخ التسجيل')}</Text>
                        <Text style={[styles.tableHeaderCell, styles.colW4]}>{fixArabicText('الحالة الحالية')}</Text>
                    </View>

                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.colW1]}>{fixArabicText(`طرد مخصص للمستلم (${orderData.recipientName || 'العميل'})`)}</Text>
                        <Text style={[styles.tableCell, styles.colW2]}>{fixArabicText(`${orderData.weight || 1} كجم (${orderData.quantity || 1} طرد)`)}</Text>
                        <Text style={[styles.tableCell, styles.colW3]}>{fixArabicText(creationDate)}</Text>
                        <Text style={[styles.tableCell, styles.colW4]}>{fixArabicText(getStatusText(orderData.status))}</Text>
                    </View>
                </View>

                <View style={styles.codBanner}>
                    <Text style={styles.codTitle}>{fixArabicText('مبلغ التحصيل عند الاستلام المطلوب من العملاء (COD):')}</Text>
                    <Text style={styles.codAmountText}>{fixArabicText(`${codAmount.toFixed(2)} ر.س`)}</Text>
                </View>

                <View style={styles.signatureSection}>
                    <View style={styles.sigBox}>
                        <Text style={styles.sigTitle}>{fixArabicText('توقيع وختم تسليم المنشأة المرسلة:')}</Text>
                        <View style={styles.sigLine} />
                    </View>

                    <View style={styles.sigBox}>
                        <Text style={styles.sigTitle}>{fixArabicText('توقيع ومصادقة استلام العميل / المستلم:')}</Text>
                        <View style={styles.sigLine} />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerNotice}>
                        {fixArabicText('سند وتسليم طلب صادرة آلياً من منصة "شحنتك" اللوجستية © 2026 - جميع الحقوق محفوظة')}
                    </Text>
                </View>

            </Page>
        </Document>
    );
};
