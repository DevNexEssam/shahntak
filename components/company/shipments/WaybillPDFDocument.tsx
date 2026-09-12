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
        borderBottomColor: '#059669',
        paddingBottom: 10,
        marginBottom: 12,
    },
    brandTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#065F46',
        textAlign: 'right',
    },
    brandSub: {
        fontSize: 8.5,
        color: '#64748B',
        textAlign: 'right',
        marginTop: 2,
    },
    waybillBadge: {
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        alignItems: 'flex-end',
    },
    wbNumberText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#047857',
    },
    wbTrackingText: {
        fontSize: 8.5,
        color: '#059669',
        marginTop: 2,
    },

    // Route & Direction Box (Highlighted Banner)
    routeBanner: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
        borderRadius: 6,
        padding: 10,
        marginBottom: 12,
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    routeTitleGroup: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    routeLabel: {
        fontSize: 8,
        color: '#166534',
        marginBottom: 2,
    },
    routePathText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#15803D',
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
        marginBottom: 3,
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

    // Cargo Table
    table: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 12,
    },
    tableHeader: {
        flexDirection: 'row-reverse',
        backgroundColor: '#047857',
        padding: 6,
    },
    tableHeaderCell: {
        fontSize: 8.5,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'right',
    },
    tableRow: {
        flexDirection: 'row-reverse',
        padding: 6,
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
    colW2: { width: '25%' },
    colW3: { width: '20%' },
    colW4: { width: '20%' },

    // Signatures Box
    signatureSection: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 10,
    },
    sigBox: {
        width: '32%',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 5,
        padding: 8,
        height: 65,
        justifyContent: 'space-between',
    },
    sigTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#475569',
        textAlign: 'right',
    },
    sigLine: {
        borderTopWidth: 1,
        borderTopColor: '#94A3B8',
        borderStyle: 'dashed',
        marginTop: 20,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 6,
        alignItems: 'center',
    },
    footerNotice: {
        fontSize: 7.5,
        color: '#94A3B8',
        textAlign: 'center',
    },
});

interface WaybillPDFDocumentProps {
    shipmentData: any;
}

