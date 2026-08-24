import React from 'react';
import {
    LuReceipt,
    LuX,
    LuBuilding2,
    LuDollarSign,
    LuCreditCard,
    LuPlus,
    LuCalendar,
    LuHash
} from 'react-icons/lu';

interface AddInvoicesProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const AddInvoices: React.FC<AddInvoicesProps> = ({ isOpen = false, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuReceipt className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">إصدار فاتورة جديدة</h2>
                            <p className="text-xs text-body mt-0.5">إنشاء فاتورة اشتراك أو رسوم لوجستية جديدة للشركات</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6">

                    <div className="space-y-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent" />
                            بيانات الفاتورة
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuHash className="w-3.5 h-3.5 text-body" />
                                    رقم الفاتورة
                                </label>
                                <input
                                    type="text"
                                    placeholder="مثال: INV-2026-090"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 font-latin focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuBuilding2 className="w-3.5 h-3.5 text-body" />
                                    شركة الشحن المستفيدة
                                </label>
                                <select className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer">
                                    <option value="">اختر الشركة...</option>
                                    <option value="riyadh">شركة الرياض السريع</option>
                                    <option value="darb">درب الشرق للنقل</option>
                                    <option value="tawseel">توصيل بلس اللوجستية</option>
                                    <option value="najm">نجم للنقل والتوزيع</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCreditCard className="w-3.5 h-3.5 text-body" />
                                    نوع الخطة / الخدمة
                                </label>
                                <input
                                    type="text"
                                    placeholder="مثال: المؤسسات (سنوي)"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuDollarSign className="w-3.5 h-3.5 text-body" />
                                    المبلغ المستحق (ر.س)
                                </label>
                                <input
                                    type="text"
                                    placeholder="١,٤٠٠ ر.س"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 font-latin focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCreditCard className="w-3.5 h-3.5 text-body" />
                                    طريقة الدفع
                                </label>
                                <select className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer">
                                    <option value="mada">مدى (أوتوماتيكي)</option>
                                    <option value="apple">Apple Pay</option>
                                    <option value="visa">فيزا / ماستركارد</option>
                                    <option value="stc">STC Pay</option>
                                    <option value="bank">تحويل بنكي</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuCalendar className="w-3.5 h-3.5 text-body" />
                                    حالة الفاتورة
                                </label>
                                <select className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer">
                                    <option value="paid">تم السداد (Paid)</option>
                                    <option value="pending">معلقة (Pending)</option>
                                    <option value="canceled">ملغاة (Canceled)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-5 border-t border-border bg-surface-muted/40 flex items-center justify-between gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-border bg-surface text-heading hover:bg-surface-muted font-bold text-sm transition-colors cursor-pointer"
                    >
                        إلغاء
                    </button>

                    <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer">
                        <LuPlus className="w-4 h-4" />
                        <span>إصدار الفاتورة</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddInvoices;
