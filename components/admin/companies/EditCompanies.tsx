import React from 'react';
import {
    LuBuilding2,
    LuX,
    LuGlobe,
    LuUser,
    LuPhone,
    LuCrown,
    LuMapPin,
    LuCheck,
    LuMail,
    LuHash,
    LuSave,
    LuPencil,
    LuShieldCheck
} from 'react-icons/lu';

interface EditCompaniesProps {
    isOpen?: boolean;
    onClose?: () => void;
    companyData?: {
        id?: string;
        name?: string;
        domain?: string;
        owner?: string;
        phone?: string;
        plan?: string;
        status?: string;
    } | null;
}

const EditCompanies: React.FC<EditCompaniesProps> = ({ isOpen = false, onClose, companyData }) => {
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
                            <h2 className="text-xl font-extrabold text-heading">تعديل بيانات شركة الشحن</h2>
                            <p className="text-xs text-body mt-0.5">
                                تحديث المعلومات الأساسية، تفاصيل الاتصال، والباقة الحالية لـ ({companyData?.name || 'شركة الرياض السريع'})
                            </p>
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

                    {/* Section 1: Basic Company Info */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent" />
                            البيانات الأساسية للشركة
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Company Name UI field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuBuilding2 className="w-3.5 h-3.5 text-body" />
                                    اسم الشركة
                                </label>
                                <input
                                    type="text"
                                    defaultValue={companyData?.name || 'شركة الرياض السريع'}
                                    placeholder="اسم الشركة"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent"
                                />
                            </div>

                            {/* Subdomain UI field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuGlobe className="w-3.5 h-3.5 text-body" />
                                    النطاق الفرعي (Subdomain)
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        defaultValue={companyData?.domain?.replace('.shahnetak.sa', '') || 'riyadh-express'}
                                        placeholder="subdomain"
                                        className="w-full pl-28 pr-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 font-latin dir-ltr focus:outline-none focus:border-accent"
                                    />
                                    <span className="absolute left-3 text-xs font-bold text-body font-latin select-none">
                                        .shahnetak.sa
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Tax Number UI field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuHash className="w-3.5 h-3.5 text-body" />
                                    الرقم الضريبي (VAT)
                                </label>
                                <input
                                    type="text"
                                    defaultValue="310492847200003"
                                    placeholder="300000000000003"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 font-latin focus:outline-none focus:border-accent"
                                />
                            </div>

                            {/* City UI field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMapPin className="w-3.5 h-3.5 text-body" />
                                    المدينة / المقر الرئيسي
                                </label>
                                <input
                                    type="text"
                                    defaultValue="الرياض - منطقة الملز"
                                    placeholder="المدينة"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border/60" />

                    {/* Section 2: Owner Contact Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent" />
                            بيانات المالك والاتصال
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Owner Name UI field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuUser className="w-3.5 h-3.5 text-body" />
                                    اسم صاحب الشركة / المدير
                                </label>
                                <input
                                    type="text"
                                    defaultValue={companyData?.owner || 'سلطان العتيبي'}
                                    placeholder="اسم صاحب الشركة"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent"
                                />
                            </div>

                            {/* Phone UI field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuPhone className="w-3.5 h-3.5 text-body" />
                                    رقم الجوال
                                </label>
                                <input
                                    type="text"
                                    defaultValue={companyData?.phone || '0501234567'}
                                    placeholder="0501234567"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 font-latin focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email UI field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMail className="w-3.5 h-3.5 text-body" />
                                    البريد الإلكتروني الرسمي
                                </label>
                                <input
                                    type="email"
                                    defaultValue="info@riyadh-express.sa"
                                    placeholder="contact@company.sa"
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 font-latin focus:outline-none focus:border-accent"
                                />
                            </div>

                            {/* Company Status Select UI */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuShieldCheck className="w-3.5 h-3.5 text-body" />
                                    حالة الشركة بالنظام
                                </label>
                                <select
                                    defaultValue={companyData?.status || 'active'}
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer"
                                >
                                    <option value="active">نشط (Active)</option>
                                    <option value="quota_warning">تجاوز الباقة (Quota Warning)</option>
                                    <option value="pending">قيد المراجعة (Pending)</option>
                                    <option value="suspended">موقوف (Suspended)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border/60" />

                    {/* Section 3: Subscription Plan UI Cards */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                            <LuCrown className="w-3.5 h-3.5 text-accent" />
                            تحديث الباقة اللوجستية
                        </label>

                        <div className="grid grid-cols-3 gap-3">
                            {/* Plan Option 1 */}
                            <div className="p-3.5 rounded-2xl border border-border hover:border-accent/40 bg-surface-muted/50 flex flex-col justify-between space-y-2 cursor-pointer transition-all">
                                <div>
                                    <span className="text-xs font-extrabold text-heading block">البداية</span>
                                    <span className="text-[11px] text-body">حتى ٥٠٠ شحنة / شهر</span>
                                </div>
                                <b className="text-sm font-extrabold text-heading font-latin">٥٠٠ ر.س</b>
                            </div>

                            {/* Plan Option 2 */}
                            <div className="p-3.5 rounded-2xl border border-border hover:border-accent/40 bg-surface-muted/50 flex flex-col justify-between space-y-2 cursor-pointer transition-all">
                                <div>
                                    <span className="text-xs font-extrabold text-heading block">النمو</span>
                                    <span className="text-[11px] text-body">حتى ٥,٠٠٠ شحنة / شهر</span>
                                </div>
                                <b className="text-sm font-extrabold text-heading font-latin">١,٥٠٠ ر.س</b>
                            </div>

                            {/* Plan Option 3 (Selected) */}
                            <div className="p-3.5 rounded-2xl border-2 border-accent bg-accent-soft/30 flex flex-col justify-between space-y-2 cursor-pointer relative overflow-hidden">
                                <span className="absolute top-2 left-2 w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center text-[10px]">
                                    <LuCheck className="w-3 h-3" />
                                </span>
                                <div>
                                    <span className="text-xs font-extrabold text-heading block">المؤسسات</span>
                                    <span className="text-[11px] text-body">غير محدود</span>
                                </div>
                                <b className="text-sm font-extrabold text-accent font-latin">مخصص</b>
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

                    <button
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all opacity-90 cursor-pointer"
                    >
                        <LuSave className="w-4 h-4" />
                        <span>حفظ التعديلات</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EditCompanies;
