/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 9,
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
    },
    // Top Header Banner
    brandHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#2563EB',
        paddingBottom: 10,
        marginBottom: 12,
    },
    brandTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E3A8A',
        textAlign: 'left',
    },
    brandSub: {
        fontSize: 8.5,
        color: '#64748B',
        textAlign: 'left',
        marginTop: 2,
    },
    orderBadge: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        alignItems: 'flex-start',
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
        flexDirection: 'row',
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
        textAlign: 'left',
    },
    infoLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3.5,
    },
    label: {
        fontSize: 8,
        color: '#64748B',
        textAlign: 'left',
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
        flexDirection: 'row',
        backgroundColor: '#1E3A8A',
        padding: 7,
    },
    tableHeaderCell: {
        fontSize: 8.5,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'left',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 7,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
    },
    tableCell: {
        fontSize: 8.5,
        color: '#334155',
        textAlign: 'left',
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
        flexDirection: 'row',
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
        flexDirection: 'row',
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
        textAlign: 'left',
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
    const creationDate = new Date(orderData.createdAt || Date.now()).toLocaleDateString('en-US');

    const orderValue = Number(orderData.orderValue || 0);
    const codAmount = Number(orderData.codAmount || 0);

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'validated': return 'Confirmed & Inspected';
            case 'grouped': return 'Grouped in Shipment';
            case 'shipped': return 'Shipped';
            case 'delivered': return 'Delivered Successfully';
            case 'cancelled': return 'Cancelled';
            default: return status || 'New';
        }
    };

    return (
        <Document title={`Order_${orderData.orderNumber}`}>
            <Page size="A4" style={styles.page}>

                <View style={styles.brandHeader}>
                    <View>
                        <Text style={styles.brandTitle}>Single Shipment Order Receipt</Text>
                        <Text style={styles.brandSub}>Shahntak Logistics Platform - Official Delivery Document</Text>
                    </View>
                    <View style={styles.orderBadge}>
                        <Text style={styles.orderNumberText}>{`Order #: ${orderData.orderNumber || 'ORD-0000'}`}</Text>
                        <Text style={styles.orderSourceText}>
                            {`Source: ${orderData.source === 'bulk_upload' ? 'Excel Import' : 'Manual Entry'}`}
                        </Text>
                    </View>
                </View>

                <View style={styles.gridTwo}>

                    {/* Sender Company Info */}
                    <View style={styles.cardHalf}>
                        <Text style={styles.cardHeader}>Sender Company Details</Text>

                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Company Name:</Text>
                            <Text style={styles.val}>{company.companyName || 'Partner Logistics Co.'}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>ZATCA Tax ID:</Text>
                            <Text style={styles.val}>{company.taxNumber || '310459871200003'}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>City & Branch:</Text>
                            <Text style={styles.val}>{company.city || 'Riyadh'}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Contact:</Text>
                            <Text style={styles.val}>{company.phone || company.email || 'support@shahntak.sa'}</Text>
                        </View>
                    </View>

                    {/* Recipient & Customer Info */}
                    <View style={styles.cardHalf}>
                        <Text style={styles.cardHeader}>Recipient & Delivery Location</Text>

                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Recipient Name:</Text>
                            <Text style={styles.val}>{orderData.recipientName || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Phone Number:</Text>
                            <Text style={styles.val}>{orderData.recipientPhone || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>City & District:</Text>
                            <Text style={styles.val}>{`${orderData.recipientCity || 'Riyadh'} ${orderData.recipientDistrict ? `- ${orderData.recipientDistrict}` : ''}`}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Detailed Address:</Text>
                            <Text style={styles.val}>{orderData.recipientAddress || 'Main Address'}</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, styles.colW1]}>Item / Package Description</Text>
                        <Text style={[styles.tableHeaderCell, styles.colW2]}>Weight / Quantity</Text>
                        <Text style={[styles.tableHeaderCell, styles.colW3]}>Registration Date</Text>
                        <Text style={[styles.tableHeaderCell, styles.colW4]}>Current Status</Text>
                    </View>

                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.colW1]}>{`Package for (${orderData.recipientName || 'Customer'})`}</Text>
                        <Text style={[styles.tableCell, styles.colW2]}>{`${orderData.weight || 1} kg (${orderData.quantity || 1} pkg)`}</Text>
                        <Text style={[styles.tableCell, styles.colW3]}>{creationDate}</Text>
                        <Text style={[styles.tableCell, styles.colW4]}>{getStatusText(orderData.status)}</Text>
                    </View>
                </View>

                <View style={styles.codBanner}>
                    <Text style={styles.codTitle}>Cash on Delivery (COD) Amount Due from Customer:</Text>
                    <Text style={styles.codAmountText}>{`${codAmount.toFixed(2)} SAR`}</Text>
                </View>

                <View style={styles.signatureSection}>
                    <View style={styles.sigBox}>
                        <Text style={styles.sigTitle}>Sender Dispatch Signature & Stamp:</Text>
                        <View style={styles.sigLine} />
                    </View>

                    <View style={styles.sigBox}>
                        <Text style={styles.sigTitle}>Recipient / Customer Signature:</Text>
                        <View style={styles.sigLine} />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerNotice}>
                        Official Order Receipt generated automatically by Shahntak Logistics Platform © 2026 - All Rights Reserved
                    </Text>
                </View>

            </Page>
        </Document>
    );
};
