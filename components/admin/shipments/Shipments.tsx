"use client";

import React, { useState } from 'react';
import { Shipment, Company } from '@/types/data';
import { useShipments, useDeleteShipment } from '@/hooks/shipments/useShipments';
import AddShipments from './AddShipments';
import EditShipments from './EditShipments';
import DetailsShipments from './DetailsShipments';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
import ErrorMessege from '@/components/ui/ErrorMessege';
import {
    LuPackage,
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
    LuTruck,
    LuMapPin
} from 'react-icons/lu';

export default function Shipments() {
    // 1. Pagination & Search/Filtering States
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');

    // 2. Modals Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedShipmentForEdit, setSelectedShipmentForEdit] = useState<Shipment | null>(null);
    const [selectedShipmentForDetails, setSelectedShipmentForDetails] = useState<Shipment | null>(null);
    const [selectedShipmentForDelete, setSelectedShipmentForDelete] = useState<Shipment | null>(null);

    // 3. React Query Hooks with server-side search & filtering
    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useShipments(page, limit, searchQuery, filterStatus, filterType);
    const { mutate: deleteShipment, isPending: isDeleting } = useDeleteShipment();

    // 4. Initial Loading Check (Standard Rule)
    if (isLoading) return <Loading />;

    const shipmentsList = responseData?.data || [];
    const totalRecords = responseData?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    // Rule 1: Always setPage(1) on search/filter changes
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

    const statusBadge = (status?: string) => {
        const map: Record<string, { label: string; bg: string }> = {
            created: { label: 'تمت الإنشائية', bg: 'bg-slate-500/10 text-slate-600 border-slate-200' },
            confirmed: { label: 'مؤكدة', bg: 'bg-amber-500/10 text-amber-600 border-amber-200' },
            assigned: { label: 'تم التخصيص', bg: 'bg-blue-500/10 text-blue-600 border-blue-200' },
            ready_for_pickup: { label: 'جاهزة للتحميل', bg: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
            in_transit: { label: 'في الطريق', bg: 'bg-purple-500/10 text-purple-600 border-purple-200' },
            delivered: { label: 'تم التسليم', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
            cancelled: { label: 'ملغاة', bg: 'bg-rose-500/10 text-rose-600 border-rose-200' },
        };
        const st = map[status || 'created'] || { label: status || '', bg: 'bg-surface-muted text-body border-border' };

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${st.bg}`}>
                {st.label}
            </span>
        );
    };

    return (
        <div className="space-y-6 text-right font-arabic" dir="rtl">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
                            <LuPackage className="w-5 h-5" />
                        </span>
                        إدارة الشحنات وتعيين الموارد
                    </h1>
                    <p className="text-xs text-body mt-1">متابعة الشحنات وتعيين المسارات اللوجستية والناقلين وتكاليف السداد</p>
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
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
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

            {/* KPI Stats Grid - Matching Standard Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Shipments */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">إجمالي الشحنات</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.total}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>المسجلة بالمنصة</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                            <LuPackage className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Created & Confirmed */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">شحنات جديدة ومؤكدة</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.created}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>بانتظار التخصيص</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                            <LuClock className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* In Transit */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">شحنات في الطريق</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.inTransit}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>جاري النقل اللوجستي</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                            <LuTruck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Delivered */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">شحنات مسلمة</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.delivered}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>تم التسليم بنجاح</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
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
                            <option value="created">أنشئت حديثاً</option>
                            <option value="assigned">تم تعيين الموارد</option>
                            <option value="in_transit">في الطريق</option>
                            <option value="delivered">تم التسليم</option>
                            <option value="cancelled">ملغاة</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {shipmentsList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="لا توجد شحنات تطابق خيارات البحث أو التصفية الحالية" icon={LuPackage} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4">رقم الشحنة</th>
                                    <th className="py-3.5 px-4">الشركة المالكة</th>
                                    <th className="py-3.5 px-4">المسار (الانطلاق ➔ الوجهة)</th>
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
                                            <td className="py-3.5 px-4 font-latin font-bold text-accent">
                                                {shp.shipmentNumber}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <LuBuilding2 className="w-4 h-4 text-body shrink-0" />
                                                    <span className="font-bold text-heading text-xs">{compName}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-xs font-bold text-heading">
                                                <div className="flex items-center gap-1.5">
                                                    <LuMapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                    <span>{shp.origin}</span>
                                                    <span className="text-accent">➔</span>
                                                    <LuMapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                                    <span>{shp.destination}</span>
                                                </div>
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
