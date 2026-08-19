import React from 'react';
import { LuSave, LuShieldAlert, LuGlobe } from 'react-icons/lu';

export default function SettingsPage() {
    return (
        <div className="max-w-4xl space-y-6">

            <div>
                <h1 className="text-2xl font-extrabold text-heading">إعدادات المنصة الرئيسية</h1>
                <p className="text-sm text-body mt-0.5">التحكم في خيارات المستأجرين (Multi-Tenancy)، بوابات الدفع، وإشعارات النظام.</p>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-6 shadow-xs space-y-6">

                {/* General Settings */}
                <div>
                    <h2 className="text-base font-extrabold text-heading mb-4 flex items-center gap-2">
                        <LuGlobe className="w-5 h-5 text-accent" />
                        النطاقات والربط العام
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-heading mb-1.5">النطاق الأساسي (Root Domain)</label>
                            <input type="text" defaultValue="shahnetak.sa" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading" dir="ltr" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-heading mb-1.5">ضريبة القيمة المضافة (VAT)</label>
                            <input type="text" defaultValue="15%" className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading" />
                        </div>
                    </div>
                </div>

                <hr className="border-border" />

                {/* Security & Multi-tenancy */}
                <div>
                    <h2 className="text-base font-extrabold text-heading mb-4 flex items-center gap-2">
                        <LuShieldAlert className="w-5 h-5 text-warning" />
                        أمان البيانات والعزل (PDPL)
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
                    <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-xs shadow-sm hover:shadow transition-all">
                        {/* <LuSave className="w-4 h-4" /> */}
                        <span>حفظ التغييرات</span>
                    </button>
                </div>

            </div>

        </div>
    );
}