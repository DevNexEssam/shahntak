"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { useBulkImportCompanyOrders } from "@/hooks/company/useCompanyOrder";
import { orderCreateValidationSchema } from "@/lib/validations/order.schema";
import {
    LuFileSpreadsheet,
    LuX,
    LuDownload,
    LuUpload,
    LuCircleCheck,
    LuCircleAlert,
    LuTrash2,
} from "react-icons/lu";

interface BulkImportOrdersPopupProps {
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

export default function BulkImportOrdersPopup({ isOpen = true, onClose }: BulkImportOrdersPopupProps) {
    const [fileName, setFileName] = useState<string>("");
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutate: bulkImportOrders, isPending: isSubmitting } = useBulkImportCompanyOrders();

    if (!isOpen) return null;

    // Helper: Normalize Excel Headers (Arabic & English)
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

    // Handle File Processing
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

                    // Add dummy companyId for client-side zod validation check
                    const testPayload = {
                        ...normalized,
                        companyId: "dummy_company_id",
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

    // Download Sample Template
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
            },
            {
                "اسم المستلم": "عبدالله علي",
                "رقم الجوال": "0559876543",
                "المدينة": "جدة",
                "الحي": "حي الشاطئ",
                "العنوان التفصيلي": "طريق الكورنيش، برج 4",
                "الوزن (كجم)": 5.0,
                "قيمة الطلب (ر.س)": 320,
                "الدفع عند الاستلام (COD)": 0,
                "الكمية": 2,
                "وصف الشحنة": "أجهزة إلكترونية",
                "رقم الطلب الخاص": ""
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "نموذج الطلبات");
        XLSX.writeFile(workbook, "نموذج_استيراد_الطلبات_شحنتك.xlsx");
        toast.success("تم تنزيل نموذج الإكسل الاسترشادي بنجاح");
    };

    // Reset uploaded file
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

    // Filter valid vs invalid
    const validRows = parsedRows.filter((r) => r.isValid);
    const invalidRows = parsedRows.filter((r) => !r.isValid);

    // Submit Valid Rows
    const handleConfirmImport = () => {
        if (validRows.length === 0) {
            toast.error("لا توجد أي طلبات صالحة للاستيراد");
            return;
        }

        const ordersToSubmit = validRows.map((r) => r.formattedData);

        bulkImportOrders(ordersToSubmit, {
            onSuccess: () => {
                handleReset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="relative w-full max-w-4xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuFileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">استيراد الطلبات من ملف Excel</h2>
                            <p className="text-xs text-body mt-0.5">إضافة طلبات مجمعة دفعة واحدة بسهولة عبر رفع ملف إكسل أو CSV</p>
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

                    {/* Top Helper Bar: Download Template */}
                    <div className="p-4 rounded-2xl bg-accent-soft/40 border border-accent/20 flex items-center justify-between gap-4 flex-wrap">
                        <div className="space-y-0.5">
                            <h4 className="text-xs font-extrabold text-heading">هل تريد نموذج إكسل جاهز؟</h4>
                            <p className="text-xs text-body">يمكنك تنزيل النموذج المنسق باللغة العربية وتعبئة طلباتك ثم إعادة رفعه فوراً</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-accent font-bold text-xs hover:bg-accent-soft transition-all cursor-pointer shadow-xs"
                        >
                            <LuDownload className="w-4 h-4" />
                            تنزيل نموذج Excel
                        </button>
                    </div>

                    {/* Upload Zone (If no file uploaded yet) */}
                    {parsedRows.length === 0 ? (
                        <div className="border-2 border-dashed border-border hover:border-accent rounded-3xl p-8 text-center transition-all bg-surface-muted/30 hover:bg-surface-muted/60 flex flex-col items-center justify-center min-h-[220px]">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="excel-file-input"
                            />
                            <label htmlFor="excel-file-input" className="cursor-pointer flex flex-col items-center justify-center w-full">
                                <div className="w-16 h-16 rounded-full bg-accent-soft text-accent flex items-center justify-center text-2xl mb-3 shadow-xs">
                                    <LuUpload className="w-8 h-8" />
                                </div>
                                <span className="text-sm font-extrabold text-heading">اسحب ملف الإكسل هنا أو اضغط للاختيار</span>
                                <span className="text-xs text-body/70 mt-1">يدعم الصيغ (.xlsx, .xls, .csv) - الحد الأقصى 500 طلب</span>
                            </label>
                        </div>
                    ) : (
                        /* Preview & Validation Summary */
                        <div className="space-y-4">
                            {/* File Info Bar */}
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

                            {/* Summary KPI Pills */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3.5 rounded-2xl bg-surface-muted border border-border text-center">
                                    <span className="text-xs font-bold text-body block">إجمالي الصفوف</span>
                                    <span className="text-lg font-extrabold text-heading font-latin">{parsedRows.length}</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                    <span className="text-xs font-bold text-emerald-600 block flex items-center justify-center gap-1">
                                        <LuCircleCheck className="w-3.5 h-3.5" /> طلبات صالحة
                                    </span>
                                    <span className="text-lg font-extrabold text-emerald-600 font-latin">{validRows.length}</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                                    <span className="text-xs font-bold text-rose-600 block flex items-center justify-center gap-1">
                                        <LuCircleAlert className="w-3.5 h-3.5" /> طلبات بها أخطاء
                                    </span>
                                    <span className="text-lg font-extrabold text-rose-600 font-latin">{invalidRows.length}</span>
                                </div>
                            </div>

                            {/* Data Preview Table */}
                            <div className="border border-border rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-surface-muted/80 text-body font-bold sticky top-0 border-b border-border">
                                        <tr>
                                            <th className="p-3">#</th>
                                            <th className="p-3">الحالة</th>
                                            <th className="p-3">اسم المستلم</th>
                                            <th className="p-3">الجوال</th>
                                            <th className="p-3">المدينة</th>
                                            <th className="p-3">العنوان</th>
                                            <th className="p-3">الوزن</th>
                                            <th className="p-3">القيمة</th>
                                            <th className="p-3">التفاصيل والأخطاء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {parsedRows.map((row) => (
                                            <tr
                                                key={row.index}
                                                className={row.isValid ? "hover:bg-emerald-50/30" : "bg-rose-500/5 hover:bg-rose-500/10"}
                                            >
                                                <td className="p-3 font-bold text-body font-latin">{row.index}</td>
                                                <td className="p-3">
                                                    {row.isValid ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1">
                                                            <LuCircleCheck className="w-3 h-3" /> صالحة
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-bold text-[11px] inline-flex items-center gap-1">
                                                            <LuCircleAlert className="w-3 h-3" /> خطأ
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 font-bold text-heading">{row.formattedData.recipientName || "-"}</td>
                                                <td className="p-3 font-latin text-body">{row.formattedData.recipientPhone || "-"}</td>
                                                <td className="p-3 text-body">{row.formattedData.recipientCity || "-"}</td>
                                                <td className="p-3 text-body max-w-[150px] truncate">{row.formattedData.recipientAddress || "-"}</td>
                                                <td className="p-3 font-latin text-body">{row.formattedData.weight || 0} كجم</td>
                                                <td className="p-3 font-latin text-body">{row.formattedData.orderValue || 0} ر.س</td>
                                                <td className="p-3">
                                                    {row.isValid ? (
                                                        <span className="text-emerald-600 text-[11px]">جاهز للإضافة</span>
                                                    ) : (
                                                        <span className="text-rose-600 font-bold text-[11px] block max-w-[200px] truncate" title={row.errors.join(" | ")}>
                                                            {row.errors.join(" - ")}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                        disabled={isSubmitting || isProcessing || validRows.length === 0}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[160px] justify-center"
                    >
                        {isSubmitting
                            ? "جاري الاستيراد..."
                            : validRows.length > 0
                                ? `تأكيد وحفظ ${validRows.length} طلب`
                                : "اختر ملفاً للاستيراد"}
                    </button>
                </div>
            </div>
        </div>
    );
}
