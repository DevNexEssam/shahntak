/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useCompanyVehicles, useDeleteCompanyVehicle } from '@/hooks/company/useCompanyVehicle';
import AddCompanyVehiclePopup from './AddCompanyVehiclePopup';
import EditCompanyVehiclePopup from './EditCompanyVehiclePopup';
import DetailsCompanyVehiclePopup from './DetailsCompanyVehiclePopup';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import ErrorMessege from '@/components/ui/ErrorMessege';
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
    LuCheck,
    LuClock,
    LuWeight,
    LuBox
} from 'react-icons/lu';

export default function CompanyVehicles() {
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedVehicleForEdit, setSelectedVehicleForEdit] = useState<any | null>(null);
    const [selectedVehicleForDetails, setSelectedVehicleForDetails] = useState<any | null>(null);
    const [selectedVehicleForDelete, setSelectedVehicleForDelete] = useState<any | null>(null);

    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useCompanyVehicles(page, limit, searchQuery);
    const { mutate: deleteVehicle, isPending: isDeleting } = useDeleteCompanyVehicle();

    if (isLoading) return <Loading />;

    const vehiclesList = responseData?.data || [];
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
        active: serverStats?.active ?? 0,
        inactive: serverStats?.inactive ?? 0,
    };

    const handleDeleteConfirm = () => {
        if (!selectedVehicleForDelete) return;
        deleteVehicle(
            { id: selectedVehicleForDelete._id },
            {
                onSuccess: () => {
                    setSelectedVehicleForDelete(null);
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
                        <span className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
                            <LuTruck className="w-5 h-5" />
                        </span>
                        أسطول المركبات والشاحنات
                    </h1>
                    <p className="text-xs text-body mt-1">مراقبة وإدارة المركبات المسجلة بأسطول شركتك وتحديد السعات الحجمية والوزنية</p>
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
                        <span>إضافة مركبة للأسطول</span>
                    </button>
                </div>
            </div>

            {/* Error Notification */}
            {isError && (
                <div className="mb-4">
                    <ErrorMessege message={(error as any)?.message || 'تعذر جلب بيانات الأسطول من الخادم'} />
                </div>
            )}

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">إجمالي الأسطول</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.total}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>مركبة مسجلة بشركتك</span>
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
                            <span className="text-xs font-semibold text-body block mb-1">مركبات نشطة</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.active}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>جاهزة للشحن والتشغيل</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">مركبات متوقفة</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.inactive}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>في الصيانة أو متوقفة</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuClock className="w-5 h-5" />
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
                        placeholder="بحث بنوع الشاحنة والمركبة..."
                        className="w-full pl-4 pr-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {vehiclesList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="لا توجد مركبات مسجلة في أسطول الشركة تطابق خيارات البحث الحالية" icon={LuTruck} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4">نوع الشاحنة / المركبة</th>
                                    <th className="py-3.5 px-4">الحمولة الوزنية القصوى</th>
                                    <th className="py-3.5 px-4">السعة الحجمية القصوى</th>
                                    <th className="py-3.5 px-4">حالة التشغيل</th>
                                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {vehiclesList.map((vh: any) => {
                                    const isActive = vh.isActive !== false;

                                    return (
                                        <tr key={vh._id} className="hover:bg-surface-muted/40 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold text-xs shrink-0">
                                                        <LuTruck className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-bold text-heading">{vh.type}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 font-latin text-xs text-heading font-bold">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <LuWeight className="w-3.5 h-3.5 text-accent" />
                                                    {vh.capacityWeight ? `${vh.capacityWeight} كجم` : 'غير محدد'}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 font-latin text-xs text-heading font-bold">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <LuBox className="w-3.5 h-3.5 text-accent" />
                                                    {vh.capacityVolume ? `${vh.capacityVolume} م³` : 'غير محدد'}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                        <LuCheck className="w-3 h-3" />
                                                        نشطة ومفعلة
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                                        <LuClock className="w-3 h-3" />
                                                        متوقفة / صيانة
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedVehicleForDetails(vh)}
                                                        title="عرض التفاصيل"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedVehicleForEdit(vh)}
                                                        title="تعديل البيانات"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedVehicleForDelete(vh)}
                                                        title="حذف المركبة"
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
                            عرض الصفحة <b className="font-latin text-heading">{page}</b> من <b className="font-latin text-heading">{totalPages}</b> (إجمالي {totalRecords} مركبة)
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
            <AddCompanyVehiclePopup
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <EditCompanyVehiclePopup
                isOpen={!!selectedVehicleForEdit}
                vehicleData={selectedVehicleForEdit}
                onClose={() => setSelectedVehicleForEdit(null)}
            />

            <DetailsCompanyVehiclePopup
                isOpen={!!selectedVehicleForDetails}
                vehicleData={selectedVehicleForDetails}
                onClose={() => setSelectedVehicleForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedVehicleForDelete}
                title="تأكيد حذف مركبة"
                description={`هل أنت تأكد من رغبتك في حذف المركبة (${selectedVehicleForDelete?.type}) من الأسطول؟ لا يمكن التراجع عن هذا الإجراء لاحقاً.`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedVehicleForDelete(null)}
            />

        </div>
    );
}
