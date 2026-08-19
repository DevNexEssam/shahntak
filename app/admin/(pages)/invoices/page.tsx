import React from 'react';
import { FaDownLong } from 'react-icons/fa6';
import {
    LuFileText,
} from 'react-icons/lu';

const subscriptionInvoices = [
    {
        invId: 'INV-2026-089',
        company: 'شركة الرياض السريع',
        plan: 'المؤسسات (سنوي)',
        amount: '١٤٬٤٠٠ ر.س',
        date: '٠١ أغسطس ٢٠٢٦',
        paymentMethod: 'مدى (أوتوماتيكي)',
        status: 'paid',
    },
    {
        invId: 'INV-2026-088',
        company: 'درب الشرق للنقل',
        plan: 'النمو (شهري)',
        amount: '٧٩٩ ر.س',
        date: '٠١ أغسطس ٢٠٢٦',
        paymentMethod: 'Apple Pay',
        status: 'paid',
    },
    {
        invId: 'INV-2026-087',
        company: 'توصيل بلس اللوجستية',
        plan: 'البداية (شهري)',
        amount: '٢٩٩ ر.س',
        date: '٠١ أغسطس ٢٠٢٦',
        paymentMethod: 'فيزا',
        status: 'pending',
    },
    {
        invId: 'INV-2026-086',
        company: 'نجم للنقل والتوزيع',
        plan: 'النمو (شهري)',
        amount: '٧٩٩ ر.س',
        date: '٠١ أغسطس ٢٠٢٦',
        paymentMethod: 'STC Pay',
        status: 'paid',
    },
];

export default function InvoicesPage() {
    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading">البوالص والفواتير المالية</h1>
                    <p className="text-sm text-body mt-0.5">متابعة فواتير اشتراكات منصة شحنتك، ورسوم استهلاك الـ API، والفوترة الإلكترونية (ZATCA).</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:shadow-md hover:shadow-accent/20 transition-all">
                    <FaDownLong className="w-4 h-4" />
                    <span>تصدير إقرار ضريبة القيمة المضافة</span>
                </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-surface p-6 rounded-2xl border border-border">
                    <span className="text-xs font-bold text-body block mb-1">المحصل هذا الشهر</span>
                    <b className="font-latin text-3xl font-extrabold text-heading">١٤٨٬٢٠٠ <span className="text-xs font-normal">ر.س</span></b>
                </div>
                <div className="bg-surface p-6 rounded-2xl border border-border">
                    <span className="text-xs font-bold text-body block mb-1">فواتير معلقة بانتظار التحصيل</span>
                    <b className="font-latin text-3xl font-extrabold text-warning">٣٬٥٩٠ <span className="text-xs font-normal">ر.س</span></b>
                </div>
                <div className="bg-surface p-6 rounded-2xl border border-border">
                    <span className="text-xs font-bold text-body block mb-1">إجمالي البوالص المصدرة (شهرياً)</span>
                    <b className="font-latin text-3xl font-extrabold text-accent">٣٨٥٬٤٢٠ <span className="text-xs font-normal">بوليصة</span></b>
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
                <div className="p-5 border-b border-border">
                    <h2 className="text-base font-extrabold text-heading">سجل فواتير الاشتراكات SaaS</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-surface-muted/50 border-b border-border text-xs text-body font-bold">
                            <tr>
                                <th className="py-3.5 px-5">رقم الفاتورة</th>
                                <th className="py-3.5 px-4">شركة الشحن</th>
                                <th className="py-3.5 px-4">نوع الخطة</th>
                                <th className="py-3.5 px-4">المبلغ</th>
                                <th className="py-3.5 px-4">طريقة الدفع</th>
                                <th className="py-3.5 px-4">تاريخ الإصدار</th>
                                <th className="py-3.5 px-4">الحالة</th>
                                <th className="py-3.5 px-5 text-center">تحميل</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {subscriptionInvoices.map((inv) => (
                                <tr key={inv.invId} className="hover:bg-surface-muted/40 transition-colors">
                                    <td className="py-4 px-5 font-latin font-bold text-heading">
                                        {inv.invId}
                                    </td>
                                    <td className="py-4 px-4 font-bold text-heading text-xs">
                                        {inv.company}
                                    </td>
                                    <td className="py-4 px-4 text-xs text-body font-semibold">
                                        {inv.plan}
                                    </td>
                                    <td className="py-4 px-4 font-latin font-extrabold text-heading">
                                        {inv.amount}
                                    </td>
                                    <td className="py-4 px-4 text-xs font-medium text-heading">
                                        {inv.paymentMethod}
                                    </td>
                                    <td className="py-4 px-4 text-xs text-body">
                                        {inv.date}
                                    </td>
                                    <td className="py-4 px-4">
                                        {inv.status === 'paid' ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-success-soft text-success">
                                                تم السداد
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-warning-soft text-warning">
                                                معلقة
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-5 text-center">
                                        <button title="تحميل فاتورة PDF" className="p-1.5 rounded-lg hover:bg-surface-muted text-body hover:text-heading transition-colors">
                                            <LuFileText className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}