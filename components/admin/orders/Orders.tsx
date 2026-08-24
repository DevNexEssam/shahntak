'use client';

import React, { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import {
    LuPackage,
    LuSearch,
    LuFilter,
    LuTruck,
    LuLoaderCircle,
    LuPlus,
    LuPencil,
    LuFileSpreadsheet
} from 'react-icons/lu';
import AddOrders from './AddOrders';
import EditOrders from './EditOrders';

interface OrderItem {
    code: string;
    company: string;
    customer: string;
    dest: string;
    carrier: string;
    driver: string;
    amount: string;
    status: 'delivering' | 'delivered' | 'pending' | 'canceled';
    time: string;
}

const globalOrders: OrderItem[] = [
    {
        code: 'SH-4421',
        company: 'الرياض السريع',
        customer: 'عبدالرحمن الشهري',
        dest: 'الرياض ← الدمام',
        carrier: 'أسطول الشركة',
        driver: 'سعد القحطاني',
        amount: '١٢٠ ر.س',
        status: 'delivering',
        time: 'منذ ١٢ دقيقة',
    },
    {
        code: 'SH-4420',
        company: 'درب الشرق',
        customer: 'سارة العتيبي',
        dest: 'جدة ← مكة',
        carrier: 'ناقل إكسبريس',
        driver: 'محمد إبراهيم',
        amount: '٦٥ ر.س',
        status: 'delivered',
        time: 'منذ ٢٤ دقيقة',
    },
    {
        code: 'SH-4419',
        company: 'مسار إكسبريس',
        customer: 'متجر ألوان',
        dest: 'الخبر ← الهفوف',
        carrier: 'أسطول الشركة',
        driver: 'أحمد الزهراني',
        amount: '٢٤٠ ر.س',
        status: 'pending',
        time: 'منذ ساعة',
    },
    {
        code: 'SH-4418',
        company: 'الرياض السريع',
        customer: 'خالد المطيري',
        dest: 'الرياض ← القصيم',
        carrier: 'سمسا',
        driver: '—',
        amount: '٩٥ ر.س',
        status: 'canceled',
        time: 'منذ ساعتين',
    },
];

export default function Orders() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading">سجل الشحنات والعمليات الموحد</h1>
                    <p className="text-sm text-body mt-0.5">مراقبة حية لجميع الشحنات الصادرة من كافة شركات الشحن على المنصة.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-heading text-xs font-bold hover:bg-surface-muted transition-colors cursor-pointer">
                        <LuFileSpreadsheet className="w-4 h-4 text-body" />
                        <span>تصدير تقرير CSV</span>
                    </button>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>إضافة شحنة جديدة</span>
                    </button>
                </div>
            </div>

            {/* Status Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface p-4 rounded-xl border border-border flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                        <LuPackage className="w-5 h-5" />
                    </span>
                    <div>
                        <b className="font-latin text-lg font-extrabold text-heading block">١٬٢٤٠</b>
                        <span className="text-xs text-body">قيد المعالجة</span>
                    </div>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg bg-warning-soft text-warning flex items-center justify-center">
                        <LuTruck className="w-5 h-5" />
                    </span>
                    <div>
                        <b className="font-latin text-lg font-extrabold text-heading block">٨٤٢</b>
                        <span className="text-xs text-body">في طريق التسليم</span>
                    </div>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg bg-success-soft text-success flex items-center justify-center">
                        <FaCheckCircle className="w-5 h-5" />
                    </span>
                    <div>
                        <b className="font-latin text-lg font-extrabold text-heading block">١٢٬٦٥٠</b>
                        <span className="text-xs text-body">تم التسليم بنجاح</span>
                    </div>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                        <LuLoaderCircle className="w-5 h-5" />
                    </span>
                    <div>
                        <b className="font-latin text-lg font-extrabold text-heading block">١٥٨</b>
                        <span className="text-xs text-body">مرتجع أو ملغي</span>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        placeholder="بحث برقم الشحنة، العميل، أو شركة الشحن..."
                        className="w-full pl-4 pr-10 py-2 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>
                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-heading hover:bg-surface-muted transition-colors cursor-pointer">
                        <LuFilter className="w-3.5 h-3.5 text-body" />
                        <span>فلترة بالشركة</span>
                    </button>
                    <span className="text-xs font-bold text-body bg-surface-muted px-3 py-2 rounded-xl border border-border">
                        إجمالي: {globalOrders.length} شحنة
                    </span>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-surface-muted/50 border-b border-border text-xs text-body font-bold">
                            <tr>
                                <th className="py-3.5 px-5">رقم الشحنة</th>
                                <th className="py-3.5 px-4">شركة الشحن</th>
                                <th className="py-3.5 px-4">المرسل / المستلم</th>
                                <th className="py-3.5 px-4">المسار</th>
                                <th className="py-3.5 px-4">الناقل والسائق</th>
                                <th className="py-3.5 px-4">القيمة</th>
                                <th className="py-3.5 px-4">الحالة</th>
                                <th className="py-3.5 px-5 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {globalOrders.map((ord) => (
                                <tr key={ord.code} className="hover:bg-surface-muted/40 transition-colors">
                                    <td className="py-4 px-5">
                                        <span className="font-latin font-bold text-accent block">{ord.code}</span>
                                        <span className="text-[11px] text-body">{ord.time}</span>
                                    </td>
                                    <td className="py-4 px-4 font-bold text-heading text-xs">
                                        {ord.company}
                                    </td>
                                    <td className="py-4 px-4 text-xs font-semibold text-heading">
                                        {ord.customer}
                                    </td>
                                    <td className="py-4 px-4 text-xs text-body font-medium">
                                        {ord.dest}
                                    </td>
                                    <td className="py-4 px-4 text-xs">
                                        <span className="font-bold text-heading block">{ord.carrier}</span>
                                        <span className="text-body text-[11px]">{ord.driver}</span>
                                    </td>
                                    <td className="py-4 px-4 font-latin font-bold text-heading">
                                        {ord.amount}
                                    </td>
                                    <td className="py-4 px-4">
                                        {ord.status === 'delivering' && (
                                            <span className="inline-block px-2.5 py-1 rounded-full bg-warning-soft text-warning font-bold text-[11px]">
                                                في الطريق
                                            </span>
                                        )}
                                        {ord.status === 'delivered' && (
                                            <span className="inline-block px-2.5 py-1 rounded-full bg-success-soft text-success font-bold text-[11px]">
                                                تم التسليم
                                            </span>
                                        )}
                                        {ord.status === 'pending' && (
                                            <span className="inline-block px-2.5 py-1 rounded-full bg-accent-soft text-accent font-bold text-[11px]">
                                                جديد
                                            </span>
                                        )}
                                        {ord.status === 'canceled' && (
                                            <span className="inline-block px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 font-bold text-[11px]">
                                                ملغي
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-5 text-center">
                                        <button
                                            onClick={() => {
                                                setSelectedOrder(ord);
                                                setIsEditModalOpen(true);
                                            }}
                                            title="تعديل الشحنة"
                                            className="p-2 rounded-lg bg-surface border border-border hover:bg-heading hover:text-white text-xs font-bold transition-colors cursor-pointer"
                                        >
                                            <LuPencil className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Add Orders */}
            <AddOrders
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            {/* Modal Edit Orders */}
            <EditOrders
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedOrder(null);
                }}
                orderData={selectedOrder}
            />

        </div>
    );
}
