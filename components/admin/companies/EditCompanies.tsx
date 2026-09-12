"use client";

import React, { useState, useEffect } from "react";
import {
    LuBuilding2,
    LuX,
    LuPhone,
    LuMapPin,
    LuMail,
    LuHash,
    LuFileText,
    LuPencil,
    LuShieldCheck
} from "react-icons/lu";
import { Company } from "@/types/data";
import { useUpdateCompany } from "@/hooks/companies/useCompanies";
import { updateCompanyValidationSchema } from "@/lib/validations/companies.schema";
import toast from "react-hot-toast";

interface EditCompaniesProps {
    isOpen?: boolean;
    onClose: () => void;
    company: Company | null;
}

export default function EditCompanies({ isOpen = true, onClose, company }: EditCompaniesProps) {
    const [formValues, setFormValues] = useState({
        companyName: "",
        email: "",
        phone: "",
        city: "",
        taxNumber: "",
        address: "",
        facilityInfo: "",
        status: "active" as Company["status"],
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: updateCompany, isPending: isSubmitting } = useUpdateCompany();

    useEffect(() => {
        if (company) {
            setFormValues({
                companyName: company.companyName || "",
                email: company.email || "",
                phone: company.phone || "",
                city: company.city || "",
                taxNumber: company.taxNumber || "",
                address: company.address || "",
                facilityInfo: company.facilityInfo || "",
                status: company.status || "active",
            });
            setFieldErrors({});
        }
    }, [company]);

    if (!isOpen || !company) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const validation = updateCompanyValidationSchema.safeParse(formValues);
        if (!validation.success) {
            const errors: Record<string, string> = {};
            validation.error.issues.forEach((issue) => {
                if (issue.path[0]) {
                    errors[issue.path[0].toString()] = issue.message;
                }
            });
            setFieldErrors(errors);
            toast.error("يرجى تصحيح الأخطاء الموضحة");
            return;
        }

        updateCompany(
            { id: company._id, updates: formValues },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuPencil className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">تعديل بيانات الشركة</h2>
                            <p className="text-xs text-body mt-0.5">
                                تحديث المعلومات الأساسية والحالة لـ (<span className="font-bold text-accent">{company.companyName}</span>)
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer disabled:opacity-50"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-6 text-right">

                        {/* Section 1: Basic Company Info */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                البيانات الأساسية
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuBuilding2 className="w-3.5 h-3.5 text-body" />
                                        اسم الشركة <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.companyName}
                                        onChange={(e) => setFormValues({ ...formValues, companyName: e.target.value })}
                                        placeholder="اسم الشركة"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-60 ${fieldErrors.companyName ? "border-rose-500" : "border-border"
                                            }`}
                                    />
                                    {fieldErrors.companyName && <p className="text-rose-500 text-xs mt-1 font-medium">{fieldErrors.companyName}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuMapPin className="w-3.5 h-3.5 text-body" />
                                        المدينة / المقر الرئيسي <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.city}
                                        onChange={(e) => setFormValues({ ...formValues, city: e.target.value })}
                                        placeholder="الرياض"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-60 ${fieldErrors.city ? "border-rose-500" : "border-border"
                                            }`}
                                    />
                                    {fieldErrors.city && <p className="text-rose-500 text-xs mt-1 font-medium">{fieldErrors.city}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuMail className="w-3.5 h-3.5 text-body" />
                                        البريد الإلكتروني <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        disabled={isSubmitting}
                                        value={formValues.email}
                                        onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                                        placeholder="contact@company.sa"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent dir-ltr text-right disabled:opacity-60 ${fieldErrors.email ? "border-rose-500" : "border-border"
                                            }`}
                                    />
                                    {fieldErrors.email && <p className="text-rose-500 text-xs mt-1 font-medium">{fieldErrors.email}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuPhone className="w-3.5 h-3.5 text-body" />
                                        رقم الهاتف <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.phone}
                                        onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                                        placeholder="0501234567"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent dir-ltr text-right disabled:opacity-60 ${fieldErrors.phone ? "border-rose-500" : "border-border"
                                            }`}
                                    />
                                    {fieldErrors.phone && <p className="text-rose-500 text-xs mt-1 font-medium">{fieldErrors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Section 2: Status & Tax Details */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent" />
                                حالة الحساب والبيانات الرسمية
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuHash className="w-3.5 h-3.5 text-body" />
                                        الرقم الضريبي (VAT)
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formValues.taxNumber}
                                        onChange={(e) => setFormValues({ ...formValues, taxNumber: e.target.value })}
                                        placeholder="300000000000003"
                                        className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-60 ${fieldErrors.taxNumber ? "border-rose-500" : "border-border"
                                            }`}
                                    />
                                    {fieldErrors.taxNumber && <p className="text-rose-500 text-xs mt-1 font-medium">{fieldErrors.taxNumber}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                        <LuShieldCheck className="w-3.5 h-3.5 text-body" />
                                        حالة الشركة بالنظام
                                    </label>
                                    <select
                                        disabled={isSubmitting}
                                        value={formValues.status}
                                        onChange={(e) => setFormValues({ ...formValues, status: e.target.value as Company["status"] })}
                                        className="w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading focus:outline-none focus:border-accent cursor-pointer disabled:opacity-60"
                                    >
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                        <option value="archived">مؤرشف (Archived)</option>
                                        <option value="banned">محظور (Banned)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuMapPin className="w-3.5 h-3.5 text-body" />
                                    العنوان التفصيلي
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formValues.address}
                                    onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                                    placeholder="العنوان التفصيلي"
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-60 ${fieldErrors.address ? "border-rose-500" : "border-border"
                                        }`}
                                />
                                {fieldErrors.address && <p className="text-rose-500 text-xs mt-1 font-medium">{fieldErrors.address}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-heading flex items-center gap-1.5">
                                    <LuFileText className="w-3.5 h-3.5 text-body" />
                                    معلومات المنشأة
                                </label>
                                <textarea
                                    disabled={isSubmitting}
                                    rows={2}
                                    value={formValues.facilityInfo}
                                    onChange={(e) => setFormValues({ ...formValues, facilityInfo: e.target.value })}
                                    placeholder="معلومات عن المنشأة..."
                                    className={`w-full px-4 py-2.5 rounded-md bg-surface-muted border border-border text-sm text-heading placeholder:text-body/50 focus:outline-none focus:border-accent disabled:opacity-60 ${fieldErrors.facilityInfo ? "border-rose-500" : "border-border"
                                        }`}
                                />
                                {fieldErrors.facilityInfo && <p className="text-rose-500 text-xs mt-1 font-medium">{fieldErrors.facilityInfo}</p>}
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-border bg-surface-muted/40 flex items-center justify-between gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-md border border-border bg-surface text-heading hover:bg-surface-muted font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                            إلغاء
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[130px] justify-center"
                        >
                            {isSubmitting ? "جاري التعديل..." : "حفظ التعديلات"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
