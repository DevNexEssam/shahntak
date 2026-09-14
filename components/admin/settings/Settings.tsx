'use client';

import React, { useState } from 'react';
import {
    LuSave,
    LuShieldAlert,
    LuGlobe,
    LuPlus,
    LuPencil,
    LuKey
} from 'react-icons/lu';
import AddSettings from './AddSettings';
import EditSettings from './EditSettings';

interface SettingItem {
    key: string;
    category: string;
    value: string;
    description: string;
}

const platformSettings: SettingItem[] = [
    { key: 'ROOT_DOMAIN', category: 'general', value: 'shahnetak.sa', description: 'النطاق الأساسي المعتمد للنظام' },
    { key: 'VAT_RATE', category: 'billing', value: '15%', description: 'نسبة ضريبة القيمة المضافة بالمملكة' },
    { key: 'PDPL_ENCRYPTION', category: 'security', value: 'Enabled', description: 'تشفير قواعد بيانات المستأجرين وفق نظام PDPL' },
];

export default function Settings() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSetting, setSelectedSetting] = useState<SettingItem | null>(null);

    return (
        <div className="max-w-4xl space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading">إعدادات المنصة الرئيسية</h1>
                    <p className="text-sm text-body mt-0.5">التحكم في خيارات المستأجرين (Multi-Tenancy)، بوابات الدفع، وإشعارات النظام.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                >
                    <LuPlus className="w-4 h-4" />
                    <span>إضافة إعداد جديد</span>
                </button>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-6">

                {/* General Settings */}
                <div>
                    <h2 className="text-base font-extrabold text-heading mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <LuGlobe className="w-5 h-5 text-accent" />
                            النطاقات والربط العام
                        </span>
                        <button
                            onClick={() => {
                                setSelectedSetting(platformSettings[0]);
                                setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-surface border border-border hover:bg-heading hover:text-white text-xs font-bold transition-colors cursor-pointer"
                            title="تعديل النطاق"
                        >
                            <LuPencil className="w-3.5 h-3.5" />
                        </button>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-heading mb-1.5">النطاق الأساسي (Root Domain)</label>
                            <input type="text" defaultValue="shahnetak.sa" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading font-latin" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-heading mb-1.5">ضريبة القيمة المضافة (VAT)</label>
                            <input type="text" defaultValue="15%" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading font-latin" />
                        </div>
                    </div>
                </div>

                <hr className="border-border" />

                {/* Security & Multi-tenancy */}
                <div>
                    <h2 className="text-base font-extrabold text-heading mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <LuShieldAlert className="w-5 h-5 text-warning" />
                            أمان البيانات والعزل (PDPL)
                        </span>
                        <button
                            onClick={() => {
                                setSelectedSetting(platformSettings[2]);
                                setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-surface border border-border hover:bg-heading hover:text-white text-xs font-bold transition-colors cursor-pointer"
                            title="تعديل خيارات الأمان"
                        >
                            <LuPencil className="w-3.5 h-3.5" />
                        </button>
                    </h2>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4 text-accent rounded border-border" />
                            <span className="text-sm font-semibold text-heading">تفعيل التشفير الإجباري لقواعد بيانات المستأجرين المنفصلة</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked className="w-4 h-4 text-accent rounded border-border" />
                            <span className="text-sm font-semibold text-heading">النسخ الاحتياطي التلقائي اليومي في مراكز بيانات داخل المملكة</span>
                        </label>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer">
                        <LuSave className="w-4 h-4" />
                        <span>حفظ التغييرات</span>
                    </button>
                </div>

            </div>

            {/* Modal Add Settings */}
            <AddSettings
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            {/* Modal Edit Settings */}
            <EditSettings
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedSetting(null);
                }}
                settingData={selectedSetting}
            />

        </div>
    );
}
