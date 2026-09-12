/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Shipment, Company } from '@/types/data';
import { useShipments, useDeleteShipment } from '@/hooks/shipments/useShipments';
import AddShipments from './AddShipments';
import EditShipments from './EditShipments';
import DetailsShipments from './DetailsShipments';
import BulkImportAdminShipmentsPopup from './BulkImportAdminShipmentsPopup';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
import ErrorMessege from '@/components/ui/ErrorMessege';
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
    LuBuilding2,
    LuFilter,
    LuCheck,
    LuClock,
    LuMapPin,
    LuCalendar,
    LuFileSpreadsheet,
    LuDownload,
    LuLoader
} from 'react-icons/lu';
import { WaybillPDFDocument } from '@/components/company/shipments/WaybillPDFDocument';

export default function Shipments() {
    // Pagination & Search/Filtering States
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');

    // Date Range Filter States (Default to TODAY's date)
    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState<string>(todayStr);
    const [endDate, setEndDate] = useState<string>(todayStr);
    const [datePreset, setDatePreset] = useState<'today' | 'month' | 'all'>('today');

    // Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [selectedShipmentForEdit, setSelectedShipmentForEdit] = useState<Shipment | null>(null);
    const [selectedShipmentForDetails, setSelectedShipmentForDetails] = useState<Shipment | null>(null);
    const [selectedShipmentForDelete, setSelectedShipmentForDelete] = useState<Shipment | null>(null);
    const [downloadingShipmentId, setDownloadingShipmentId] = useState<string | null>(null);

    // React Query Hooks with server-side search, filtering & dates
    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useShipments(page, limit, searchQuery, filterStatus, filterType, startDate, endDate);
    const { mutate: deleteShipment, isPending: isDeleting } = useDeleteShipment();

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
    const totalRecords = responseData?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleFilterStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterStatus(e.target.value);
        setPage(1);
    };

    const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterType(e.target.value);
        setPage(1);
    };

    // Stats Calculation from Server Response
    const serverStats = responseData?.stats as any;
    const stats = {
        total: serverStats?.total ?? totalRecords,
        created: serverStats?.created ?? 0,
        inTransit: serverStats?.in_transit ?? serverStats?.inTransit ?? 0,
        delivered: serverStats?.delivered ?? 0,
    };

    const handleDeleteConfirm = () => {
        if (!selectedShipmentForDelete) return;
        deleteShipment(
            { id: selectedShipmentForDelete._id, hard: true },
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

    const getTypeBadge = (type?: string) => {
        switch (type) {
            case 'ftl': return 'شحن كامل ';
            case 'ltl': return 'شحن جزئي ';
            default: return 'توصيل محلي';
        }
    };

    return (
        <div className="space-y-6 text-right font-arabic" dir="rtl">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuTruck className="w-5 h-5" />
                        </span>
                        إدارة الشحنات وتعيين الموارد (الأدمن)
                    </h1>
                    <p className="text-xs text-body mt-1">متابعة الشحنات وتعيين المسارات اللوجستية والناقلين وطباعة البوالص</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="تحديث البيانات"
                        className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer disabled:opacity-50"
                    >
                        <LuRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-accent' : ''}`} />
                    </button>

                    <button
                        onClick={() => setIsBulkImportOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent-soft text-accent text-xs font-bold hover:bg-accent hover:text-white transition-all cursor-pointer border border-accent/20"
                    >
                        <LuFileSpreadsheet className="w-4 h-4" />
                        <span>استيراد من Excel</span>
                    </button>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground text-xs font-bold hover:shadow-md hover:shadow-accent/20 transition-all cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>إصدار شحنة جديدة</span>
                    </button>
                </div>
            </div>

            {/* Error Notification Banner */}
            {isError && (
                <div className="mb-4">
                    <ErrorMessege message={(error as any)?.message || 'تعذر جلب بيانات الشحنات من الخادم'} />
                </div>
            )}

            {/* Date Range Selector Header Bar - Matching Company Shipments */}
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
                                <span>المسجلة بالمنصة</span>
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
                            <span className="text-xs font-semibold text-body block mb-1">شحنات جديدة ومؤكدة</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.created}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>بانتظار التخصيص</span>
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
                            <span className="text-xs font-semibold text-body block mb-1">شحنات في الطريق</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.inTransit}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>جاري النقل اللوجستي</span>
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
                            <span className="text-xs font-semibold text-body block mb-1">شحنات مسلمة</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.delivered}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>تم التسليم بنجاح</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Search Controller Header */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="بحث برقم الشحنة، الانطلاق، الوجهة..."
                        className="w-full pl-4 pr-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-md border border-border w-full sm:w-auto">
                        <LuFilter className="w-4 h-4 text-body shrink-0" />
                        <select
                            value={filterType}
                            onChange={handleFilterTypeChange}
                            className="bg-transparent text-xs font-bold text-heading focus:outline-none cursor-pointer w-full"
                        >
                            <option value="all">جميع الأنواع</option>
                            <option value="ftl">حمولة كاملة</option>
                            <option value="ltl">حمولة جزئية</option>
                            <option value="local_delivery">توصيل محلي</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-md border border-border w-full sm:w-auto">
                        <LuFilter className="w-4 h-4 text-body shrink-0" />
                        <select
                            value={filterStatus}
                            onChange={handleFilterStatusChange}
                            className="bg-transparent text-xs font-bold text-heading focus:outline-none cursor-pointer w-full"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="created">حديثة</option>
                            <option value="confirmed">مؤكدة </option>
                            <option value="assigned">معينة لناقل </option>
                            <option value="ready_for_pickup">جاهزة للاستلام </option>
                            <option value="picked_up">تم الاستلام </option>
                            <option value="in_transit">في الطريق </option>
                            <option value="arrived">وصلت للمركز </option>
                            <option value="out_for_delivery">خرجت للتوصيل </option>
                            <option value="delivered">تم التوصيل </option>
                            <option value="delivery_failed">فشل التوصيل </option>
                            <option value="cancelled">ملغية </option>
                            <option value="returned">مرتجعة </option>
                            <option value="exception">حالة استثنائية </option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {shipmentsList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="لا توجد شحنات تطابق خيارات البحث أو التصفية الحالية" icon={LuTruck} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4">رقم الشحنة / البوليصة</th>
                                    <th className="py-3.5 px-4">الشركة المالكة</th>
                                    <th className="py-3.5 px-4">نوع الخدمة والمسار</th>
                                    <th className="py-3.5 px-4">عدد الطلبات</th>
                                    <th className="py-3.5 px-4">تكلفة وسعر السداد</th>
                                    <th className="py-3.5 px-4">الحالة</th>
                                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {shipmentsList.map((shp) => {
                                    const compName = typeof shp.companyId === 'object' && shp.companyId !== null
                                        ? (shp.companyId as Company).companyName
                                        : 'غير محددة';

                                    return (
                                        <tr key={shp._id} className="hover:bg-surface-muted/40 transition-colors">
                                            <td className="py-3.5 px-4 font-latin">
                                                <div className="font-bold text-accent">{shp.shipmentNumber}</div>
                                                {shp.waybillNumber ? (
                                                    <div className="text-[11px] font-semibold text-purple-600 font-latin">
                                                        📄 {shp.waybillNumber}
                                                    </div>
                                                ) : null}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <LuBuilding2 className="w-4 h-4 text-body shrink-0" />
                                                    <span className="font-bold text-heading text-xs">{compName}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div>
                                                    <span className="font-bold text-heading flex items-center gap-1 text-xs">
                                                        <LuMapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                                                        {shp.origin} ⬅️ {shp.destination}
                                                    </span>
                                                    <span className="text-[11px] text-body block mt-0.5">{getTypeBadge(shp.type)}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-xs font-latin font-bold text-heading">
                                                {shp.ordersCount || 1} طلب
                                            </td>

                                            <td className="py-3.5 px-4 text-xs font-latin">
                                                <div className="flex flex-col">
                                                    <span className="text-heading font-bold">{shp.customerPrice} ر.س <span className="text-[10px] text-body font-arabic font-normal">(للعميل)</span></span>
                                                    <span className="text-body text-[11px]">{shp.shippingCost} ر.س <span className="text-[10px] font-arabic font-normal">(التكلفة)</span></span>
                                                </div>
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
                                                        title="تعديل الشحنة"
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

                {/* Pagination Controls */}
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

            {/* Modals Mounting */}
            <AddShipments
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <BulkImportAdminShipmentsPopup
                isOpen={isBulkImportOpen}
                onClose={() => {
                    setIsBulkImportOpen(false);
                    refetch();
                }}
            />

            <EditShipments
                isOpen={!!selectedShipmentForEdit}
                shipment={selectedShipmentForEdit}
                onClose={() => setSelectedShipmentForEdit(null)}
            />

            <DetailsShipments
                isOpen={!!selectedShipmentForDetails}
                shipment={selectedShipmentForDetails}
                onClose={() => setSelectedShipmentForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedShipmentForDelete}
                title="تأكيد حذف الشحنة"
                description={`هل أنت تأكد من رغبتك في حذف الشحنة رقم (${selectedShipmentForDelete?.shipmentNumber})؟ لا يمكن التراجع عن هذا الإجراء لاحقاً.`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedShipmentForDelete(null)}
            />

        </div>
    );
}