export const WaybillPDFDocument: React.FC<WaybillPDFDocumentProps> = ({ shipmentData }) => {
    if (!shipmentData) return null;

    const company = shipmentData.companyId || shipmentData.company || {};
    const routeInfo = shipmentData.routeId || {};
    const carrier = typeof shipmentData.carrierId === 'object' && shipmentData.carrierId !== null
        ? shipmentData.carrierId
        : { name: 'أسطول الشركة الذاتي' };
    const vehicle = typeof shipmentData.vehicleId === 'object' && shipmentData.vehicleId !== null
        ? shipmentData.vehicleId
        : {};

    const creationDate = new Date(shipmentData.createdAt || Date.now()).toLocaleDateString('ar-SA');

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'ftl': return 'شحن نقل كامل (FTL)';
            case 'ltl': return 'شحن طرود جزئية (LTL)';
            case 'local_delivery': return 'توصيل محلي للميل الأخير';
            default: return 'نقل لوجستي عام';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'created': return 'حديثة';
            case 'confirmed': return 'مؤكدة';
            case 'assigned': return 'معينة لناقل';
            case 'in_transit': return 'في الطريق';
            case 'delivered': return 'تم التوصيل بنجاح';
            case 'cancelled': return 'ملغية';
            default: return status || 'نشطة';
        }
    };

    return (
        <Document title={`Waybill_${shipmentData.waybillNumber || shipmentData.shipmentNumber}`}>
            <Page size="A4" style={styles.page}>

                <View style={styles.brandHeader}>
                    <View>
                        <Text style={styles.brandTitle}>{fixArabicText('بوليصة شحن برية رسمية')}</Text>
                        <Text style={styles.brandSub}>{fixArabicText('منصة شحنتك اللوجستية - سند نقل وتأكيد استلام')}</Text>
                    </View>
                    <View style={styles.waybillBadge}>
                        <Text style={styles.wbNumberText}>{fixArabicText(`بوليصة #: ${shipmentData.waybillNumber || 'WB-PENDING'}`)}</Text>
                        <Text style={styles.wbTrackingText}>{fixArabicText(`تتبع #: ${shipmentData.trackingNumber || 'TRK-PENDING'}`)}</Text>
                    </View>
                </View>

                <View style={styles.routeBanner}>
                    <View style={styles.routeTitleGroup}>
                        <Text style={styles.routeLabel}>{fixArabicText('خط مسار الشحنة الاتجاه المعتمد:')}</Text>
                        <Text style={styles.routePathText}>
                            {fixArabicText(`${shipmentData.origin || routeInfo.origin || 'الرياض'} ⬅️ ${shipmentData.destination || routeInfo.destination || 'جدة'}`)}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.label}>{fixArabicText('نوع الخدمة اللوجستية:')}</Text>
                        <Text style={styles.val}>{fixArabicText(getTypeLabel(shipmentData.type))}</Text>
                    </View>
                </View>

                <View style={styles.gridTwo}>

                    {/* Company Supplier Card */}
                    <View style={styles.cardHalf}>
                        <Text style={styles.cardHeader}>{fixArabicText('بيانات منشأة الشحن / المرسل')}</Text>

                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('الشركة المرسلة:')}</Text>
                            <Text style={styles.val}>{fixArabicText(company.companyName || 'شركة الشحن المشتركة')}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('الرقم الضريبي:')}</Text>
                            <Text style={styles.val}>{fixArabicText(company.taxNumber || '310459871200003')}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('المدينة والفرع:')}</Text>
                            <Text style={styles.val}>{fixArabicText(company.city || shipmentData.origin || 'الرياض')}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('تواصل المنشأة:')}</Text>
                            <Text style={styles.val}>{fixArabicText(company.phone || company.email || '0500000000')}</Text>
                        </View>
                    </View>

                    {/* Shipment Meta Card */}
                    <View style={styles.cardHalf}>
                        <Text style={styles.cardHeader}>{fixArabicText('بيانات الشحنة والجدول الزمني')}</Text>

                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('رقم الشحنة الموحد:')}</Text>
                            <Text style={styles.val}>{fixArabicText(shipmentData.shipmentNumber || 'SHP-0000')}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('تاريخ الإنشاء والتجميع:')}</Text>
                            <Text style={styles.val}>{fixArabicText(creationDate)}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('حالة الشحنة الحالية:')}</Text>
                            <Text style={styles.val}>{fixArabicText(getStatusText(shipmentData.status))}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('عدد الطرود المجمعة:')}</Text>
                            <Text style={styles.val}>{fixArabicText(`${shipmentData.ordersCount || 1} طرد مجمع`)}</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.gridTwo}>

                    {/* Transport & Carrier Info */}
                    <View style={styles.cardHalf}>
                        <Text style={styles.cardHeader}>{fixArabicText('بيانات الناقل والمركبة المعينة')}</Text>

                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('شركة النقل / الناقل:')}</Text>
                            <Text style={styles.val}>{fixArabicText(carrier.name || 'أسطول الشركة الذاتي')}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('نوع الشاحنة / المركبة:')}</Text>
                            <Text style={styles.val}>{fixArabicText(vehicle.type || 'شاحنة نقل جاف')}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('رقم اللوحة:')}</Text>
                            <Text style={styles.val}>{fixArabicText(vehicle.plateNumber || 'غير مسجل')}</Text>
                        </View>
                    </View>

                    {/* Driver & Delivery Contact Info */}
                    <View style={styles.cardHalf}>
                        <Text style={styles.cardHeader}>{fixArabicText('بيانات السائق المباشر')}</Text>

                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('اسم السائق المسؤول:')}</Text>
                            <Text style={styles.val}>{fixArabicText(shipmentData.driverName || 'سائق معتمد')}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('هاتف تواصل السائق:')}</Text>
                            <Text style={styles.val}>{fixArabicText(shipmentData.driverPhone || 'غير مسجل')}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>{fixArabicText('مسار النقل المعتمد:')}</Text>
                            <Text style={styles.val}>{fixArabicText(routeInfo.routeName || 'خط سير مباشر')}</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, styles.colW1]}>{fixArabicText('بيان البضاعة والطرود الشحن')}</Text>
                        <Text style={[styles.tableHeaderCell, styles.colW2]}>{fixArabicText('نوع التغليف والخدمة')}</Text>
                        <Text style={[styles.tableHeaderCell, styles.colW3]}>{fixArabicText('الكمية / عدد الطرود')}</Text>
                        <Text style={[styles.tableHeaderCell, styles.colW4]}>{fixArabicText('حالة الاستلام')}</Text>
                    </View>

                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.colW1]}>{fixArabicText(`شحنة مجمعة (مسار ${shipmentData.origin || 'الرياض'} إلى ${shipmentData.destination || 'جدة'})`)}</Text>
                        <Text style={[styles.tableCell, styles.colW2]}>{fixArabicText(getTypeLabel(shipmentData.type))}</Text>
                        <Text style={[styles.tableCell, styles.colW3]}>{fixArabicText(`${shipmentData.ordersCount || 1} طرد`)}</Text>
                        <Text style={[styles.tableCell, styles.colW4]}>{fixArabicText('سليمة ومغلقة')}</Text>
                    </View>
                </View>

                <View style={styles.signatureSection}>
                    <View style={styles.sigBox}>
                        <Text style={styles.sigTitle}>{fixArabicText('توقيع وختم المنشأة المرسلة:')}</Text>
                        <View style={styles.sigLine} />
                    </View>

                    <View style={styles.sigBox}>
                        <Text style={styles.sigTitle}>{fixArabicText('توقيع سائق النقل / الاستلام:')}</Text>
                        <View style={styles.sigLine} />
                    </View>

                    <View style={styles.sigBox}>
                        <Text style={styles.sigTitle}>{fixArabicText('توقيع وختم المستلم / المركز:')}</Text>
                        <View style={styles.sigLine} />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerNotice}>
                        {fixArabicText('بوليصة شحن برية رسمية صادرة آلياً من منصة "شحنتك" اللوجستية © 2026 - جميع الحقوق محفوظة')}
                    </Text>
                </View>

            </Page>
        </Document>
    );
};
