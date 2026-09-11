"use client";

import React, { useState } from 'react';
import { Order, Company } from '@/types/data';
import { useOrders, useDeleteOrder } from '@/hooks/orders/useOrders';
import AddOrders from './AddOrders';
import EditOrders from './EditOrders';
import DetailsOrders from './DetailsOrders';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import ErrorMessege from '@/components/ui/ErrorMessege';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
import BulkImportAdminOrdersPopup from './BulkImportAdminOrdersPopup';
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
    LuClock,
    LuCheck,
    LuTruck,
    LuMapPin,
    LuLayers,
    LuFileSpreadsheet
} from 'react-icons/lu';
import AddShipments from '../shipments/AddShipments';

export default function Orders() {
    // 1. Pagination & Search/Filtering States
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // 2. Modals Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [isGroupShipmentOpen, setIsGroupShipmentOpen] = useState(false);

    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
    const [selectedOrderForDelete, setSelectedOrderForDelete] = useState<Order | null>(null);

    // 3. React Query Hooks with server-side search & filtering
    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useOrders(page, limit, searchQuery, filterStatus);
    const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();

    // 4. Initial Loading Check (Standard Rule)
    if (isLoading) return <Loading />;

    const ordersList = responseData?.data || [];
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

    // Stats Calculation directly from backend API response stats
    const serverStats = responseData?.stats;
    const stats = {
        total: serverStats?.total ?? totalRecords,
        pending: serverStats?.pending ?? 0,
        shipped: (serverStats?.shipped ?? 0) + (serverStats?.grouped ?? 0),
        delivered: serverStats?.delivered ?? 0,
    };

    const handleDeleteConfirm = () => {
        if (!selectedOrderForDelete) return;
        deleteOrder(
            { id: selectedOrderForDelete._id, hard: true },
            {
                onSuccess: () => {
                    setSelectedOrderForDelete(null);
                },
            }
        );
    };

    const statusBadge = (status?: string) => {
        const map = {
            pending: { label: 'معلق', bg: 'bg-amber-500/10 text-amber-600 border-amber-200' },
            validated: { label: 'مكتمل الفحص', bg: 'bg-blue-500/10 text-blue-600 border-blue-200' },
            error: { label: 'خطأ', bg: 'bg-rose-500/10 text-rose-600 border-rose-200' },
            grouped: { label: 'مجمع', bg: 'bg-purple-500/10 text-purple-600 border-purple-200' },
            shipped: { label: 'جاري الشحن', bg: 'bg-cyan-500/10 text-cyan-600 border-cyan-200' },
            delivered: { label: 'تم التسليم', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
            cancelled: { label: 'ملغي', bg: 'bg-slate-500/10 text-slate-600 border-slate-200' },
        }[status || 'pending'] || { label: status, bg: 'bg-surface-muted text-body border-border' };

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${map.bg}`}>
                {map.label}
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
                        إدارة سجل الطلبات والشحنات
                    </h1>
                    <p className="text-xs text-body mt-1">مراقبة حية وإدارة شاملة لجميع الطلبات والشحنات الصادرة في منصة شحنتك</p>
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
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-accent-soft text-accent font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                        <LuFileSpreadsheet className="w-4 h-4" />
                        <span>استيراد Excel جماعي</span>
                    </button>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>إضافة طلب جديد</span>
                    </button>
                </div>
            </div>


            {/* Error Notification Banner */}
            {isError && (
                <div className="mb-4">
                    <ErrorMessege message={(error as any)?.message || 'تعذر جلب بيانات الطلبات من الخادم'} />
                </div>
            )}

            {/* KPI Stats Grid - Matching Companies.tsx Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Orders */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">إجمالي الطلبات</span>
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

                {/* Pending Orders */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">الطلبات المعلقة</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.pending}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>في انتظار المعالجة</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                            <LuClock className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Shipped Orders */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">في الطريق / مجمعة</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.shipped}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>جاري التوصيل</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                            <LuTruck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Delivered Orders */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">تم التسليم بنجاح</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.delivered}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>مكتملة بالكامل</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                            <LuCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Batch Action Bar when orders are selected */}
            {selectedOrderIds.length > 0 && (
                <div className="bg-accent-soft/30 border border-accent/30 p-4 rounded-xl flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-accent text-accent-foreground font-bold flex items-center justify-center text-xs">
                            {selectedOrderIds.length}
                        </span>
                        <span className="text-sm font-bold text-heading">طلبات محددة للتجميع</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedOrderIds([])}
                            className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-body hover:text-heading hover:bg-surface transition-all cursor-pointer"
                        >
                            إلغاء التحديد
                        </button>

                        <button
                            onClick={() => setIsGroupShipmentOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
                        >
                            <LuLayers className="w-4 h-4" />
                            <span>تجميع الطلبات المحددة في شحنة واحدة</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Filter and Search Controller Header */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="بحث برقم الطلب، اسم المستلم، الجوال، المدينة..."
                        className="w-full pl-4 pr-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-md border border-border w-full md:w-auto">
                        <LuFilter className="w-4 h-4 text-body shrink-0" />
                        <select
                            value={filterStatus}
                            onChange={handleFilterStatusChange}
                            className="bg-transparent text-xs font-bold text-heading focus:outline-none cursor-pointer w-full"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="pending">معلق </option>
                            <option value="validated">مكتمل الفحص</option>
                            <option value="grouped">مجمع </option>
                            <option value="shipped">جاري الشحن </option>
                            <option value="delivered">تم التسليم </option>
                            <option value="cancelled">ملغي </option>
                            <option value="error">خطأ</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {ordersList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="لا توجد طلبات تطابق خيارات البحث أو التصفية الحالية" icon={LuPackage} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={ordersList.length > 0 && selectedOrderIds.length === ordersList.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedOrderIds(ordersList.map(o => o._id));
                                                } else {
                                                    setSelectedOrderIds([]);
                                                }
                                            }}
                                            className="rounded border-border text-accent focus:ring-accent cursor-pointer"
                                        />
                                    </th>
                                    <th className="py-3.5 px-4">رقم الطلب</th>
                                    <th className="py-3.5 px-4">الشركة المنشئة</th>
                                    <th className="py-3.5 px-4">المستلم والجوال</th>
                                    <th className="py-3.5 px-4">المدينة والعنوان</th>
                                    <th className="py-3.5 px-4">الوزن / الكمية</th>
                                    <th className="py-3.5 px-4">القيمة / COD</th>
                                    <th className="py-3.5 px-4">الحالة</th>
                                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {ordersList.map((ord) => {
                                    const compName = typeof ord.companyId === 'object' && ord.companyId !== null
                                        ? (ord.companyId as Company).companyName
                                        : 'غير محددة';

                                    return (
                                        <tr key={ord._id} className="hover:bg-surface-muted/40 transition-colors">
                                            <td className="py-3.5 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrderIds.includes(ord._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedOrderIds((prev) => [...prev, ord._id]);
                                                        } else {
                                                            setSelectedOrderIds((prev) => prev.filter((id) => id !== ord._id));
                                                        }
                                                    }}
                                                    className="rounded border-border text-accent focus:ring-accent cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-3.5 px-4 font-latin font-bold text-accent">
                                                {ord.orderNumber}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <LuBuilding2 className="w-4 h-4 text-body shrink-0" />
                                                    <span className="font-bold text-heading text-xs">{compName}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div>
                                                    <span className="font-bold text-heading block">{ord.recipientName}</span>
                                                    <span className="text-xs text-body font-latin">{ord.recipientPhone}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="text-xs">
                                                    <span className="font-bold text-heading flex items-center gap-1">
                                                        <LuMapPin className="w-3.5 h-3.5 text-accent" />
                                                        {ord.recipientCity}
                                                    </span>
                                                    <span className="text-body text-[11px] truncate max-w-[150px] block">{ord.recipientAddress}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 font-latin text-xs font-semibold text-heading">
                                                <div>{ord.weight} كجم</div>
                                                <div className="text-body text-[11px]">{ord.quantity} طرد</div>
                                            </td>

                                            <td className="py-3.5 px-4 font-latin text-xs">
                                                <div className="font-bold text-emerald-600">{ord.orderValue} ر.س</div>
                                                {ord.codAmount ? (
                                                    <div className="text-amber-600 font-medium text-[11px]">COD: {ord.codAmount}</div>
                                                ) : null}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {statusBadge(ord.status)}
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedOrderForDetails(ord)}
                                                        title="عرض التفاصيل"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedOrderForEdit(ord)}
                                                        title="تعديل البيانات"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedOrderForDelete(ord)}
                                                        title="حذف الطلب"
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
                            عرض الصفحة <b className="font-latin text-heading">{page}</b> من <b className="font-latin text-heading">{totalPages}</b> (إجمالي {totalRecords} طلب)
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
            <AddOrders
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <BulkImportAdminOrdersPopup
                isOpen={isBulkImportOpen}
                onClose={() => {
                    setIsBulkImportOpen(false);
                    refetch();
                }}
            />

            {/* Calculate common company and destination for selected orders */}
            {(() => {
                const selectedOrders = ordersList.filter((o) => selectedOrderIds.includes(o._id));
                const commonCompanyId = selectedOrders.length > 0
                    ? (typeof selectedOrders[0].companyId === 'object' && selectedOrders[0].companyId !== null
                        ? (selectedOrders[0].companyId as Company)._id
                        : (selectedOrders[0].companyId as string))
                    : '';
                const commonDestination = selectedOrders.length > 0 ? selectedOrders[0].recipientCity : 'جدة';

                return (
                    <AddShipments
                        isOpen={isGroupShipmentOpen}
                        initialOrderIds={selectedOrderIds}
                        initialCompanyId={commonCompanyId}
                        initialDestination={commonDestination}
                        isGrouping={true}
                        onClose={() => {
                            setIsGroupShipmentOpen(false);
                            setSelectedOrderIds([]);
                            refetch();
                        }}
                    />
                );
            })()}

            <EditOrders
                isOpen={!!selectedOrderForEdit}
                order={selectedOrderForEdit}
                onClose={() => setSelectedOrderForEdit(null)}
            />

            <DetailsOrders
                isOpen={!!selectedOrderForDetails}
                order={selectedOrderForDetails}
                onClose={() => setSelectedOrderForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedOrderForDelete}
                title="تأكيد حذف الطلب"
                description={`هل أنت تأكد من رغبتك في حذف الطلب (${selectedOrderForDelete?.orderNumber})؟ لا يمكن التراجع عن هذا الإجراء لاحقاً.`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedOrderForDelete(null)}
            />

        </div>
    );
}
