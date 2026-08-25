"use client";

import React, { useState } from 'react';
import { Vehicle } from '@/types/data';
import { useVehicles, useDeleteVehicle } from '@/hooks/vehicles/useVehicles';
import AddVehicles from './AddVehicles';
import EditVehicles from './EditVehicles';
import DetailsVehicles from './DetailsVehicles';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
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
    LuWeight,
    LuBox,
    LuFilter,
    LuCheck,
    LuX
} from 'react-icons/lu';

export default function Vehicles() {
    // 1. Pagination & Search/Filtering States
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    // 2. Modals Control States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedVehicleForEdit, setSelectedVehicleForEdit] = useState<Vehicle | null>(null);
    const [selectedVehicleForDetails, setSelectedVehicleForDetails] = useState<Vehicle | null>(null);
    const [selectedVehicleForDelete, setSelectedVehicleForDelete] = useState<Vehicle | null>(null);

    // 3. React Query Hooks
    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useVehicles(page, limit);
    const { mutate: deleteVehicle, isPending: isDeleting } = useDeleteVehicle();

    // 4. Initial Loading Check (Standard Rule)
    if (isLoading) return <Loading />;

    const vehiclesList = responseData?.data || [];
    const totalRecords = responseData?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    // Rule 2: Always setPage(1) on search/filter changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleFilterStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterStatus(e.target.value as 'all' | 'active' | 'inactive');
        setPage(1);
    };

    // Client side filtering over current page
    const filteredVehicles = vehiclesList.filter((v) => {
        const matchesSearch = v.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && v.isActive !== false) ||
            (filterStatus === 'inactive' && v.isActive === false);

        return matchesSearch && matchesStatus;
    });

    // Stats Calculation
    const stats = {
        total: totalRecords || vehiclesList.length,
        active: vehiclesList.filter(v => v.isActive !== false).length,
        inactive: vehiclesList.filter(v => v.isActive === false).length,
    };

    const handleDeleteConfirm = () => {
        if (!selectedVehicleForDelete) return;
        deleteVehicle(
            { id: selectedVehicleForDelete._id, hard: false },
            {
                onSuccess: () => {
                    setSelectedVehicleForDelete(null);
                },
            }
        );
    };

    return (
        <div className="space-y-6" dir="rtl">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
                            <LuTruck className="w-5 h-5" />
                        </span>
                        إدارة أسطول المركبات والشاحنات
                    </h1>
                    <p className="text-xs text-body mt-1">تحديد وتسجيل أنواع مركبات الأسطول وسعاتها وأوزانها التشغيلية</p>
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
                        <span>إضافة مركبة للأسطول</span>
                    </button>
                </div>
            </div>

            {/* Error Notification Banner */}
            {isError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold flex items-center justify-between">
                    <span>تعذر جلب بيانات الأسطول: {(error as any)?.message || 'حدث خطأ في الاتصال بالخادم'}</span>
                    <button onClick={() => refetch()} className="underline text-xs cursor-pointer">إعادة المحاولة</button>
                </div>
            )}

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface p-5 rounded-3xl border border-border shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                        <LuTruck className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-body font-medium block">إجمالي أسطول المركبات</span>
                        <span className="text-2xl font-extrabold text-heading font-latin">{stats.total}</span>
                    </div>
                </div>

                <div className="bg-surface p-5 rounded-3xl border border-border shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <LuCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-body font-medium block">المركبات النشطة</span>
                        <span className="text-2xl font-extrabold text-emerald-600 font-latin">{stats.active}</span>
                    </div>
                </div>

                <div className="bg-surface p-5 rounded-3xl border border-border shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                        <LuX className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-body font-medium block">الموقوفة / الصيانة</span>
                        <span className="text-2xl font-extrabold text-rose-600 font-latin">{stats.inactive}</span>
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
                        placeholder="بحث بنوع المركبة..."
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
                            <option value="active">نشطة ومتاحة</option>
                            <option value="inactive">موقوفة / صيانة</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-3xl border border-border shadow-xs overflow-hidden">
                {filteredVehicles.length === 0 ? (
                    <div className="p-8">
                        <EmptyData message="لا توجد مركبات تطابق خيارات البحث أو التصفية الحالية" icon={LuTruck} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-4 px-6">نوع المركبة</th>
                                    <th className="py-4 px-6">الوزن الأقصى (كجم)</th>
                                    <th className="py-4 px-6">الحجم الأقصى (م³)</th>
                                    <th className="py-4 px-6">الحالة</th>
                                    <th className="py-4 px-6 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-sm">
                                {filteredVehicles.map((v) => (
                                    <tr key={v._id} className="hover:bg-surface-muted/40 transition-colors">
                                        <td className="py-4 px-6 font-bold text-heading">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold">
                                                    <LuTruck className="w-4 h-4" />
                                                </div>
                                                <span>{v.type}</span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 font-latin font-bold text-heading">
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <LuWeight className="w-3.5 h-3.5 text-accent shrink-0" />
                                                <span>{v.capacityWeight ? `${v.capacityWeight} كجم` : 'غير حدد'}</span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 font-latin font-bold text-heading">
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <LuBox className="w-3.5 h-3.5 text-accent shrink-0" />
                                                <span>{v.capacityVolume ? `${v.capacityVolume} م³` : 'غير حدد'}</span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                v.isActive !== false
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                                                    : 'bg-rose-500/10 text-rose-600 border-rose-200'
                                            }`}>
                                                {v.isActive !== false ? 'نشطة' : 'موقوفة'}
                                            </span>
                                        </td>

                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setSelectedVehicleForDetails(v)}
                                                    title="عرض التفاصيل"
                                                    className="p-2 rounded-xl bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                >
                                                    <LuEye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => setSelectedVehicleForEdit(v)}
                                                    title="تعديل المركبة"
                                                    className="p-2 rounded-xl bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                >
                                                    <LuPencil className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => setSelectedVehicleForDelete(v)}
                                                    title="حذف المركبة"
                                                    className="p-2 rounded-xl bg-surface-muted hover:bg-rose-500/10 text-body hover:text-rose-600 border border-border transition-all cursor-pointer"
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
                    <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs">
                        <span className="text-body font-medium">
                            عرض الصفحة <b className="font-latin text-heading">{page}</b> من <b className="font-latin text-heading">{totalPages}</b> (إجمالي {totalRecords} مركبة)
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
            <AddVehicles
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <EditVehicles
                isOpen={!!selectedVehicleForEdit}
                vehicle={selectedVehicleForEdit}
                onClose={() => setSelectedVehicleForEdit(null)}
            />

            <DetailsVehicles
                isOpen={!!selectedVehicleForDetails}
                vehicle={selectedVehicleForDetails}
                onClose={() => setSelectedVehicleForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedVehicleForDelete}
                title="تأكيد حذف المركبة"
                description={`هل أنت تأكد من رغبتك في حذف المركبة (${selectedVehicleForDelete?.type})؟`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedVehicleForDelete(null)}
            />

        </div>
    );
}
