"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import AdminCompanySelect from "@/components/admin/common/AdminCompanySelect";
import AdminCompanySubscriptionWidget from "@/components/admin/common/AdminCompanySubscriptionWidget";
import { orderCreateValidationSchema } from "@/lib/validations/order.schema";
import {
    LuFileSpreadsheet,
    LuX,
    LuDownload,
    LuUpload,
    LuCheck,
    LuTriangle,
    LuTrash2,
} from "react-icons/lu";

interface BulkImportAdminOrdersPopupProps {
    isOpen?: boolean;
    onClose: () => void;
}

interface ParsedRow {
    index: number;
    rawData: any;
    formattedData: any;
    isValid: boolean;
    errors: string[];
}

export default function BulkImportAdminOrdersPopup({ isOpen = true, onClose }: BulkImportAdminOrdersPopupProps) {
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
    const [fileName, setFileName] = useState<string>("");
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const queryClient = useQueryClient();

    if (!isOpen) return null;

    // Normalize headers
    const normalizeHeaders = (row: Record<string, any>) => {
        const normalized: Record<string, any> = {};

        for (const [key, rawValue] of Object.entries(row)) {
            const cleanKey = key.trim().toLowerCase();
            const val = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : "";

            if (cleanKey.includes("اسم المستلم") || cleanKey.includes("اسم") || cleanKey === "recipientname" || cleanKey === "name") {
                normalized.recipientName = val;
            } else if (cleanKey.includes("جوال") || cleanKey.includes("هاتف") || cleanKey === "recipientphone" || cleanKey === "phone") {
                normalized.recipientPhone = val;
            } else if (cleanKey.includes("مدينة") || cleanKey.includes("المدينة") || cleanKey === "recipientcity" || cleanKey === "city") {
                normalized.recipientCity = val;
            } else if (cleanKey.includes("حي") || cleanKey.includes("الحي") || cleanKey === "recipientdistrict" || cleanKey === "district") {
                normalized.recipientDistrict = val;
            } else if (cleanKey.includes("عنوان") || cleanKey.includes("العنوان") || cleanKey === "recipientaddress" || cleanKey === "address") {
                normalized.recipientAddress = val;
            } else if (cleanKey.includes("وصف") || cleanKey === "description") {
                normalized.description = val;
            } else if (cleanKey.includes("وزن") || cleanKey === "weight") {
                normalized.weight = parseFloat(val) || 0;
            } else if (cleanKey.includes("قيمة") || cleanKey === "ordervalue" || cleanKey === "value") {
                normalized.orderValue = parseFloat(val) || 0;
            } else if (cleanKey.includes("دفع") || cleanKey.includes("cod") || cleanKey === "codamount") {
                normalized.codAmount = parseFloat(val) || 0;
            } else if (cleanKey.includes("كمية") || cleanKey === "quantity") {
                normalized.quantity = parseInt(val, 10) || 1;
            } else if (cleanKey.includes("رقم الطلب") || cleanKey === "ordernumber") {
                normalized.orderNumber = val;
            }
        }

        return normalized;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setIsProcessing(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const workbook = XLSX.read(bstr, { type: "binary" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });

                if (!jsonData || jsonData.length === 0) {
                    toast.error("الملف المرفوع فارغ أو غير صالح");
                    setIsProcessing(false);
                    return;
                }

                if (jsonData.length > 500) {
                    toast.error("الحد الأقصى هو 500 طلب في الملف الواحد");
                    setIsProcessing(false);
                    return;
                }

                const seenOrderNumbers = new Set<string>();

                const results: ParsedRow[] = jsonData.map((rawRow, idx) => {
                    const normalized = normalizeHeaders(rawRow);
                    const errors: string[] = [];

                    if (normalized.orderNumber) {
                        if (seenOrderNumbers.has(normalized.orderNumber)) {
                            errors.push("رقم الطلب مكرر أكثر من مرة داخل هذا الملف");
                        } else {
                            seenOrderNumbers.add(normalized.orderNumber);
                        }
                    }

                    const testPayload = {
                        ...normalized,
                        companyId: selectedCompanyId || "dummy_company_id",
                    };

                    const validation = orderCreateValidationSchema.safeParse(testPayload);

                    if (!validation.success) {
                        validation.error.issues.forEach((issue) => {
                            errors.push(issue.message);
                        });
                    }

                    return {
                        index: idx + 1,
                        rawData: rawRow,
                        formattedData: normalized,
                        isValid: errors.length === 0,
                        errors,
                    };
                });

                setParsedRows(results);
                toast.success(`تم قراءة ${results.length} صف من الملف بنجاح`);
            } catch (err: any) {
                toast.error("حدث خطأ أثناء قراءة ملف الإكسل: " + err.message);
            } finally {
                setIsProcessing(false);
            }
        };

        reader.readAsBinaryString(file);
    };

    const handleDownloadTemplate = () => {
        const sampleData = [
            {
                "اسم المستلم": "محمد أحمد",
                "رقم الجوال": "0501234567",
                "المدينة": "الرياض",
                "الحي": "حي النرجس",
                "العنوان التفصيلي": "شارع التخصصي، مبنى 12",
                "الوزن (كجم)": 2.5,
                "قيمة الطلب (ر.س)": 150,
                "الدفع عند الاستلام (COD)": 150,
                "الكمية": 1,
                "وصف الشحنة": "ملابس وإكسسوارات",
                "رقم الطلب الخاص": "ORD-0001"
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "نموذج الطلبات");
        XLSX.writeFile(workbook, "نموذج_استيراد_الطلبات_شحنتك.xlsx");
        toast.success("تم تنزيل نموذج الإكسل الاسترشادي بنجاح");
    };

    const handleReset = () => {
        setFileName("");
        setParsedRows([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleCloseModal = () => {
        handleReset();
        onClose();
    };

    const validRows = parsedRows.filter((r) => r.isValid);
    const invalidRows = parsedRows.filter((r) => !r.isValid);

    const handleConfirmImport = async () => {
        if (!selectedCompanyId) {
            toast.error("يرجى اختيار الشركة المستهدفة أولاً");
            return;
        }

        if (validRows.length === 0) {
            toast.error("لا توجد أي طلبات صالحة للاستيراد");
            return;
        }

        try {
            setIsSubmitting(true);
            const ordersToSubmit = validRows.map((r) => r.formattedData);

            const { data } = await axios.post("/api/admin/orders/bulk", {
                companyId: selectedCompanyId,
                orders: ordersToSubmit,
            });

            if (data.success) {
                toast.success(data.message || `تم استيراد ${data.count} طلب بنجاح`);
                queryClient.invalidateQueries({ queryKey: ["orders"] });
                queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
                handleCloseModal();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "حدث خطأ أثناء الاستيراد الجماعي للطلبات");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
            <div className="relative w-full max-w-4xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuFileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">استيراد الطلبات الجماعي للأدمن</h2>
                            <p className="text-xs text-body mt-0.5">رفع ملف Excel مجمع بعد تحديد الشركة واستعراض سعة باقتها الحية</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleCloseModal}
                        disabled={isSubmitting}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer disabled:opacity-50"
                        title="إغلاق"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">

                    {/* Company Selector & Live Subscription Widget */}
                    <div className="space-y-3">
                        <AdminCompanySelect
                            value={selectedCompanyId}
                            onChange={(id) => setSelectedCompanyId(id)}
                            disabled={isSubmitting || isProcessing}
                        />
                        {selectedCompanyId && (
                            <AdminCompanySubscriptionWidget companyId={selectedCompanyId} compact />
                        )}
                    </div>

                    {/* Helper Bar */}
                    <div className="p-4 rounded-2xl bg-accent-soft/40 border border-accent/20 flex items-center justify-between gap-4 flex-wrap">
                        <div className="space-y-0.5">
                            <h4 className="text-xs font-extrabold text-heading">تنزيل نموذج Excel الاسترشادي</h4>
                            <p className="text-xs text-body">يمكنك استخدام هذا النموذج وتعبئة بيانات المستلمين ثم رفعه مباشرة</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-accent font-bold text-xs hover:bg-accent-soft transition-all cursor-pointer shadow-xs"
                        >
                            <LuDownload className="w-4 h-4" />
                            تنزيل النموذج
                        </button>
                    </div>

                    {/* Upload Zone */}
                    {parsedRows.length === 0 ? (
                        <div className="border-2 border-dashed border-border hover:border-accent rounded-3xl p-8 text-center transition-all bg-surface-muted/30 hover:bg-surface-muted/60 flex flex-col items-center justify-center min-h-[180px]">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="admin-excel-file-input"
                            />
                            <label htmlFor="admin-excel-file-input" className="cursor-pointer flex flex-col items-center justify-center w-full">
                                <div className="w-14 h-14 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xl mb-2 shadow-xs">
                                    <LuUpload className="w-7 h-7" />
                                </div>
                                <span className="text-sm font-extrabold text-heading">اسحب ملف الإكسل هنا أو اضغط للاختيار</span>
                                <span className="text-xs text-body/70 mt-1">يدعم الصيغ (.xlsx, .xls, .csv) - الحد الأقصى 500 طلب</span>
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-surface-muted p-3.5 rounded-2xl border border-border">
                                <div className="flex items-center gap-3">
                                    <LuFileSpreadsheet className="w-5 h-5 text-accent" />
                                    <span className="text-sm font-bold text-heading">{fileName}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                                >
                                    <LuTrash2 className="w-4 h-4" />
                                    إلغاء الملف وإعادة الرفع
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3.5 rounded-2xl bg-surface-muted border border-border text-center">
                                    <span className="text-xs font-bold text-body block">إجمالي الصفوف</span>
                                    <span className="text-lg font-extrabold text-heading font-latin">{parsedRows.length}</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                    <span className="text-xs font-bold text-emerald-600 block flex items-center justify-center gap-1">
                                        <LuCheck className="w-3.5 h-3.5" /> طلبات صالحة
                                    </span>
                                    <span className="text-lg font-extrabold text-emerald-600 font-latin">{validRows.length}</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                                    <span className="text-xs font-bold text-rose-600 block flex items-center justify-center gap-1">
                                        <LuTriangle className="w-3.5 h-3.5" /> طلبات بها أخطاء
                                    </span>
                                    <span className="text-lg font-extrabold text-rose-600 font-latin">{invalidRows.length}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-border bg-surface-muted/40 flex items-center justify-between gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={handleCloseModal}
                        disabled={isSubmitting || isProcessing}
                        className="px-5 py-2.5 rounded-xl border border-border bg-surface text-heading hover:bg-surface-muted font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                        إلغاء
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirmImport}
                        disabled={isSubmitting || isProcessing || validRows.length === 0 || !selectedCompanyId}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[160px] justify-center"
                    >
                        {isSubmitting
                            ? "جاري الاستيراد..."
                            : validRows.length > 0
                            ? `تأكيد وحفظ ${validRows.length} طلب للشركة`
                            : "اختر ملفاً وشراكة"}
                    </button>
                </div>
            </div>
        </div>
    );
}
