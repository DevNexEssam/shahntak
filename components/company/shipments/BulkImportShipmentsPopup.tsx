"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { useBulkImportCompanyShipments } from "@/hooks/company/useCompanyShipment";
import {
    LuTruck,
    LuX,
    LuDownload,
    LuUpload,
    LuCircleCheck,
    LuCircleAlert,
    LuTrash2,
} from "react-icons/lu";

interface BulkImportShipmentsPopupProps {
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

export default function BulkImportShipmentsPopup({ isOpen = true, onClose }: BulkImportShipmentsPopupProps) {
    const [fileName, setFileName] = useState<string>("");
    const [parsedGroups, setParsedGroups] = useState<ParsedShipmentGroup[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutate: bulkImportShipments, isPending: isSubmitting } = useBulkImportCompanyShipments();

    if (!isOpen) return null;

    // Reset uploaded file and form
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

    // Helper: Normalize Row Keys
    const normalizeRowKeys = (row: Record<string, any>) => {
        const normalized: Record<string, any> = {};

        for (const [key, rawValue] of Object.entries(row)) {
            const cleanKey = key.trim().toLowerCase();
            const val = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : "";

            if (cleanKey.includes("نوع") || cleanKey === "type" || cleanKey.includes("shipment type")) {
                normalized.type = val || "ftl";
            } else if (cleanKey.includes("رمز") || cleanKey.includes("تجميع") || cleanKey.includes("مجموعة") || cleanKey === "shipmentcode" || cleanKey === "shipment_code" || cleanKey.includes("group code")) {
                normalized.shipmentCode = val;
            } else if (cleanKey.includes("قيام") || cleanKey.includes("مدينة القيام") || cleanKey === "origin" || cleanKey.includes("origin city")) {
                normalized.origin = val || "Riyadh";
            } else if (cleanKey.includes("وصول") || cleanKey.includes("مدينة الوصول") || cleanKey === "destination" || cleanKey.includes("destination city")) {
                normalized.destination = val || "Jeddah";
            } else if (cleanKey.includes("سعر مخصص") || cleanKey.includes("السعر المخصص") || cleanKey.includes("سعر") || cleanKey === "customprice" || cleanKey.includes("custom price")) {
                normalized.customPrice = parseFloat(val) || undefined;
            } else if (cleanKey.includes("اسم المستلم") || cleanKey.includes("اسم") || cleanKey === "recipientname" || cleanKey.includes("recipient name")) {
                normalized.recipientName = val;
            } else if (cleanKey.includes("جوال") || cleanKey.includes("هاتف") || cleanKey === "recipientphone" || cleanKey.includes("mobile phone") || cleanKey.includes("phone")) {
                normalized.recipientPhone = val;
            } else if (cleanKey.includes("عنوان") || cleanKey === "recipientaddress" || cleanKey.includes("detailed address") || cleanKey.includes("address")) {
                normalized.recipientAddress = val;
            } else if (cleanKey.includes("حي") || cleanKey === "recipientdistrict" || cleanKey.includes("district")) {
                normalized.recipientDistrict = val;
            } else if (cleanKey.includes("وزن") || cleanKey === "weight" || cleanKey.includes("weight")) {
                normalized.weight = parseFloat(val) || 0;
            } else if (cleanKey.includes("قيمة") || cleanKey === "ordervalue" || cleanKey.includes("order value")) {
                normalized.orderValue = parseFloat(val) || 0;
            } else if (cleanKey.includes("دفع") || cleanKey.includes("cod") || cleanKey === "codamount" || cleanKey.includes("cod amount")) {
                normalized.codAmount = parseFloat(val) || 0;
            } else if (cleanKey.includes("كمية") || cleanKey === "quantity" || cleanKey.includes("qty")) {
                normalized.quantity = parseInt(val, 10) || 1;
            } else if (cleanKey.includes("رقم الطلب") || cleanKey === "ordernumber" || cleanKey.includes("order number")) {
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
                    toast.error("Uploaded file is empty or invalid");
                    setIsProcessing(false);
                    return;
                }

                // Group rows by shipmentCode + origin + destination
                const groupMap = new Map<string, ParsedShipmentGroup>();

                jsonData.forEach((rawRow) => {
                    const norm = normalizeRowKeys(rawRow);
                    const rawCode = norm.shipmentCode || "";
                    const origin = norm.origin || "Riyadh";
                    const destination = norm.destination || "Jeddah";

                    // Unique grouping key per route & group code
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
                        recipientCity: norm.destination || "Jeddah",
                        recipientDistrict: norm.recipientDistrict || "",
                        recipientAddress: norm.recipientAddress || norm.destination || "",
                        weight: norm.weight || 1,
                        orderValue: norm.orderValue || 0,
                        codAmount: norm.codAmount || 0,
                        quantity: norm.quantity || 1,
                    };

                    // Basic client validation check
                    const orderErrors: string[] = [];
                    if (!orderItem.recipientName || orderItem.recipientName.length < 2) {
                        orderErrors.push("Recipient name is required");
                    }
                    if (!orderItem.recipientPhone || orderItem.recipientPhone.length < 8) {
                        orderErrors.push("Invalid mobile phone number");
                    }

                    if (orderErrors.length > 0) {
                        group.isValid = false;
                        group.errors.push(`Order ${group.orders.length + 1}: ${orderErrors.join(" - ")}`);
                    }

                    group.orders.push(orderItem);
                });

                const results = Array.from(groupMap.values());
                setParsedGroups(results);
                toast.success(`Successfully read and grouped ${results.length} shipments from file`);
            } catch (err: any) {
                toast.error("Error reading Excel file: " + err.message);
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
                "Shipment Group Code": "SHP-GROUP-1",
                "Origin City": "Riyadh",
                "Destination City": "Jeddah",
                "Shipment Type": "ftl",
                "Custom Price (Optional)": 1500,
                "Recipient Name": "Mohamed Ahmed",
                "Mobile Phone": "0501234567",
                "Detailed Address": "Takhassusi Street, Building 12",
                "Weight (kg)": 2.5,
                "Order Value": 150,
                "COD Amount": 150,
                "Custom Order Number": "ORD-0001"
            },
            {
                "Shipment Group Code": "SHP-GROUP-1",
                "Origin City": "Riyadh",
                "Destination City": "Jeddah",
                "Shipment Type": "ftl",
                "Custom Price (Optional)": 1500,
                "Recipient Name": "Khaled Mahmoud",
                "Mobile Phone": "0509876543",
                "Detailed Address": "Al-Shati District, Tower 2",
                "Weight (kg)": 4.0,
                "Order Value": 300,
                "COD Amount": 0,
                "Custom Order Number": "ORD-0002"
            },
            {
                "Shipment Group Code": "SHP-GROUP-2",
                "Origin City": "Jeddah",
                "Destination City": "Dammam",
                "Shipment Type": "ltl",
                "Custom Price (Optional)": "",
                "Recipient Name": "Sara Saeed",
                "Mobile Phone": "0541122334",
                "Detailed Address": "King Fahd Road, Complex 5",
                "Weight (kg)": 10.0,
                "Order Value": 800,
                "COD Amount": 800,
                "Custom Order Number": ""
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Shipments Template");
        XLSX.writeFile(workbook, "Shipments_Bulk_Import_Template.xlsx");
        toast.success("Sample Excel template for grouped shipments downloaded successfully");
    };

    const validGroups = parsedGroups.filter((g) => g.isValid);
    const invalidGroups = parsedGroups.filter((g) => !g.isValid);

    // Confirm Import
    const handleConfirmImport = () => {
        if (validGroups.length === 0) {
            toast.error("No valid shipments available for import");
            return;
        }

        const payload = validGroups.map((g) => ({
            origin: g.origin,
            destination: g.destination,
            type: g.type,
            customPrice: g.customPrice,
            orders: g.orders,
        }));

        bulkImportShipments(payload, {
            onSuccess: () => {
                handleCloseModal();
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
                            <LuTruck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">Bulk Import Grouped Shipments & Orders via Excel</h2>
                            <p className="text-xs text-body mt-0.5">Upload grouped shipments and link their orders automatically with one click</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleCloseModal}
                        disabled={isSubmitting}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading border border-transparent hover:border-border transition-all cursor-pointer disabled:opacity-50"
                        title="Close"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">

                    {/* Top Helper Bar: Download Template */}
                    <div className="p-4 rounded-2xl bg-accent-soft/40 border border-accent/20 flex items-center justify-between gap-4 flex-wrap">
                        <div className="space-y-0.5">
                            <h4 className="text-xs font-extrabold text-heading">Download Ready-made Excel & Shipment Template</h4>
                            <p className="text-xs text-body">You can download the formatted template, fill in your shipments and grouped orders, then re-upload it.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-accent font-bold text-xs hover:bg-accent-soft transition-all cursor-pointer shadow-xs"
                        >
                            <LuDownload className="w-4 h-4" />
                            Download Excel Shipment Template
                        </button>
                    </div>

                    {/* Upload Zone */}
                    {parsedGroups.length === 0 ? (
                        <div className="border-2 border-dashed border-border hover:border-accent rounded-3xl p-8 text-center transition-all bg-surface-muted/30 hover:bg-surface-muted/60 flex flex-col items-center justify-center min-h-[220px]">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="excel-shipment-file-input"
                            />
                            <label htmlFor="excel-shipment-file-input" className="cursor-pointer flex flex-col items-center justify-center w-full">
                                <div className="w-16 h-16 rounded-full bg-accent-soft text-accent flex items-center justify-center text-2xl mb-3 shadow-xs">
                                    <LuUpload className="w-8 h-8" />
                                </div>
                                <span className="text-sm font-extrabold text-heading">Drag & drop your Excel shipment file here, or click to browse</span>
                                <span className="text-xs text-body/70 mt-1">Supports automatic shipment grouping and order linking (.xlsx, .csv)</span>
                            </label>
                        </div>
                    ) : (
                        /* Preview Summary & Table */
                        <div className="space-y-4">
                            {/* File Info Bar */}
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
                                    Remove File & Re-upload
                                </button>
                            </div>

                            {/* Summary KPI Pills */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3.5 rounded-2xl bg-surface-muted border border-border text-center">
                                    <span className="text-xs font-bold text-body block">Total Grouped Shipments</span>
                                    <span className="text-lg font-extrabold text-heading font-latin">{parsedGroups.length}</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                    <span className="text-xs font-bold text-emerald-600 block flex items-center justify-center gap-1">
                                        <LuCircleCheck className="w-3.5 h-3.5" /> Valid Shipments
                                    </span>
                                    <span className="text-lg font-extrabold text-emerald-600 font-latin">{validGroups.length}</span>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                                    <span className="text-xs font-bold text-rose-600 block flex items-center justify-center gap-1">
                                        <LuCircleAlert className="w-3.5 h-3.5" /> Shipments with Errors
                                    </span>
                                    <span className="text-lg font-extrabold text-rose-600 font-latin">{invalidGroups.length}</span>
                                </div>
                            </div>

                            {/* Preview Table */}
                            <div className="border border-border rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-surface-muted/80 text-body font-bold sticky top-0 border-b border-border">
                                        <tr>
                                            <th className="p-3">#</th>
                                            <th className="p-3">Group Code</th>
                                            <th className="p-3">Route Line (From → To)</th>
                                            <th className="p-3">Attached Orders</th>
                                            <th className="p-3">Custom Price</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {parsedGroups.map((group, idx) => (
                                            <tr
                                                key={idx}
                                                className={group.isValid ? "hover:bg-emerald-50/30" : "bg-rose-500/5 hover:bg-rose-500/10"}
                                            >
                                                <td className="p-3 font-bold text-body font-latin">{idx + 1}</td>
                                                <td className="p-3 font-bold text-accent font-latin">{group.shipmentCode}</td>
                                                <td className="p-3 font-bold text-heading">{group.origin} → {group.destination}</td>
                                                <td className="p-3 text-body">{group.orders.length} Orders</td>
                                                <td className="p-3 text-body">{group.customPrice ? `${group.customPrice} SAR` : "Auto Calculated"}</td>
                                                <td className="p-3">
                                                    {group.isValid ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1">
                                                            <LuCircleCheck className="w-3 h-3" /> Valid
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-bold text-[11px] inline-flex items-center gap-1">
                                                            <LuCircleAlert className="w-3 h-3" /> Error
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {group.isValid ? (
                                                        <span className="text-emerald-600 text-[11px]">Ready for shipment grouping</span>
                                                    ) : (
                                                        <span className="text-rose-600 font-bold text-[11px] block max-w-[220px] truncate" title={group.errors.join(" | ")}>
                                                            {group.errors.join(" - ")}
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
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirmImport}
                        disabled={isSubmitting || isProcessing || validGroups.length === 0}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 min-w-[170px] justify-center"
                    >
                        {isSubmitting
                            ? "Importing..."
                            : validGroups.length > 0
                                ? `Confirm & Save ${validGroups.length} Shipments`
                                : "Select a File to Import"}
                    </button>
                </div>
            </div>
        </div>
    );
}

