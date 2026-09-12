"use client";

import React, { useState } from 'react';
import { Carrier } from '@/types/data';
import { useCarriers, useDeleteCarrier } from '@/hooks/carriers/useCarriers';
import AddCarriers from './AddCarriers';
import EditCarriers from './EditCarriers';
import DetailsCarriers from './DetailsCarriers';
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
    LuPhone,
    LuMail,
    LuFilter,
    LuCheck,
    LuLayers,
    LuGlobe
} from 'react-icons/lu';

export default function Carriers() {
    // Pagination & Search/Filtering States
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');

    // Modals Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedCarrierForEdit, setSelectedCarrierForEdit] = useState<Carrier | null>(null);
    const [selectedCarrierForDetails, setSelectedCarrierForDetails] = useState<Carrier | null>(null);
    const [selectedCarrierForDelete, setSelectedCarrierForDelete] = useState<Carrier | null>(null);

    // React Query Hooks with server-side search & filtering
    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useCarriers(page, limit, searchQuery, filterStatus, filterType);
    const { mutate: deleteCarrier, isPending: isDeleting } = useDeleteCarrier();

    // Initial Loading Check (Standard Rule)
    if (isLoading) return <Loading />;

    const carriersList = responseData?.data || [];
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
    const serverStats = responseData?.stats;
    const stats = {
        total: serverStats?.total ?? totalRecords,
        local: serverStats?.local ?? 0,
        external: serverStats?.external ?? 0,
        active: serverStats?.active ?? 0,
    };

    const handleDeleteConfirm = () => {
        if (!selectedCarrierForDelete) return;
        deleteCarrier(
            { id: selectedCarrierForDelete._id, hard: true },
            {
                onSuccess: () => {
                    setSelectedCarrierForDelete(null);
                },
            }
        );
    };

    return (
        <div className="space-y-6 text-right font-arabic" dir="rtl">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shadow-xs">
                            <LuTruck className="w-5 h-5" />
                        </span>
                        إدارة الناقلين والشركاء اللوجستيين
                    </h1>
                    <p className="text-xs text-body mt-1">إدارة الشركات الناقلة الشريكة وتحديد نوع الربط ووسائل الاتصال المباشرة</p>
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
                        <span>إضافة ناقل جديد</span>
                    </button>
                </div>
            </div>

            {/* Error Notification Banner */}
            {isError && (
                <div className="mb-4">
                    <ErrorMessege message={(error as any)?.message || 'تعذر جلب بيانات الناقلين من الخادم'} />
                </div>
            )}

            {/* KPI Stats Grid - Matching Standard Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Carriers */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">إجمالي الناقلين</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.total}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>المسجلين بالمنصة</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuTruck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Local Carriers */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">الناقلون المحليون</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.local}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>تشغيل محلي مباشر</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuLayers className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* External API Carriers */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">الربط الخارجي (API)</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.external}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>متصل عبر البرمجيات</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuGlobe className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Active Carriers */}
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">الناقلون النشطون</span>
                            <h3 className="text-2xl font-bold text-heading my-1">{stats.active}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>جاهزون للاستخدام</span>
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
                        placeholder="بحث باسم الناقل، الجوال، البريد..."
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
                            <option value="local">مستقل محلي</option>
                            <option value="external_api">ربط خارجي API</option>
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
                            <option value="active">نشط ومتاح</option>
                            <option value="inactive">موقوف مؤقتاً</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {carriersList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="لا يوجد ناقلون يطابقون خيارات البحث أو التصفية الحالية" icon={LuTruck} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4">اسم الناقل</th>
                                    <th className="py-3.5 px-4">نوع الناقل والربط</th>
                                    <th className="py-3.5 px-4">هاتف التواصل</th>
                                    <th className="py-3.5 px-4">البريد الإلكتروني</th>
                                    <th className="py-3.5 px-4">الحالة</th>
                                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {carriersList.map((car) => (
                                    <tr key={car._id} className="hover:bg-surface-muted/40 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-heading">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-md bg-accent/10 text-accent flex items-center justify-center font-bold">
                                                    <LuTruck className="w-4 h-4" />
                                                </div>
                                                <span>{car.name}</span>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 text-xs font-semibold text-heading">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                                                car.type === 'external_api'
                                                    ? 'bg-purple-500/10 text-purple-600 border-purple-200'
                                                    : 'bg-blue-500/10 text-blue-600 border-blue-200'
                                            }`}>
                                                {car.type === 'external_api' ? 'ربط خارجي API' : 'ناقل محلي'}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4 text-xs font-latin text-heading">
                                            <div className="flex items-center gap-1.5">
                                                <LuPhone className="w-3.5 h-3.5 text-accent shrink-0" />
                                                <span>{car.contactPhone || 'غير محدد'}</span>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 text-xs font-latin text-heading">
                                            <div className="flex items-center gap-1.5">
                                                <LuMail className="w-3.5 h-3.5 text-accent shrink-0" />
                                                <span>{car.contactEmail || 'غير محدد'}</span>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                car.isActive !== false
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                                                    : 'bg-rose-500/10 text-rose-600 border-rose-200'
                                            }`}>
                                                {car.isActive !== false ? 'نشط' : 'موقوف'}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setSelectedCarrierForDetails(car)}
                                                    title="عرض التفاصيل"
                                                    className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                >
                                                    <LuEye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => setSelectedCarrierForEdit(car)}
                                                    title="تعديل الناقل"
                                                    className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                >
                                                    <LuPencil className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => setSelectedCarrierForDelete(car)}
                                                    title="حذف الناقل"
                                                    className="p-2 rounded-md bg-surface-muted hover:bg-rose-500/10 text-body hover:text-rose-600 border border-border transition-all cursor-pointer"
                                                >
                                                    <LuTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs font-bold text-body">
                        <span className="text-body font-medium">
                            عرض الصفحة <b className="font-latin text-heading">{page}</b> من <b className="font-latin text-heading">{totalPages}</b> (إجمالي {totalRecords} ناقل)
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
            <AddCarriers
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <EditCarriers
                isOpen={!!selectedCarrierForEdit}
                carrier={selectedCarrierForEdit}
                onClose={() => setSelectedCarrierForEdit(null)}
            />

            <DetailsCarriers
                isOpen={!!selectedCarrierForDetails}
                carrier={selectedCarrierForDetails}
                onClose={() => setSelectedCarrierForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedCarrierForDelete}
                title="تأكيد حذف الناقل"
                description={`هل أنت تأكد من رغبتك في حذف الناقل (${selectedCarrierForDelete?.name})؟ لا يمكن التراجع عن هذا الإجراء لاحقاً.`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedCarrierForDelete(null)}
            />

        </div>
    );
}
