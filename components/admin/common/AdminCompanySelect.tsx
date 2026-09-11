/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useAllCompanies } from "@/hooks/companies/useCompanies";
import { LuBuilding2 } from "react-icons/lu";

interface AdminCompanySelectProps {
    value: string;
    onChange: (companyId: string, companyObj?: any) => void;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    placeholder?: string;
    showLabel?: boolean;
}

export default function AdminCompanySelect({
    value,
    onChange,
    label = "الشركة المستهدفة",
    required = true,
    disabled = false,
    error,
    placeholder = "-- اختر الشركة المستهدفة --",
    showLabel = true,
}: AdminCompanySelectProps) {
    const { data: companiesRes, isLoading } = useAllCompanies();
    const companies = companiesRes?.data || [];

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedComp = companies.find((c: any) => c._id === selectedId);
        onChange(selectedId, selectedComp);
    };

    return (
        <div className="space-y-1.5 w-full">
            {showLabel && (
                <label className="block text-xs font-bold text-heading">
                    {label} {required && <span className="text-error">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    value={value}
                    onChange={handleChange}
                    disabled={disabled || isLoading}
                    className={`w-full bg-surface border rounded-xl py-2.5 px-3.5 pr-10 text-xs font-semibold text-heading focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                        error ? "border-error focus:ring-error" : "border-border"
                    } ${disabled ? "opacity-60 cursor-not-allowed bg-surface-muted" : ""}`}
                >
                    <option value="">{isLoading ? "جاري تحميل قائمة الشركات..." : placeholder}</option>
                    {companies.map((company: any) => (
                        <option key={company._id} value={company._id}>
                            {company.companyName} {company.city ? `(${company.city})` : ""} {company.taxNumber ? `- ضريبي: ${company.taxNumber}` : ""}
                        </option>
                    ))}
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-body/60 pointer-events-none">
                    <LuBuilding2 className="w-4 h-4" />
                </span>
            </div>
            {error && <span className="text-[11px] text-error font-semibold block">{error}</span>}
        </div>
    );
}
