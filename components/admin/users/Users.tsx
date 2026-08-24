'use client';

import React, { useState } from 'react';
import {
    LuUser,
    LuPlus,
    LuPencil,
    LuSearch,
    LuFilter,
    LuShieldCheck,
    LuUserCheck
} from 'react-icons/lu';
import AddUsers from './AddUsers';
import EditUsers from './EditUsers';

interface UserItem {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: 'active' | 'inactive';
}

const usersData: UserItem[] = [
    { id: 'USR-01', name: 'أحمد المنشاوي', email: 'admin@shahnetak.sa', phone: '0501234567', role: 'سوبر أدمن (Super Admin)', status: 'active' },
    { id: 'USR-02', name: 'سارة القحطاني', email: 'sara@shahnetak.sa', phone: '0559876543', role: 'مدير عمليات', status: 'active' },
    { id: 'USR-03', name: 'فهد العتيبي', email: 'fahad@shahnetak.sa', phone: '0541122334', role: 'دعم فني', status: 'active' },
];

export default function Users() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading">إدارة المستخدمين والمدراء</h1>
                    <p className="text-sm text-body mt-0.5">إدارة فريق عمل منصة شحنتك وتخصيص صلاحيات الوصول.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                >
                    <LuPlus className="w-4 h-4" />
                    <span>إضافة مستخدم جديد</span>
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-body" />
                    <input
                        type="text"
                        placeholder="بحث بالاسم، البريد، أو رقم الجوال..."
                        className="w-full pl-4 pr-10 py-2 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/60 focus:outline-none focus:border-accent"
                    />
                </div>
                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-heading hover:bg-surface-muted transition-colors cursor-pointer">
                        <LuFilter className="w-3.5 h-3.5 text-body" />
                        <span>فلترة بالصلاحية</span>
                    </button>
                    <span className="text-xs font-bold text-body bg-surface-muted px-3 py-2 rounded-xl border border-border">
                        إجمالي: {usersData.length} مستخدم
                    </span>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-surface-muted/50 border-b border-border text-xs text-body font-bold">
                            <tr>
                                <th className="py-3.5 px-5">المستخدم</th>
                                <th className="py-3.5 px-4">البريد الإلكتروني</th>
                                <th className="py-3.5 px-4">الجوال</th>
                                <th className="py-3.5 px-4">الصلاحية (Role)</th>
                                <th className="py-3.5 px-4">الحالة</th>
                                <th className="py-3.5 px-5 text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {usersData.map((user) => (
                                <tr key={user.id} className="hover:bg-surface-muted/40 transition-colors">
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent font-bold flex items-center justify-center shrink-0">
                                                {user.name.charAt(0)}
                                            </div>
                                            <b className="text-heading block">{user.name}</b>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 font-latin text-xs text-heading">
                                        {user.email}
                                    </td>
                                    <td className="py-4 px-4 font-latin text-xs text-heading">
                                        {user.phone}
                                    </td>
                                    <td className="py-4 px-4 text-xs font-bold text-heading">
                                        {user.role}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="inline-flex items-center gap-1.5 font-bold text-success text-[11px] bg-success-soft px-2.5 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                            نشط
                                        </span>
                                    </td>
                                    <td className="py-4 px-5 text-center">
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setIsEditModalOpen(true);
                                            }}
                                            title="تعديل المستخدم"
                                            className="p-1.5 rounded-lg bg-surface border border-border hover:bg-heading hover:text-white text-xs font-bold transition-colors cursor-pointer"
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

            {/* Modal Add Users */}
            <AddUsers
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            {/* Modal Edit Users */}
            <EditUsers
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                }}
                userData={selectedUser}
            />

        </div>
    );
}
