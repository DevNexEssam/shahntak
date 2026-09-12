"use client";

import React, { useState } from 'react';
import { useSubscriptions, useDeleteSubscription } from '@/hooks/subscriptions/useSubscriptions';
import { Subscription, Company, Plan } from '@/types/data';
import AddSubscriptions from './AddSubscriptions';
import EditSubscriptions from './EditSubscriptions';
import DetailsSubscriptions from './DetailsSubscriptions';
import Loading from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/ErrorMessege';
import EmptyData from '@/components/ui/EmptyData';
import ConfirmDeletePopup from '@/components/ui/ConfirmDeletePopup';
import {
    LuCrown,
    LuPlus,
    LuSearch,
    LuEye,
    LuPencil,
    LuTrash2,
    LuCheck,
    LuBuilding2,
    LuCreditCard,
    LuChevronRight,
    LuChevronLeft
} from 'react-icons/lu';

export default function Subscriptions() {
    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');

    // Modals state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedSubForEdit, setSelectedSubForEdit] = useState<Subscription | null>(null);
    const [selectedSubForDetails, setSelectedSubForDetails] = useState<Subscription | null>(null);
    const [selectedSubForDelete, setSelectedSubForDelete] = useState<Subscription | null>(null);

    const { data: subsRes, isLoading, isError, refetch } = useSubscriptions(page, limit, search, status);
    const { mutate: deleteSubscription, isPending: isDeleting } = useDeleteSubscription();

    const subsList = subsRes?.data || [];
    const stats = subsRes?.stats;
    const totalPages = Math.ceil((subsRes?.total || 0) / limit);

    const handleDeleteConfirm = () => {
        if (!selectedSubForDelete) return;
        deleteSubscription(
            { id: selectedSubForDelete._id, hard: false },
            {
                onSuccess: () => {
                    setSelectedSubForDelete(null);
                    refetch();
                },
            }
        );
    };

    const statusBadge = (st: string) => {
        switch (st) {
            case 'active':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">نشط وساري</span>;
            case 'pending_payment':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">بانتظار الدفع</span>;
            case 'expired':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">منتهي الصلاحية</span>;
            case 'cancelled':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 border border-slate-500/20">ملغى</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600">{st}</span>;
        }
    };

    return (
        <div className="space-y-6 text-right font-arabic" dir="rtl">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading">اشتراكات الشركات وحصص الاستهلاك</h1>
                    <p className="text-sm text-body mt-1">متابعة الاشتراكات السحابية النشطة للشركات، معدلات الاستهلاك، والترقية والتجديد.</p>
                </div>

                <button
                    onClick={() => setIsAddOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer hover:bg-accent/90"
                >
                    <LuPlus className="w-5 h-5" />
                    <span>تفعيل اشتراك لشركة</span>
                </button>
            </div>

            {/* KPI / Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">إجمالي الاشتراكات</span>
                            <h3 className="text-2xl font-bold text-heading my-1 font-latin">{stats?.total ?? 0}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>الاشتراكات الموثقة بالمنصة</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                            <LuCrown className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">الاشتراكات النشطة</span>
                            <h3 className="text-2xl font-bold text-emerald-600 my-1 font-latin">{stats?.active ?? 0}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>سارية ومتاحة للاستخدام</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <LuCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">بانتظار التحصيل</span>
                            <h3 className="text-2xl font-bold text-amber-600 my-1 font-latin">{stats?.pending_payment ?? 0}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>بانتظار تأكيد الدفع</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                            <LuCreditCard className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-5 bg-surface">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-body block mb-1">الاشتراكات المنتهية</span>
                            <h3 className="text-2xl font-bold text-rose-600 my-1 font-latin">{stats?.expired ?? 0}</h3>
                            <p className="text-xs text-body flex items-center gap-1 mt-2">
                                <span>تتطلب التجديد الفوري</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                            <LuCrown className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-surface p-4 rounded-md border border-border flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث باسم الشركة..."
                        className="w-full pr-10 pl-4 py-2 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setStatus('all')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${status === 'all'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface-muted text-body border border-border hover:text-heading'
                            }`}
                    >
                        الكل
                    </button>
                    <button
                        onClick={() => setStatus('active')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${status === 'active'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface-muted text-body border border-border hover:text-heading'
                            }`}
                    >
                        النشطة
                    </button>
                    <button
                        onClick={() => setStatus('pending_payment')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${status === 'pending_payment'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface-muted text-body border border-border hover:text-heading'
                            }`}
                    >
                        بانتظار الدفع
                    </button>
                    <button
                        onClick={() => setStatus('expired')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${status === 'expired'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface-muted text-body border border-border hover:text-heading'
                            }`}
                    >
                        المنتهية
                    </button>
                </div>
            </div>

            {/* Subscriptions Data Table */}
            <div className="bg-surface rounded-md border border-border overflow-hidden">
                {isLoading ? (
                    <Loading />
                ) : isError ? (
                    <ErrorMessage message="حدث خطأ أثناء تحميل بيانات الاشتراكات" />
                ) : subsList.length === 0 ? (
                    <EmptyData message="لم يتم تفعيل أي اشتراكات سحابية للشركات تشمل هذه الفلاتر حتى الآن." icon={LuCrown} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm border-collapse">
                            <thead>
                                <tr className="bg-surface-muted/60 border-b border-border text-xs text-body font-bold">
                                    <th className="py-3.5 px-4">الشركة المشتركة</th>
                                    <th className="py-3.5 px-4">الباقة السحابية</th>
                                    <th className="py-3.5 px-4">تاريخ الانتهاء</th>
                                    <th className="py-3.5 px-4">استهلاك الطلبات</th>
                                    <th className="py-3.5 px-4">الحالة</th>
                                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {subsList.map((sub) => {
                                    const company = typeof sub.companyId === 'object' && sub.companyId !== null ? (sub.companyId as Company) : null;
                                    const plan = typeof sub.planId === 'object' && sub.planId !== null ? (sub.planId as Plan) : null;
                                    const maxOrders = plan?.maxOrdersPerMonth ?? -1;

                                    return (
                                        <tr key={sub._id} className="hover:bg-surface-muted/50 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-heading">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-md bg-accent/10 text-accent flex items-center justify-center font-bold">
                                                        <LuBuilding2 className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="block font-extrabold">{company?.companyName || 'شركة مشتركة'}</span>
                                                        <span className="text-[11px] text-body font-normal">{company?.email}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className="font-extrabold text-accent bg-accent/10 px-2.5 py-1 rounded-md text-xs border border-accent/20">
                                                    {plan?.name || 'غير محددة'}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 font-latin font-bold text-heading text-xs">
                                                {sub.endDate ? new Date(sub.endDate).toLocaleDateString('ar-SA') : '-'}
                                            </td>

                                            <td className="py-3.5 px-4 font-latin font-bold text-heading text-xs">
                                                <span className="text-accent">{sub.ordersUsedThisMonth || 0}</span> / {maxOrders === -1 ? '∞' : maxOrders} طلب
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {statusBadge(sub.status)}
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedSubForDetails(sub)}
                                                        title="عرض التفاصيل"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-accent-soft text-body hover:text-accent border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedSubForEdit(sub)}
                                                        title="تعديل أو تجديد الاشتراك"
                                                        className="p-2 rounded-md bg-surface-muted hover:bg-amber-500/10 text-body hover:text-amber-600 border border-border transition-all cursor-pointer"
                                                    >
                                                        <LuPencil className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedSubForDelete(sub)}
                                                        title="حذف الاشتراك"
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
                    <div className="p-4 border-t border-border bg-surface-muted/30 flex items-center justify-between text-xs">
                        <span className="text-body">عرض الصفحة <strong className="text-heading font-latin">{page}</strong> من <strong className="text-heading font-latin">{totalPages}</strong></span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="p-2 rounded-md border border-border bg-surface hover:bg-surface-muted text-body disabled:opacity-40 cursor-pointer"
                            >
                                <LuChevronRight className="w-4 h-4" />
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="p-2 rounded-md border border-border bg-surface hover:bg-surface-muted text-body disabled:opacity-40 cursor-pointer"
                            >
                                <LuChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals Mounting */}
            <AddSubscriptions
                isOpen={isAddOpen}
                onClose={() => {
                    setIsAddOpen(false);
                    refetch();
                }}
            />

            <EditSubscriptions
                isOpen={!!selectedSubForEdit}
                subscription={selectedSubForEdit}
                onClose={() => {
                    setSelectedSubForEdit(null);
                    refetch();
                }}
            />

            <DetailsSubscriptions
                isOpen={!!selectedSubForDetails}
                subscription={selectedSubForDetails}
                onClose={() => setSelectedSubForDetails(null)}
            />

            <ConfirmDeletePopup
                isOpen={!!selectedSubForDelete}
                title="تأكيد حذف اشتراك الشركة"
                description="هل أنت متأكد من رغبتك في حذف وإلغاء هذا الاشتراك السحابي؟"
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setSelectedSubForDelete(null)}
            />

        </div>
    );
}
