import React from 'react';
import {
    LuPackage,
    LuX,
    LuUser,
    LuPhone,
    LuMapPin,
    LuTruck,
    LuDollarSign,
    LuSave,
    LuBuilding2,
    LuPencil,
    LuTag,
    LuClock
} from 'react-icons/lu';

interface EditOrdersProps {
    isOpen?: boolean;
    onClose?: () => void;
    orderData?: {
        code?: string;
        company?: string;
        customer?: string;
        dest?: string;
        carrier?: string;
        driver?: string;
        amount?: string;
        status?: string;
        time?: string;
    } | null;
}

const EditOrders: React.FC<EditOrdersProps> = ({ isOpen = false, onClose, orderData }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuPencil className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تعديل بيانات الشحنة ({orderData?.code || 'SH-4421'})</h2>
                            <p className="text-xs text-body mt-0.5">تحديث معلومات المستلم، الناقل، القيمة، وحالة الحركة اللوجستية</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body - Visual UI Layout */}
                <div className="p-6 overflow-y-auto space-y-6">

                    {/* Section 1: Order & Customer Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent" />
                            بيانات الطلب والعميل
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Tracking Code UI field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuTag className="w-3.5 h-3.5 text-body" />
                                    رقم الشحنة التتبعي
                                </label>
                                <input
                                    type="text"
                                    defaultValue={orderData?.code || 'SH-4421'}
                                    placeholder="رقم الشحنة"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>

                            {/* Shipping Company UI field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuBuilding2 className="w-3.5 h-3.5 text-body" />
                                    شركة الشحن التابعة
                                </label>
                                <input
                                    type="text"
                                    defaultValue={orderData?.company || 'شركة الرياض السريع'}
                                    placeholder="شركة الشحن"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Customer Name UI field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuUser className="w-3.5 h-3.5 text-body" />
                                    اسم المستلم / العميل
                                </label>
                                <input
                                    type="text"
                                    defaultValue={orderData?.customer || 'عبدالرحمن الشهري'}
                                    placeholder="اسم المستلم"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                />
                            </div>

                            {/* Customer Phone UI field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuPhone className="w-3.5 h-3.5 text-body" />
                                    رقم جوال المستلم
                                </label>
                                <input
                                    type="text"
                                    defaultValue="0551122334"
                                    placeholder="050XXXXXXX"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border/60" />

                    {/* Section 2: Logistics & Carrier Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent" />
                            المسار والناقل اللوجستي
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Route/Cities UI field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMapPin className="w-3.5 h-3.5 text-body" />
                                    مسار الشحن (من ← إلى)
                                </label>
                                <input
                                    type="text"
                                    defaultValue={orderData?.dest || 'الرياض ← الدمام'}
                                    placeholder="مسار الشحن"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                />
                            </div>

                            {/* Carrier UI field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuTruck className="w-3.5 h-3.5 text-body" />
                                    الناقل المخصص
                                </label>
                                <input
                                    type="text"
                                    defaultValue={orderData?.carrier || 'أسطول الشركة'}
                                    placeholder="الناقل"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        {/* Driver Assigned UI field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                <LuUser className="w-3.5 h-3.5 text-body" />
                                اسم السائق المكلف
                            </label>
                            <input
                                type="text"
                                defaultValue={orderData?.driver || 'سعد القحطاني'}
                                placeholder="السائق"
                                className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-border/60" />

                    {/* Section 3: Financials & Status */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent" />
                            القيمة وحالة الشحنة
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Amount UI field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuDollarSign className="w-3.5 h-3.5 text-body" />
                                    إجمالي قيمة الشحن (ر.س)
                                </label>
                                <input
                                    type="text"
                                    defaultValue={orderData?.amount || '١٢٠ ر.س'}
                                    placeholder="القيمة"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading font-latin focus:outline-none focus:border-accent"
                                />
                            </div>

                            {/* Status UI select */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuClock className="w-3.5 h-3.5 text-body" />
                                    تعديل حالة الشحنة
                                </label>
                                <select
                                    defaultValue={orderData?.status || 'delivering'}
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer"
                                >
                                    <option value="pending">جديد (Pending)</option>
                                    <option value="delivering">في الطريق (Delivering)</option>
                                    <option value="delivered">تم التسليم (Delivered)</option>
                                    <option value="canceled">ملغي (Canceled)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-border bg-surface-muted/40 flex items-center justify-between gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-border bg-surface text-heading hover:bg-surface-muted font-bold text-sm transition-colors cursor-pointer"
                    >
                        إلغاء
                    </button>

                    <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer">
                        <LuSave className="w-4 h-4" />
                        <span>حفظ التعديلات</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EditOrders;
