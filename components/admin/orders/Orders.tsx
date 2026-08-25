"use client";

import React, { useState, useMemo } from 'react';
import { Order, Company } from '@/types/data';
import { useOrders, useDeleteOrder } from '@/hooks/orders/useOrders';
import AddOrders from './AddOrders';
import EditOrders from './EditOrders';
import DetailsOrders from './DetailsOrders';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
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
    LuMapPin
} from 'react-icons/lu';

export default function Orders() {
    // 1. Pagination & Search/Filtering States
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // 2. Modals Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
    const [selectedOrderForDelete, setSelectedOrderForDelete] = useState<Order | null>(null);

    // 3. React Query Hooks
    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useOrders(page, limit);
    const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();

    // 4. Initial Loading Check (Standard Rule)
    if (isLoading) return <Loading />;

    const ordersList = responseData?.data || [];
    const totalRecords = responseData?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    // Rule 2: Always setPage(1) on search/filter changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleFilterStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterStatus(e.target.value);
        setPage(1);
    };

    // Client side filtering over current page
    const filteredOrders = ordersList.filter((ord) => {
        const companyName = typeof ord.companyId === 'object' && ord.companyId !== null
            ? (ord.companyId as Company).companyName
            : '';

        const matchesSearch =
            ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ord.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ord.recipientPhone.includes(searchQuery) ||
            ord.recipientCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
            companyName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'all' || ord.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Stats Calculation
    const stats = {
        total: totalRecords || ordersList.length,
        pending: ordersList.filter(o => o.status === 'pending').length,
        shipped: ordersList.filter(o => o.status === 'shipped' || o.status === 'grouped').length,
        delivered: ordersList.filter(o => o.status === 'delivered').length,
    };

    const handleDeleteConfirm = () => {
        if (!selectedOrderForDelete) return;
        deleteOrder(
            { id: selectedOrderForDelete._id, hard: false },
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
        <div className="space-y-6" dir="rtl">

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
                        title="إعادة جلب البيانات"
                        className="p-2.5 rounded-xl bg-surface border border-border text-body hover:text-heading hover:bg-surface-muted transition-all cursor-pointer disabled:opacity-50"
                    >
                        <LuRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-accent' : ''}`} />
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
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold flex items-center justify-between">
                    <span>تعذر جلب بيانات الطلبات: {(error as any)?.message || 'حدث خطأ في الاتصال بالخادم'}</span>
                    <button onClick={() => refetch()} className="underline text-xs cursor-pointer">إعادة المحاولة</button>
                </div>
            )}

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface p-5 rounded-3xl border border-border shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                        <LuPackage className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-body font-medium block">إجمالي الطلبات</span>
                        <span className="text-2xl font-extrabold text-heading font-latin">{stats.total}</span>
                    </div>
                </div>

                <div className="bg-surface p-5 rounded-3xl border border-border shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <LuClock className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-body font-medium block">الطلبات المعلقة</span>
                        <span className="text-2xl font-extrabold text-amber-600 font-latin">{stats.pending}</span>
                    </div>
                </div>

                <div className="bg-surface p-5 rounded-3xl border border-border shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center shrink-0">
                        <LuTruck className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-body font-medium block">في الطريق / مجمعة</span>
                        <span className="text-2xl font-extrabold text-cyan-600 font-latin">{stats.shipped}</span>
                    </div>
                </div>

                <div className="bg-surface p-5 rounded-3xl border border-border shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <LuCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-body font-medium block">تم التسليم بنجاح</span>
                        <span className="text-2xl font-extrabold text-emerald-600 font-latin">{stats.delivered}</span>
                    </div>
                </div>
            </div>

            {/* Filter and Search Controller Header */}
            <div className="bg-surface p-4 rounded-3xl border border-border shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="بحث برقم الطلب، اسم المستلم، الجوال، المدينة..."
                        className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-2xl border border-border w-full md:w-auto">
                        <LuFilter className="w-4 h-4 text-body shrink-0" />
                        <select
                            value={filterStatus}
                            onChange={handleFilterStatusChange}
                            className="bg-transparent text-sm text-heading font-bold focus:outline-none cursor-pointer w-full"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="pending">معلق (Pending)</option>
                            <option value="validated">مكتمل الفحص (Validated)</option>
                            <option value="grouped">مجمع (Grouped)</option>
                            <option value="shipped">جاري الشحن (Shipped)</option>
                            <option value="delivered">تم التسليم (Delivered)</option>
                            <option value="cancelled">ملغي (Cancelled)</option>
                            <option value="error">خطأ (Error)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-3xl border border-border shadow-xs overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="p-8">
                        <EmptyData message="لا توجد طلبات تطابق خيارات البحث أو التصفية الحالية" icon={LuPackage} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-4 px-6">رقم الطلب</th>
                                    <th className="py-4 px-6">الشركة المنشئة</th>
                                    <th className="py-4 px-6">المستلم والجوال</th>
                                    <th className="py-4 px-6">المدينة والعنوان</th>
                                    <th className="py-4 px-6">الوزن / الكمية</th>
                                    <th className="py-4 px-6">القيمة / COD</th>
                                    <th className="py-4 px-6">الحالة</th>
                                    <th className="py-4 px-6 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-sm">
                                {filteredOrders.map((ord) => {
                                    const compName = typeof ord.companyId === 'object' && ord.companyId !== null
                                        ? (ord.companyId as Company).companyName
                                        : 'غير محددة';

                                    return (
                                        <tr key={ord._id} className="hover:bg-surface-muted/40 transition-colors">
                                            <td className="py-4 px-6 font-latin font-bold text-accent">
                                                {ord.orderNumber}
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <LuBuilding2 className="w-4 h-4 text-body shrink-0" />
                                                    <span className="font-bold text-heading text-xs">{compName}</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div>
                                                    <span className="font-bold text-heading block">{ord.recipientName}</span>
                                                    <span className="text-xs text-body font-latin">{ord.recipientPhone}</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="text-xs">
                                                    <span className="font-bold text-heading flex items-center gap-1">
                                                        <LuMapPin className="w-3 h-3 text-accent" />
                                                        {ord.recipientCity}
                                                    </span>
                                                    <span className="text-body text-[11px] truncate max-w-[150px] block">{ord.recipientAddress}</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 font-latin text-xs font-semibold text-heading">
                                                <div>{ord.weight} كجم</div>
                                                <div className="text-body text-[11px]">{ord.quantity} طرد</div>
                                            </td>

                                            <td className="py-4 px-6 font-latin text-xs">
                                                <div className="font-bold text-emerald-600">{ord.orderValue} ر.س</div>
                                                {ord.codAmount ? (
                                                    <div className="text-amber-600 font-medium text-[11px]">COD: {ord.codAmount}</div>
                                                ) : null}
                                            </td>

                                            <td className="py-4 px-6">
                                                {statusBadge(ord.status)}
                                            </td>

                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedOrderForDetails(ord)}
                                                        title="عرض التفاصيل"
                                                        className="p-2 rounded-xl bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedOrderForEdit(ord)}
                                                        title="تعديل البيانات"
                                                        className="p-2 rounded-xl bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedOrderForDelete(ord)}
                                                        title="حذف الطلب"
                                                        className="p-2 rounded-xl bg-surface-muted hover:bg-rose-500/10 text-body hover:text-rose-600 border border-border transition-all cursor-pointer"
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
                    <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs">
                        <span className="text-body font-medium">
                            عرض الصفحة <b className="font-latin text-heading">{page}</b> من <b className="font-latin text-heading">{totalPages}</b> (إجمالي {totalRecords} طلب)
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                            >
                                <LuChevronRight className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl border border-border bg-surface text-heading hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                            >
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
                description={`هل أنت تأكد من رغبتك في نقل الطلب (${selectedOrderForDelete?.orderNumber}) لسلة المحذوفات؟`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedOrderForDelete(null)}
            />

        </div>
    );
}

