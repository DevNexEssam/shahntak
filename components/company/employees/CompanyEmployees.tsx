/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useCompanyEmployees, useDeleteCompanyEmployee } from '@/hooks/company/useCompanyEmployee';
import AddCompanyEmployeePopup from './AddCompanyEmployeePopup';
import EditCompanyEmployeePopup from './EditCompanyEmployeePopup';
import DetailsCompanyEmployeePopup from './DetailsCompanyEmployeePopup';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import ErrorMessege from '@/components/ui/ErrorMessege';
import EmptyData from '@/components/ui/EmptyData';
import Loading from '@/components/ui/loading';
import {
    LuUsers,
    LuPlus,
    LuSearch,
    LuRefreshCw,
    LuPencil,
    LuEye,
    LuTrash2,
    LuChevronRight,
    LuChevronLeft,
    LuCheck,
    LuLock,
    LuShieldCheck,
    LuMail,
    LuPhone
} from 'react-icons/lu';

export default function CompanyEmployees() {
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchQuery, setSearchQuery] = useState('');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<any | null>(null);
    const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] = useState<any | null>(null);
    const [selectedEmployeeForDelete, setSelectedEmployeeForDelete] = useState<any | null>(null);

    const { data: responseData, isLoading, isError, error, isFetching, refetch } = useCompanyEmployees(page, limit, searchQuery);
    const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteCompanyEmployee();

    if (isLoading) return <Loading />;

    const employeesList = responseData?.data || [];
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
        if (!selectedEmployeeForDelete) return;
        deleteEmployee(
            { id: selectedEmployeeForDelete._id },
            {
                onSuccess: () => {
                    setSelectedEmployeeForDelete(null);
                },
            }
        );
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'owner':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                        مالك الشركة
                    </span>
                );
            case 'manager':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-accent-soft text-accent border border-accent/20">
                        مدير تشغيل
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-500/10 text-slate-600 border border-slate-500/20">
                        موظف
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 text-right font-arabic" dir="rtl">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
                            <LuUsers className="w-5 h-5" />
                        </span>
                        فريق العمل والموظفين
                    </h1>
                    <p className="text-xs text-body mt-1">مراقبة حية وتأطير حسابات موظفي الشركة والأدوار والصلاحيات</p>
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
                        <span>إضافة موظف جديد</span>
                    </button>
                </div>
            </div>

            {/* Error Notification */}
            {isError && (
                <div className="mb-4">
                    <ErrorMessege message={(error as any)?.message || 'تعذر جلب قائمة الموظفين من الخادم'} />
                </div>
            )}

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">إجمالي فريق العمل</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.total}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>موظف مسجل بشركتك</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuUsers className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">حسابات نشطة</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.active}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>صلاحية دخول سارية</span>
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
                            <span className="text-xs font-semibold text-body block mb-1">حسابات مجمدة</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats.inactive}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>تم إيقاف صلاحيتها</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <LuLock className="w-5 h-5" />
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
                        placeholder="بحث باسم الموظف، البريد، أو الجوال..."
                        className="w-full pl-4 pr-10 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>
            </div>

            {/* Data Table View */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {employeesList.length === 0 ? (
                    <div className="p-12 text-center">
                        <EmptyData message="لا يوجد موظفون مسجلون بالشركة يطابقون خيارات البحث الحالية" icon={LuUsers} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs font-bold text-body">
                                    <th className="py-3.5 px-4">اسم الموظف</th>
                                    <th className="py-3.5 px-4">البريد الإلكتروني</th>
                                    <th className="py-3.5 px-4">رقم الهاتف</th>
                                    <th className="py-3.5 px-4">الدور الوظيفي</th>
                                    <th className="py-3.5 px-4">حالة الحساب</th>
                                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium">
                                {employeesList.map((emp: any) => {
                                    const isActive = emp.userIsActive !== false && emp.status !== 'inactive';

                                    return (
                                        <tr key={emp._id} className="hover:bg-surface-muted/40 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold text-xs shrink-0">
                                                        {emp.userName?.charAt(0) || 'م'}
                                                    </div>
                                                    <span className="font-bold text-heading">{emp.userName}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 font-latin text-xs text-heading">
                                                {emp.userEmail}
                                            </td>

                                            <td className="py-3.5 px-4 font-latin text-xs text-heading dir-ltr text-right">
                                                {emp.phone}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {getRoleBadge(emp.userRole)}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                        <LuCheck className="w-3 h-3" />
                                                        نشط ومفعل
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                                        <LuLock className="w-3 h-3" />
                                                        مجمد
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedEmployeeForDetails(emp)}
                                                        title="عرض الملف"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedEmployeeForEdit(emp)}
                                                        title="تعديل البيانات"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedEmployeeForDelete(emp)}
                                                        title="حذف الحساب"
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
                            عرض الصفحة <b className="font-latin text-heading">{page}</b> من <b className="font-latin text-heading">{totalPages}</b> (إجمالي {totalRecords} موظف)
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
            <AddCompanyEmployeePopup
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />

            <EditCompanyEmployeePopup
                isOpen={!!selectedEmployeeForEdit}
                employeeData={selectedEmployeeForEdit}
                onClose={() => setSelectedEmployeeForEdit(null)}
            />

            <DetailsCompanyEmployeePopup
                isOpen={!!selectedEmployeeForDetails}
                employeeData={selectedEmployeeForDetails}
                onClose={() => setSelectedEmployeeForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedEmployeeForDelete}
                title="تأكيد حذف موظف"
                description={`هل أنت تأكد من رغبتك في حذف حساب الموظف (${selectedEmployeeForDelete?.userName})؟ لا يمكن التراجع عن هذا الإجراء لاحقاً.`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedEmployeeForDelete(null)}
            />

        </div>
    );
}
