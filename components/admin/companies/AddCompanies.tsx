"use client";

import React, { useState } from "react";
import {
    LuBuilding2,
    LuX,
    LuUser,
    LuPhone,
    LuMapPin,
    LuMail,
    LuHash,
    LuFileText,
    LuLock
} from "react-icons/lu";
import { useCreateCompany } from "@/hooks/companies/useCompanies";
import { companyCreateValidationSchema } from "@/lib/validations/companies.schema";
import Loading from "@/components/ui/loading";
import toast from "react-hot-toast";

interface AddCompaniesProps {
    isOpen?: boolean;
    onClose: () => void;
}

export default function AddCompanies({ isOpen = true, onClose }: AddCompaniesProps) {
    const [formData, setFormData] = useState({
        companyName: "",
        email: "",
        phone: "",
        city: "",
        password: "",
        taxNumber: "",
        address: "",
        facilityInfo: "",
        status: "active" as const,
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { mutate: createCompany, isPending: isSubmitting } = useCreateCompany();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const validation = companyCreateValidationSchema.safeParse(formData);
        if (!validation.success) {
            const errors: Record<string, string> = {};
            validation.error.issues.forEach((issue) => {
                if (issue.path[0]) {
                    errors[issue.path[0].toString()] = issue.message;
                }
            });
            setFieldErrors(errors);
            toast.error("يرجى تصحيح الأخطاء الموضحة في النموذج");
            return;
        }

        createCompany(formData, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuBuilding2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">تسجيل شركة شحن جديدة</h2>
                            <p className="text-xs text-gray-500 mt-0.5">إضافة شركة جديدة وحفظ بيانات الاعتماد اللوجستية</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all cursor-pointer disabled:opacity-50"
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
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-600" />
                                البيانات الأساسية للشركة
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                        <LuBuilding2 className="w-3.5 h-3.5 text-gray-400" />
                                        اسم الشركة <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        placeholder="شركة السريع اللوجستية"
                                        className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 disabled:opacity-60 ${
                                            fieldErrors.companyName ? "border-red-500" : "border-gray-200"
                                        }`}
                                    />
                                    {fieldErrors.companyName && <p className="text-red-500 text-xs mt-1">{fieldErrors.companyName}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                        <LuMapPin className="w-3.5 h-3.5 text-gray-400" />
                                        المدينة / المقر الرئيسي <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="الرياض"
                                        className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 disabled:opacity-60 ${
                                            fieldErrors.city ? "border-red-500" : "border-gray-200"
                                        }`}
                                    />
                                    {fieldErrors.city && <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                        <LuMail className="w-3.5 h-3.5 text-gray-400" />
                                        البريد الإلكتروني الرسمي <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        disabled={isSubmitting}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="contact@company.sa"
                                        className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 dir-ltr text-right disabled:opacity-60 ${
                                            fieldErrors.email ? "border-red-500" : "border-gray-200"
                                        }`}
                                    />
                                    {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                        <LuPhone className="w-3.5 h-3.5 text-gray-400" />
                                        رقم الهاتف <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="0501234567"
                                        className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 dir-ltr text-right disabled:opacity-60 ${
                                            fieldErrors.phone ? "border-red-500" : "border-gray-200"
                                        }`}
                                    />
                                    {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100" />

                        {/* Section 2: Optional Tax & Security Details */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-600" />
                                البيانات الإضافية والأمان
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                        <LuHash className="w-3.5 h-3.5 text-gray-400" />
                                        الرقم الضريبي (VAT)
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isSubmitting}
                                        value={formData.taxNumber}
                                        onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                                        placeholder="300000000000003"
                                        className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 disabled:opacity-60 ${
                                            fieldErrors.taxNumber ? "border-red-500" : "border-gray-200"
                                        }`}
                                    />
                                    {fieldErrors.taxNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.taxNumber}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                        <LuLock className="w-3.5 h-3.5 text-gray-400" />
                                        كلمة المرور الإضافية
                                    </label>
                                    <input
                                        type="password"
                                        disabled={isSubmitting}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="******"
                                        className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 disabled:opacity-60 ${
                                            fieldErrors.password ? "border-red-500" : "border-gray-200"
                                        }`}
                                    />
                                    {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                    <LuMapPin className="w-3.5 h-3.5 text-gray-400" />
                                    العنوان التفصيلي
                                </label>
                                <input
                                    type="text"
                                    disabled={isSubmitting}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="شارع الملك فهد، حي الملز، الرياض"
                                    className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 disabled:opacity-60 ${
                                        fieldErrors.address ? "border-red-500" : "border-gray-200"
                                    }`}
                                />
                                {fieldErrors.address && <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                    <LuFileText className="w-3.5 h-3.5 text-gray-400" />
                                    معلومات المنشأة
                                </label>
                                <textarea
                                    disabled={isSubmitting}
                                    rows={2}
                                    value={formData.facilityInfo}
                                    onChange={(e) => setFormData({ ...formData, facilityInfo: e.target.value })}
                                    placeholder="نبذة أو ملاحظات عن نشاط المنشأة اللوجستية..."
                                    className={`w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-500 disabled:opacity-60 ${
                                        fieldErrors.facilityInfo ? "border-red-500" : "border-gray-200"
                                    }`}
                                />
                                {fieldErrors.facilityInfo && <p className="text-red-500 text-xs mt-1">{fieldErrors.facilityInfo}</p>}
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                            إلغاء
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loading w="w-4" h="h-4" />
                                    <span>جاري الحفظ...</span>
                                </>
                            ) : (
                                <>
                                    <LuBuilding2 className="w-4 h-4" />
                                    <span>تأكيد وتسجيل الشركة</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}