/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useCompanyOrders, useDeleteCompanyOrder } from '@/hooks/company/useCompanyOrder';
import AddCompanyOrderPopup from './AddCompanyOrderPopup';
import EditCompanyOrderPopup from './EditCompanyOrderPopup';
import DetailsCompanyOrderPopup from './DetailsCompanyOrderPopup';
import GroupCompanyOrdersPopup from './GroupCompanyOrdersPopup';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import ErrorMessege from '@/components/ui/ErrorMessege';
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
    LuClock,
    LuCheck,
    LuTruck,
    LuMapPin,
    LuLayers,
    LuCalendar,
    LuX
} from 'react-icons/lu';

export default function CompanyOrders() {
    // 1. Pagination & Search States
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');

    // 2. Date Range Filter States (Default to TODAY's date)
    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState<string>(todayStr);
    const [endDate, setEndDate] = useState<string>(todayStr);
    const [datePreset, setDatePreset] = useState<'today' | 'month' | 'all'>('today');

    // 3. Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isGroupShipmentOpen, setIsGroupShipmentOpen] = useState(false);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<any | null>(null);
    const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any | null>(null);
    const [selectedOrderForDelete, setSelectedOrderForDelete] = useState<any | null>(null);

    // 4. Custom React Query Hook for Company Orders
    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useCompanyOrders(page, limit, searchQuery, startDate, endDate);
    const { mutate: deleteOrder, isPending: isDeleting } = useDeleteCompanyOrder();

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

    const ordersList = responseData?.data || [];
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
        pending: serverStats?.pending ?? 0,
        shipped: serverStats?.shipped ?? 0,
        delivered: serverStats?.delivered ?? 0,
    };

    const handleDeleteConfirm = () => {
        if (!selectedOrderForDelete) return;
        deleteOrder(
            { id: selectedOrderForDelete._id },
            {
                onSuccess: () => {
                    setSelectedOrderForDelete(null);
                },
            }
        );
    };

    const statusBadge = (status?: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        قيد الانتظار
                    </span>
                );
            case 'validated':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                        مؤكد
                    </span>
                );
            case 'grouped':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                        مجمع بشحنة
                    </span>
                );
            case 'shipped':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                        تم الشحن
                    </span>
                );
            case 'delivered':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        تم التوصيل
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        ملغي
                    </span>
                );
            case 'error':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                        خطأ في البيانات
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

    const selectedOrders = ordersList.filter((o: any) => selectedOrderIds.includes(o._id));

    return (
        <div className="space-y-6 text-right font-arabic" dir="rtl">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
                            <LuPackage className="w-5 h-5" />
                        </span>
                        إدارة طلبات الشركة
                    </h1>
                    <p className="text-xs text-body mt-1">مراقبة حية وإدارة شاملة لجميع الطلبات الخاصة بشركتك وتجميعها في شحنات</p>
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
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground text-xs font-bold hover:shadow-md hover:shadow-accent/20 transition-all"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>إضافة طلب جديد</span>
                    </button>
                </div>
            </div>

            {/* Error Notification */}
            {isError && (
                <div className="mb-4">
                    <ErrorMessege message={(error as any)?.message || 'تعذر جلب بيانات الطلبات من الخادم'} />
                </div>
            )}

            {/* Date Range Selector Header Bar */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-heading">
                    <LuCalendar className="w-4 h-4 text-accent shrink-0" />
                    <span>تصفية الفترات الزمنية للطلبات:</span>
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
                            <span className="text-xs font-semibold text-body block mb-1">إجمالي الطلبات</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.total}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>مسجلة لشركتك</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuPackage className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">قيد الانتظار</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.pending}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>جاهزة للتجميع والشحن</span>
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
                            <span className="text-xs font-semibold text-body block mb-1">تم الشحن</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.shipped}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>في الطريق للعميل</span>
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
                            <span className="text-xs font-semibold text-body block mb-1">تم التوصيل</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.delivered}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>مكتملة ومسلمة</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Batch Action Bar for Order Grouping */}
            {selectedOrderIds.length > 0 && (
                <div className="bg-accent-soft/40 border border-accent/30 p-4 rounded-xl flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-accent text-white font-bold flex items-center justify-center text-xs font-latin">
                            {selectedOrderIds.length}
                        </span>
                        <span className="text-sm font-bold text-heading">طلبات محددة للتجميع في شحنة واحدة</span>
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
                            <span>تجميع الطلبات المحددة في شحنة</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Search Controller Header */}
            <div className="bg-surface p-4 rounded-md border border-border flex items-center justify-between">
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
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {ordersList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="لا توجد طلبات مسجلة للشركة تطابق خيارات البحث الحالية" icon={LuPackage} />
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
                                                    setSelectedOrderIds(ordersList.map((o: any) => o._id));
                                                } else {
                                                    setSelectedOrderIds([]);
                                                }
                                            }}
                                            className="rounded border-border text-accent focus:ring-accent cursor-pointer"
                                        />
                                    </th>
                                    <th className="py-3.5 px-4">رقم الطلب</th>
                                    <th className="py-3.5 px-4">المستلم والجوال</th>
                                    <th className="py-3.5 px-4">المدينة والعنوان</th>
                                    <th className="py-3.5 px-4">الوزن / الكمية</th>
                                    <th className="py-3.5 px-4">القيمة / COD</th>
                                    <th className="py-3.5 px-4">الحالة</th>
                                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {ordersList.map((ord: any) => {
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
                                                    <span className="text-body text-[11px] truncate max-w-[160px] block">{ord.recipientAddress}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 font-latin text-xs font-semibold text-heading">
                                                <div>{ord.weight} كجم</div>
                                                <div className="text-body text-[11px]">{ord.quantity || 1} طرد</div>
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

                {/* Pagination */}
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

            {/* Modals */}
            <AddCompanyOrderPopup
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <GroupCompanyOrdersPopup
                isOpen={isGroupShipmentOpen}
                selectedOrders={selectedOrders}
                onClose={() => setIsGroupShipmentOpen(false)}
                onSuccessGroup={() => {
                    setSelectedOrderIds([]);
                    refetch();
                }}
            />

            <EditCompanyOrderPopup
                isOpen={!!selectedOrderForEdit}
                orderData={selectedOrderForEdit}
                onClose={() => setSelectedOrderForEdit(null)}
            />

            <DetailsCompanyOrderPopup
                isOpen={!!selectedOrderForDetails}
                orderData={selectedOrderForDetails}
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
