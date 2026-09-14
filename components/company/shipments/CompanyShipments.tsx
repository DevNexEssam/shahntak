/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useCompanyShipments, useDeleteCompanyShipment } from '@/hooks/company/useCompanyShipment';
import AddCompanyShipmentPopup from './AddCompanyShipmentPopup';
import EditCompanyShipmentPopup from './EditCompanyShipmentPopup';
import DetailsCompanyShipmentPopup from './DetailsCompanyShipmentPopup';
import BulkImportShipmentsPopup from './BulkImportShipmentsPopup';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import ErrorMessege from '@/components/ui/ErrorMessege';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
import toast from 'react-hot-toast';
import {
    LuTruck,
    LuPlus,
    LuSearch,
    LuRefreshCw,
    LuPencil,
    LuEye,
    LuTrash2,
    LuChevronRight,
    LuChevronLeft,
    LuClock,
    LuCheck,
    LuMapPin,
    LuReceipt,
    LuBox,
    LuCalendar,
    LuFilter,
    LuUpload,
    LuDownload,
    LuLoader
} from 'react-icons/lu';
import { WaybillPDFDocument } from './WaybillPDFDocument';

export default function CompanyShipments() {
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState<string>(todayStr);
    const [endDate, setEndDate] = useState<string>(todayStr);
    const [datePreset, setDatePreset] = useState<'today' | 'month' | 'all'>('today');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [selectedShipmentForEdit, setSelectedShipmentForEdit] = useState<any | null>(null);
    const [selectedShipmentForDetails, setSelectedShipmentForDetails] = useState<any | null>(null);
    const [selectedShipmentForDelete, setSelectedShipmentForDelete] = useState<any | null>(null);
    const [downloadingShipmentId, setDownloadingShipmentId] = useState<string | null>(null);

    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useCompanyShipments(page, limit, searchQuery, startDate, endDate);
    const { mutate: deleteShipment, isPending: isDeleting } = useDeleteCompanyShipment();

    const handlePresetToday = () => {
        setStartDate(todayStr);
        setEndDate(todayStr);
        setDatePreset('today');
        setPage(1);
    };

    const handlePresetMonth = () => {
        const now = new Date();
        const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        setStartDate(firstDay);
        setEndDate(todayStr);
        setDatePreset('month');
        setPage(1);
    };

    const handlePresetAll = () => {
        setStartDate('');
        setEndDate('');
        setDatePreset('all');
        setPage(1);
    };

    if (isLoading) return <Loading />;

    const shipmentsList = responseData?.data || [];
    const pagination = responseData?.pagination;
    const totalRecords = pagination?.totalRecords || responseData?.count || 0;
    const totalPages = pagination?.totalPages || Math.ceil(totalRecords / limit) || 1;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const serverStats = responseData?.stats;
    const stats = {
        total: serverStats?.total ?? totalRecords,
        created: serverStats?.created ?? 0,
        in_transit: serverStats?.in_transit ?? 0,
        delivered: serverStats?.delivered ?? 0,
    };

    const handleDeleteConfirm = () => {
        if (!selectedShipmentForDelete) return;
        deleteShipment(
            { id: selectedShipmentForDelete._id },
            {
                onSuccess: () => {
                    setSelectedShipmentForDelete(null);
                },
            }
        );
    };

    const handleDownloadWaybillPdf = async (shipment: any) => {
        if (shipment?.status === 'cancelled') {
            toast.error('حماية نزاهة البوالص: لا يمكن تنزيل بوليصة شحن لشحنة ملغية');
            return;
        }
        try {
            setDownloadingShipmentId(shipment._id);
            toast.loading(`جاري تجهيز وتنزيل بوليصة الشحن PDF (${shipment.waybillNumber || shipment.shipmentNumber})...`, { id: 'waybill-pdf' });
            const { pdf } = await import('@react-pdf/renderer');
            const blob = await pdf(<WaybillPDFDocument shipmentData={shipment} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Waybill_${shipment.waybillNumber || shipment.shipmentNumber || 'download'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success(`تم تحميل بوليصة الشحن (${shipment.waybillNumber || shipment.shipmentNumber}) بنجاح!`, { id: 'waybill-pdf' });
        } catch (err) {
            console.error('Failed to generate Waybill PDF:', err);
            toast.error('حدث خطأ أثناء إنشاء بوليصة الشحن PDF', { id: 'waybill-pdf' });
        } finally {
            setDownloadingShipmentId(null);
        }
    };

    const statusBadge = (status?: string) => {
        switch (status) {
            case 'created':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        حديثة
                    </span>
                );
            case 'confirmed':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                        مؤكدة
                    </span>
                );
            case 'assigned':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        معينة لناقل
                    </span>
                );
            case 'ready_for_pickup':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                        جاهزة للاستلام
                    </span>
                );
            case 'picked_up':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20">
                        تم الاستلام
                    </span>
                );
            case 'in_transit':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                        في الطريق
                    </span>
                );
            case 'arrived':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                        وصلت للمركز
                    </span>
                );
            case 'out_for_delivery':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 border border-orange-500/20">
                        خرجت للتوصيل
                    </span>
                );
            case 'delivered':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        تم التوصيل
                    </span>
                );
            case 'delivery_failed':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        فشل التوصيل
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        ملغية
                    </span>
                );
            case 'returned':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-600 border border-gray-500/20">
                        مرتجعة
                    </span>
                );
            case 'exception':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                        حالة استثنائية
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 border border-slate-500/20">
                        {status || 'جديد'}
                    </span>
                );
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'ftl': return 'شحن كامل ';
            case 'ltl': return 'شحن جزئي ';
            default: return 'توصيل محلي';
        }
    };

    return (
        <div className="space-y-6 text-right font-arabic">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
                            <LuTruck className="w-5 h-5" />
                        </span>
                        إدارة الشحنات وتعيين الموارد
                    </h1>
                    <p className="text-xs text-body mt-1">مراقبة الشحنات المجمعة والمسارات وتعيين الناقلين والمركبات وطباعة البوالص</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="تحديث البيانات"
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer disabled:opacity-50"
                    >
                        <LuRefreshCw className={`text-sm font-bold ${isFetching ? 'animate-spin text-accent' : ''}`} />
                    </button>

                    <button
                        onClick={() => setIsBulkImportOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer"
                    >
                        <LuUpload className="w-4 h-4" />
                        <span>استيراد شحنات من Excel</span>
                    </button>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground text-xs font-bold hover:shadow-md hover:shadow-accent/20 transition-all cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>إنشاء شحنة جديدة</span>
                    </button>
                </div>
            </div>

            {/* Error Notification Banner */}
            {isError && (
                <div className="mb-4">
                    <ErrorMessege message={(error as any)?.message || 'تعذر جلب بيانات الشحنات من الخادم'} />
                </div>
            )}

            {/* Date Range Selector Header Bar */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-heading">
                    <LuCalendar className="w-4 h-4 text-accent shrink-0" />
                    <span>تصفية الفترات الزمنية للشحنات:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">

                    {/* Preset Buttons */}
                    <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-md border border-border">
                        <button
                            onClick={handlePresetToday}
                            className={`px-3 py-1.5 rounded text-xs font-extrabold transition-all cursor-pointer ${datePreset === 'today'
                                ? 'bg-accent text-accent-foreground shadow-xs'
                                : 'text-body hover:text-heading'
                                }`}
                        >
                            اليوم (تلقائي)
                        </button>
                        <button
                            onClick={handlePresetMonth}
                            className={`px-3 py-1.5 rounded text-xs font-extrabold transition-all cursor-pointer ${datePreset === 'month'
                                ? 'bg-accent text-accent-foreground shadow-xs'
                                : 'text-body hover:text-heading'
                                }`}
                        >
                            هذا الشهر
                        </button>
                        <button
                            onClick={handlePresetAll}
                            className={`px-3 py-1.5 rounded text-xs font-extrabold transition-all cursor-pointer ${datePreset === 'all'
                                ? 'bg-accent text-accent-foreground shadow-xs'
                                : 'text-body hover:text-heading'
                                }`}
                        >
                            جميع الفترات
                        </button>
                    </div>

                    {/* Date Inputs */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-body">من:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setDatePreset('all');
                                setPage(1);
                            }}
                            className="px-3 py-1.5 rounded-md bg-surface-muted border border-border text-xs font-latin text-heading focus:outline-none focus:border-accent"
                        />
                        <span className="text-xs text-body">إلى:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setDatePreset('all');
                                setPage(1);
                            }}
                            className="px-3 py-1.5 rounded-md bg-surface-muted border border-border text-xs font-latin text-heading focus:outline-none focus:border-accent"
                        />
                    </div>

                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">إجمالي الشحنات</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.total}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>مسجلة لشركتك</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuTruck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">شحنات جديدة</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.created}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>تم التجميع حديثاً</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuClock className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">في الطريق / ترانزيت</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.in_transit}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>جاري النقل والتحريك</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuBox className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">تم التوصيل</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.delivered}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>مكتملة ومسلمة للعملاء</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Controller Header */}
            <div className="bg-surface p-4 rounded-md border border-border flex items-center justify-between">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="بحث برقم الشحنة، البوليصة، التتبع، الوجهة..."
                        className="w-full pl-4 pr-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {shipmentsList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="لا توجد شحنات مسجلة للشركة تطابق خيارات البحث الحالية" icon={LuTruck} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4">رقم الشحنة</th>
                                    <th className="py-3.5 px-4">نوع الخدمة والمسار</th>
                                    <th className="py-3.5 px-4">البوليصة والتتبع</th>
                                    <th className="py-3.5 px-4">الطلبات / المركبة المعينة</th>
                                    <th className="py-3.5 px-4">الحالة</th>
                                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {shipmentsList.map((shp: any) => {
                                    const vehicleName = typeof shp.vehicleId === 'object' && shp.vehicleId !== null
                                        ? shp.vehicleId.type
                                        : 'غير معينة';

                                    return (
                                        <tr key={shp._id} className="hover:bg-surface-muted/40 transition-colors">
                                            <td className="py-3.5 px-4 font-latin font-bold text-accent">
                                                {shp.shipmentNumber}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div>
                                                    <span className="font-bold text-heading flex items-center gap-1">
                                                        <LuMapPin className="w-3.5 h-3.5 text-accent" />
                                                        {shp.origin} ⬅️ {shp.destination}
                                                    </span>
                                                    <span className="text-[11px] text-body block mt-0.5">{getTypeBadge(shp.type)}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 font-latin text-xs">
                                                <div className="font-extrabold text-heading">{shp.waybillNumber || 'WB-XXXX'}</div>
                                                <div className="text-[11px] text-body">{shp.trackingNumber || 'TRK-XXXX'}</div>
                                            </td>

                                            <td className="py-3.5 px-4 text-xs font-semibold text-heading">
                                                <div>{shp.ordersCount || 1} طلبات مرفقة</div>
                                                <div className="text-body text-[11px]">مركبة: {vehicleName}</div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {statusBadge(shp.status)}
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => handleDownloadWaybillPdf(shp)}
                                                        disabled={downloadingShipmentId === shp._id || shp.status === 'cancelled'}
                                                        title={shp.status === 'cancelled' ? 'بوليصة شحن ملغية' : 'تنزيل البوليصة بصيغة PDF'}
                                                        className="p-2 rounded-md bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-600 border border-emerald-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        {downloadingShipmentId === shp._id ? (
                                                            <LuLoader className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <LuDownload className="w-4 h-4" />
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedShipmentForDetails(shp)}
                                                        title="عرض التفاصيل"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedShipmentForEdit(shp)}
                                                        title="تعديل البيانات وتعين الموارد"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedShipmentForDelete(shp)}
                                                        title="حذف الشحنة"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-rose-500/10 text-body hover:text-rose-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs font-bold text-body">
                        <span className="text-body font-medium">
                            عرض الصفحة <b className="font-latin text-heading">{page}</b> من <b className="font-latin text-heading">{totalPages}</b> (إجمالي {totalRecords} شحنة)
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                <LuChevronRight className="w-4 h-4" />
                                <span>السابق</span>
                            </button>

                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                <span>التالي</span>
                                <LuChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddCompanyShipmentPopup
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <BulkImportShipmentsPopup
                isOpen={isBulkImportOpen}
                onClose={() => setIsBulkImportOpen(false)}
            />

            <EditCompanyShipmentPopup
                isOpen={!!selectedShipmentForEdit}
                shipmentData={selectedShipmentForEdit}
                onClose={() => setSelectedShipmentForEdit(null)}
            />

            <DetailsCompanyShipmentPopup
                isOpen={!!selectedShipmentForDetails}
                shipmentData={selectedShipmentForDetails}
                onClose={() => setSelectedShipmentForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedShipmentForDelete}
                title="تأكيد حذف الشحنة"
                description={`هل أنت تأكد من رغبتك في حذف الشحنة (${selectedShipmentForDelete?.shipmentNumber})؟ لا يمكن التراجع عن هذا الإجراء لاحقاً.`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedShipmentForDelete(null)}
            />

        </div>
    );
}
