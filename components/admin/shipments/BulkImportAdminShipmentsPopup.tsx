"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import AdminCompanySelect from "@/components/admin/common/AdminCompanySelect";
import AdminCompanySubscriptionWidget from "@/components/admin/common/AdminCompanySubscriptionWidget";
import {
    LuTruck,
    LuX,
    LuDownload,
    LuUpload,
    LuCircleCheck,
    LuCircleAlert,
    LuTrash2,
} from "react-icons/lu";

interface BulkImportAdminShipmentsPopupProps {
    isOpen?: boolean;
    onClose: () => void;
}

interface ParsedShipmentGroup {
    shipmentCode: string;
    origin: string;
    destination: string;
    type: string;
    customPrice?: number;
    orders: any[];
    isValid: boolean;
    errors: string[];
}

export default function BulkImportAdminShipmentsPopup({ isOpen = true, onClose }: BulkImportAdminShipmentsPopupProps) {
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
    const [fileName, setFileName] = useState<string>("");
    const [parsedGroups, setParsedGroups] = useState<ParsedShipmentGroup[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const queryClient = useQueryClient();

    if (!isOpen) return null;

    const handleReset = () => {
        setFileName("");
        setParsedGroups([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleCloseModal = () => {
        handleReset();
        onClose();
    };

    const normalizeRowKeys = (row: Record<string, any>) => {
        const normalized: Record<string, any> = {};

        for (const [key, rawValue] of Object.entries(row)) {
            const cleanKey = key.trim().toLowerCase();
            const val = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : "";

            if (cleanKey.includes("نوع") || cleanKey === "type") {
                normalized.type = val || "ftl";
            } else if (cleanKey.includes("رمز") || cleanKey.includes("تجميع") || cleanKey.includes("مجموعة") || cleanKey === "shipmentcode" || cleanKey === "shipment_code") {
                normalized.shipmentCode = val;
            } else if (cleanKey.includes("قيام") || cleanKey.includes("مدينة القيام") || cleanKey === "origin") {
                normalized.origin = val || "الرياض";
            } else if (cleanKey.includes("وصول") || cleanKey.includes("مدينة الوصول") || cleanKey === "destination") {
                normalized.destination = val || "جدة";
            } else if (cleanKey.includes("سعر مخصص") || cleanKey.includes("السعر المخصص") || cleanKey.includes("سعر") || cleanKey === "customprice") {
                normalized.customPrice = parseFloat(val) || undefined;
            } else if (cleanKey.includes("اسم المستلم") || cleanKey.includes("اسم") || cleanKey === "recipientname") {
                normalized.recipientName = val;
            } else if (cleanKey.includes("جوال") || cleanKey.includes("هاتف") || cleanKey === "recipientphone") {
                normalized.recipientPhone = val;
            } else if (cleanKey.includes("عنوان") || cleanKey === "recipientaddress") {
                normalized.recipientAddress = val;
            } else if (cleanKey.includes("حي") || cleanKey === "recipientdistrict") {
                normalized.recipientDistrict = val;
            } else if (cleanKey.includes("وزن") || cleanKey === "weight") {
                normalized.weight = parseFloat(val) || 0;
            } else if (cleanKey.includes("قيمة") || cleanKey === "ordervalue") {
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

                const groupMap = new Map<string, ParsedShipmentGroup>();

                jsonData.forEach((rawRow) => {
                    const norm = normalizeRowKeys(rawRow);
                    const rawCode = norm.shipmentCode || "";
                    const origin = norm.origin || "الرياض";
                    const destination = norm.destination || "جدة";

                    const groupKey = rawCode
                        ? `${rawCode}_${origin}_${destination}`
                        : `${origin}_${destination}`;

                    const displayCode = rawCode || `SHP-${origin}-${destination}`;

                    if (!groupMap.has(groupKey)) {
                        groupMap.set(groupKey, {
                            shipmentCode: displayCode,
                            origin: origin,
                            destination: destination,
                            type: norm.type || "ftl",
                            customPrice: norm.customPrice,
                            orders: [],
                            isValid: true,
                            errors: [],
                        });
                    }

                    const group = groupMap.get(groupKey)!;

                    const orderItem = {
                        orderNumber: norm.orderNumber,
                        recipientName: norm.recipientName || "",
                        recipientPhone: norm.recipientPhone || "",
                        recipientCity: norm.destination || "جدة",
                        recipientDistrict: norm.recipientDistrict || "",
                        recipientAddress: norm.recipientAddress || norm.destination || "",
                        weight: norm.weight || 1,
                        orderValue: norm.orderValue || 0,
                        codAmount: norm.codAmount || 0,
                        quantity: norm.quantity || 1,
                    };

                    const orderErrors: string[] = [];
                    if (!orderItem.recipientName || orderItem.recipientName.length < 2) {
                        orderErrors.push("اسم المستلم مطلوب");
                    }
                    if (!orderItem.recipientPhone || orderItem.recipientPhone.length < 8) {
                        orderErrors.push("رقم الجوال غير صالح");
                    }

                    if (orderErrors.length > 0) {
                        group.isValid = false;
                        group.errors.push(`طلب ${group.orders.length + 1}: ${orderErrors.join(" - ")}`);
                    }

                    group.orders.push(orderItem);
                });

                const results = Array.from(groupMap.values());
                setParsedGroups(results);
                toast.success(`تم قراءة وتجميع ${results.length} شحنة بنجاح من الملف`);
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
                "رمز تجميع الشحنة": "SHP-GROUP-1",
                "مدينة القيام": "الرياض",
                "مدينة الوصول": "جدة",
                "نوع الشحنة": "ftl",
                "السعر المخصص (اختياري)": 1500,
                "اسم المستلم": "محمد أحمد",
                "رقم الجوال": "0501234567",
                "العنوان التفصيلي": "شارع التخصصي، مبنى 12",
                "الوزن (كجم)": 2.5,
                "قيمة الطلب": 150,
                "الدفع عند الاستلام": 150,
                "رقم الطلب الخاص": "ORD-0001"
            },
            {
                "رمز تجميع الشحنة": "SHP-GROUP-1",
                "مدينة القيام": "الرياض",
                "مدينة الوصول": "جدة",
                "نوع الشحنة": "ftl",
                "السعر المخصص (اختياري)": 1500,
                "اسم المستلم": "خالد محمود",
                "رقم الجوال": "0509876543",
                "العنوان التفصيلي": "حي الشاطئ، برج 2",
                "الوزن (كجم)": 4.0,
                "قيمة الطلب": 300,
                "الدفع عند الاستلام": 0,
                "رقم الطلب الخاص": "ORD-0002"
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "نموذج الشحنات");
        XLSX.writeFile(workbook, "نموذج_استيراد_الشحنات_للأدمن_شحنتك.xlsx");
        toast.success("تم تنزيل نموذج إكسل الشحنات بنجاح");
    };

    const validGroups = parsedGroups.filter((g) => g.isValid);
    const invalidGroups = parsedGroups.filter((g) => !g.isValid);

    const handleConfirmImport = async () => {
        if (!selectedCompanyId) {
            toast.error("يرجى اختيار الشركة المستهدفة أولاً");
            return;
        }

        if (validGroups.length === 0) {
            toast.error("لا توجد أي شحنات صالحة للاستيراد");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = validGroups.map((g) => ({
                origin: g.origin,
                destination: g.destination,
                type: g.type,
                customPrice: g.customPrice,
                orders: g.orders,
            }));

            const { data } = await axios.post("/api/company/shipments/bulk", {
                companyId: selectedCompanyId,
                shipments: payload,
            });

            if (data.success) {
                toast.success(data.message || `تم استيراد ${data.count} شحنة بنجاح`);
                queryClient.invalidateQueries({ queryKey: ["shipments"] });
                queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
                handleCloseModal();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "حدث خطأ أثناء الاستيراد الجماعي للشحنات");
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
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs">
                            <LuTruck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">استيراد الشحنات الجماعي للأدمن عبر Excel</h2>
                            <p className="text-xs text-body mt-0.5">رفع شحنات تجميعية بعد تحديد الشركة المستهدفة وربط طلباتها آلياً</p>
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
                    <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-between gap-4 flex-wrap">
                        <div className="space-y-0.5">
                            <h4 className="text-xs font-extrabold text-heading">تنزيل نموذج Excel الاسترشادي للشحنات</h4>
                            <p className="text-xs text-body">يمكنك تعبئة بيانات الشحنات المجمعة والطلبات التابعة ثم رفعها فوراً</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-accent font-bold text-xs hover:bg-accent/10 transition-all cursor-pointer shadow-xs"
                        >
                            <LuDownload className="w-4 h-4" />
                            تنزيل النموذج
                        </button>
                    </div>

                    {/* Upload Zone */}
                    {parsedGroups.length === 0 ? (
                        <div className="border-2 border-dashed border-border hover:border-accent rounded-3xl p-8 text-center transition-all bg-surface-muted/30 hover:bg-surface-muted/60 flex flex-col items-center justify-center min-h-[180px]">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="admin-excel-shipment-file-input"
                            />
                            <label htmlFor="admin-excel-shipment-file-input" className="cursor-pointer flex flex-col items-center justify-center w-full">
                                <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xl mb-2 shadow-xs">
                                    <LuUpload className="w-7 h-7" />
                                </div>
                                <span className="text-sm font-extrabold text-heading">اسحب ملف إكسل الشحنات هنا أو اضغط للاختيار</span>
                                <span className="text-xs text-body/70 mt-1">يدعم تجميع الشحنات وربط طلباتها تلقائياً (.xlsx, .csv)</span>
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-surface-muted p-3.5 rounded-2xl border border-border">
                                <div className="flex items-center gap-3">
                                    <LuTruck className="w-5 h-5 text-accent" />
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
                                    <span className="text-xs font-bold text-body block">إجمالي الشحنات المجمعة</span>
                                    <span className="text-lg font-extrabold text-heading font-latin">{parsedGroups.length}</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                    <span className="text-xs font-bold text-emerald-600 block flex items-center justify-center gap-1">
                                        <LuCircleCheck className="w-3.5 h-3.5" /> شحنات صالحة
                                    </span>
                                    <span className="text-lg font-extrabold text-emerald-600 font-latin">{validGroups.length}</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                                    <span className="text-xs font-bold text-rose-600 block flex items-center justify-center gap-1">
                                        <LuCircleAlert className="w-3.5 h-3.5" /> شحنات بها أخطاء
                                    </span>
                                    <span className="text-lg font-extrabold text-rose-600 font-latin">{invalidGroups.length}</span>
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
                        disabled={isSubmitting || isProcessing || validGroups.length === 0 || !selectedCompanyId}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[170px] justify-center"
                    >
                        {isSubmitting
                            ? "جاري الاستيراد..."
                            : validGroups.length > 0
                            ? `تأكيد وحفظ ${validGroups.length} شحنة للشركة`
                            : "اختر ملفاً وشراكة"}
                    </button>
                </div>
            </div>
        </div>
    );
}
