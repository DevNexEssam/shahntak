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

// Disable hyphenation
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 9,
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
    },
    // Top Bar Header
    brandHeader: {
        flexDirection: 'row',
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
        textAlign: 'left',
    },
    brandSub: {
        fontSize: 8.5,
        color: '#64748B',
        textAlign: 'left',
        marginTop: 2,
    },
    waybillBadge: {
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        alignItems: 'flex-start',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    routeTitleGroup: {
        flexDirection: 'column',
        alignItems: 'flex-start',
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
        marginBottom: 3,
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

    // Cargo Table
    table: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 12,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#047857',
        padding: 6,
    },
    tableHeaderCell: {
        fontSize: 8.5,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'left',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 6,
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
    colW2: { width: '25%' },
    colW3: { width: '20%' },
    colW4: { width: '20%' },

    // Signatures Box
    signatureSection: {
        flexDirection: 'row',
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
        textAlign: 'left',
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
        : { name: 'Company Own Fleet' };
    const vehicle = typeof shipmentData.vehicleId === 'object' && shipmentData.vehicleId !== null
        ? shipmentData.vehicleId
        : {};

    const creationDate = new Date(shipmentData.createdAt || Date.now()).toLocaleDateString('en-US');

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'ftl': return 'Full Truckload (FTL)';
            case 'ltl': return 'Less than Truckload (LTL)';
            case 'local_delivery': return 'Last Mile Local Delivery';
            default: return 'General Logistics';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'created': return 'Created';
            case 'confirmed': return 'Confirmed';
            case 'assigned': return 'Assigned to Carrier';
            case 'in_transit': return 'In Transit';
            case 'delivered': return 'Delivered Successfully';
            case 'cancelled': return 'Cancelled';
            default: return status || 'Active';
        }
    };

    return (
        <Document title={`Waybill_${shipmentData.waybillNumber || shipmentData.shipmentNumber}`}>
            <Page size="A4" style={styles.page}>

                <View style={styles.brandHeader}>
                    <View>
                        <Text style={styles.brandTitle}>Official Overland Waybill</Text>
                        <Text style={styles.brandSub}>Shahntak Logistics Platform - Transport Document & Delivery Receipt</Text>
                    </View>
                    <View style={styles.waybillBadge}>
                        <Text style={styles.wbNumberText}>{`Waybill #: ${shipmentData.waybillNumber || 'WB-PENDING'}`}</Text>
                        <Text style={styles.wbTrackingText}>{`Tracking #: ${shipmentData.trackingNumber || 'TRK-PENDING'}`}</Text>
                    </View>
                </View>

                <View style={styles.routeBanner}>
                    <View style={styles.routeTitleGroup}>
                        <Text style={styles.routeLabel}>Approved Shipment Route:</Text>
                        <Text style={styles.routePathText}>
                            {`${shipmentData.origin || routeInfo.origin || 'Riyadh'} ➡️ ${shipmentData.destination || routeInfo.destination || 'Jeddah'}`}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-start' }}>
                        <Text style={styles.label}>Logistics Service Type:</Text>
                        <Text style={styles.val}>{getTypeLabel(shipmentData.type)}</Text>
                    </View>
                </View>

                <View style={styles.gridTwo}>

                    {/* Company Supplier Card */}
                    <View style={styles.cardHalf}>
                        <Text style={styles.cardHeader}>Shipper / Company Details</Text>

                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Shipper Company:</Text>
                            <Text style={styles.val}>{company.companyName || 'Joint Shipping Co.'}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Tax Number:</Text>
                            <Text style={styles.val}>{company.taxNumber || '310459871200003'}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>City & Branch:</Text>
                            <Text style={styles.val}>{company.city || shipmentData.origin || 'Riyadh'}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Contact Info:</Text>
                            <Text style={styles.val}>{company.phone || company.email || '0500000000'}</Text>
                        </View>
                    </View>

                    {/* Shipment Meta Card */}
                    <View style={styles.cardHalf}>
                        <Text style={styles.cardHeader}>Shipment & Timeline Details</Text>

                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Shipment Number:</Text>
                            <Text style={styles.val}>{shipmentData.shipmentNumber || 'SHP-0000'}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Creation Date:</Text>
                            <Text style={styles.val}>{creationDate}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Current Status:</Text>
                            <Text style={styles.val}>{getStatusText(shipmentData.status)}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Consolidated Orders:</Text>
                            <Text style={styles.val}>{`${shipmentData.ordersCount || 1} package(s)`}</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.gridTwo}>

                    {/* Transport & Carrier Info */}
                    <View style={styles.cardHalf}>
                        <Text style={styles.cardHeader}>Carrier & Vehicle Details</Text>

                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Carrier Company:</Text>
                            <Text style={styles.val}>{carrier.name || 'Company Own Fleet'}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Truck / Vehicle Type:</Text>
                            <Text style={styles.val}>{vehicle.type || 'Dry Cargo Truck'}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Plate Number:</Text>
                            <Text style={styles.val}>{vehicle.plateNumber || 'N/A'}</Text>
                        </View>
                    </View>

                    {/* Driver & Delivery Contact Info */}
                    <View style={styles.cardHalf}>
                        <Text style={styles.cardHeader}>Driver Details</Text>

                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Driver Name:</Text>
                            <Text style={styles.val}>{shipmentData.driverName || 'Authorized Driver'}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Driver Phone:</Text>
                            <Text style={styles.val}>{shipmentData.driverPhone || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoLine}>
                            <Text style={styles.label}>Approved Route:</Text>
                            <Text style={styles.val}>{routeInfo.routeName || 'Direct Route'}</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, styles.colW1]}>Cargo & Package Description</Text>
                        <Text style={[styles.tableHeaderCell, styles.colW2]}>Service Type</Text>
                        <Text style={[styles.tableHeaderCell, styles.colW3]}>Quantity</Text>
                        <Text style={[styles.tableHeaderCell, styles.colW4]}>Receipt Condition</Text>
                    </View>

                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.colW1]}>{`Consolidated Shipment (${shipmentData.origin || 'Riyadh'} to ${shipmentData.destination || 'Jeddah'})`}</Text>
                        <Text style={[styles.tableCell, styles.colW2]}>{getTypeLabel(shipmentData.type)}</Text>
                        <Text style={[styles.tableCell, styles.colW3]}>{`${shipmentData.ordersCount || 1} package(s)`}</Text>
                        <Text style={[styles.tableCell, styles.colW4]}>Intact & Sealed</Text>
                    </View>
                </View>

                <View style={styles.signatureSection}>
                    <View style={styles.sigBox}>
                        <Text style={styles.sigTitle}>Shipper Signature & Stamp:</Text>
                        <View style={styles.sigLine} />
                    </View>

                    <View style={styles.sigBox}>
                        <Text style={styles.sigTitle}>Driver / Carrier Signature:</Text>
                        <View style={styles.sigLine} />
                    </View>

                    <View style={styles.sigBox}>
                        <Text style={styles.sigTitle}>Recipient Signature:</Text>
                        <View style={styles.sigLine} />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerNotice}>
                        Official Waybill automatically issued by Shahntak Logistics Platform © 2026 - All Rights Reserved
                    </Text>
                </View>

            </Page>
        </Document>
    );
};

