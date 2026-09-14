"use client"
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
    LuBuilding,
    LuMail,
    LuPhone,
    LuMapPin,
    LuFileText,
    LuSave,
    LuActivity,
    LuLock,
    LuKeyRound,
    LuEye,
    LuEyeOff,
    LuPercent,
    LuShieldAlert,
    LuHistory,
    LuCrown,
    LuCalendar,
    LuBoxes,
    LuTruck,
    LuUsers,
} from "react-icons/lu";
import { useCompanySettings, useUpdateCompanySettings } from "@/hooks/company/useCompanySettings";

interface SettingsFormInputs {
    companyName: string;
    email: string;
    phone: string;
    city: string;
    taxNumber: string;
    address: string;
    facilityInfo: string;
    vatRate: number;
    vatExemptionReason?: string;
    vatRateReason?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

export const CompanySettings: React.FC = () => {
    const { data: responseData, isLoading } = useCompanySettings();
    const updateMutation = useUpdateCompanySettings();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [selectedVatRate, setSelectedVatRate] = useState<number>(15);

    const profile = responseData?.data?.profile;
    const subscription = responseData?.data?.subscription;
    const plan = subscription?.planId;
    const auditLogs = profile?.taxRateAuditLog || [];

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { isSubmitting },
    } = useForm<SettingsFormInputs>();

    const watchedVatRate = watch("vatRate", selectedVatRate);

    useEffect(() => {
        if (profile) {
            const currentRate = profile.vatRate !== undefined ? profile.vatRate : 15;
            setSelectedVatRate(currentRate);
            reset({
                companyName: profile.companyName || "",
                email: profile.email || "",
                phone: profile.phone || "",
                city: profile.city || "",
                taxNumber: profile.taxNumber || "",
                address: profile.address || "",
                facilityInfo: profile.facilityInfo || "",
                vatRate: currentRate,
                vatExemptionReason: profile.vatExemptionReason || "Logistics transport services exempt under regulations",
                vatRateReason: "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    }, [profile, reset]);

    const onSubmit = (data: SettingsFormInputs) => {
        const payload: Record<string, any> = {
            phone: data.phone,
            city: data.city,
            address: data.address,
            facilityInfo: data.facilityInfo,
        };

        const targetRate = Number(data.vatRate);
        const originalRate = profile?.vatRate !== undefined ? profile.vatRate : 15;

        // Check if rate changed
        if (targetRate !== originalRate) {
            if (!data.vatRateReason || data.vatRateReason.trim().length < 3) {
                toast.error("Tax Integrity Notice: A reason for modifying the tax rate must be provided for audit history.");
                return;
            }
            payload.vatRate = targetRate;
            payload.vatRateReason = data.vatRateReason.trim();

            if (targetRate === 0) {
                if (!data.vatExemptionReason || data.vatExemptionReason.trim().length < 3) {
                    toast.error("Please enter an official tax exemption reason when enabling a 0% rate.");
                    return;
                }
                payload.vatExemptionReason = data.vatExemptionReason.trim();
            }
        }

        if (data.currentPassword || data.newPassword || data.confirmPassword) {
            if (!data.currentPassword) {
                toast.error("Please enter your current password to complete the change.");
                return;
            }
            if (!data.newPassword) {
                toast.error("Please enter the new password.");
                return;
            }
            if (data.newPassword.length < 6) {
                toast.error("New password must be at least 6 characters.");
                return;
            }
            if (data.newPassword !== data.confirmPassword) {
                toast.error("New password and confirmation password do not match.");
                return;
            }

            payload.currentPassword = data.currentPassword;
            payload.newPassword = data.newPassword;
        }

        updateMutation.mutate(
            { updates: payload },
            {
                onSuccess: () => {
                    setValue("currentPassword", "");
                    setValue("newPassword", "");
                    setValue("confirmPassword", "");
                    setValue("vatRateReason", "");
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <LuActivity className="w-8 h-8 animate-spin text-accent" />
                <span className="ml-3 font-medium">Loading company settings and account...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-left">
            {/* Header section */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Company Details & Security Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage profile details, operational data, and password for your logistics facility.
                </p>
            </div>

            {/* Subscription & Active Plan Section */}
            <div id="subscription" className="p-6 bg-surface border border-border rounded-md space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                        <LuCrown className="w-5 h-5 text-accent" />
                        <span>Subscription & Active Plan Details</span>
                    </div>
                    {subscription && (
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
                            subscription.status === 'active' 
                                ? 'bg-accent-soft text-accent border-accent/20' 
                                : subscription.status === 'expired' 
                                ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' 
                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                            {subscription.status === 'active' ? 'Active Subscription' : subscription.status === 'expired' ? 'Expired Subscription' : 'Pending Payment'}
                        </span>
                    )}
                </div>

                {subscription && plan ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-md bg-surface-muted/50 border border-border">
                                <span className="text-xs text-muted-foreground block mb-1">Approved Plan Name</span>
                                <span className="text-base font-bold text-foreground flex items-center gap-1.5">
                                    <LuCrown className="w-4 h-4 text-accent" />
                                    {plan.name}
                                </span>
                            </div>
                            <div className="p-4 rounded-md bg-surface-muted/50 border border-border">
                                <span className="text-xs text-muted-foreground block mb-1">Subscription Fee</span>
                                <span className="text-base font-bold text-foreground">
                                    {plan.price ? `${plan.price} SAR / ${plan.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}` : 'Free / Custom'}
                                </span>
                            </div>
                            <div className="p-4 rounded-md bg-surface-muted/50 border border-border">
                                <span className="text-xs text-muted-foreground block mb-1">Expiration Date</span>
                                <span className="text-sm font-bold text-foreground flex items-center gap-1">
                                    <LuCalendar className="w-4 h-4 text-accent" />
                                    {new Date(subscription.endDate).toLocaleDateString('en-US')}
                                </span>
                            </div>
                            <div className="p-4 rounded-md bg-surface-muted/50 border border-border">
                                <span className="text-xs text-muted-foreground block mb-1">Auto-Renewal</span>
                                <span className="text-sm font-bold text-foreground">
                                    {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>

                        {/* Quota Usage Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            {/* Orders Usage */}
                            <div className="p-4 rounded-md border border-border bg-surface space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <LuBoxes className="w-4 h-4 text-accent" /> Monthly Orders Limit
                                    </span>
                                    <span className="text-foreground font-bold">
                                        {subscription.ordersUsedThisMonth || 0} / {plan.maxOrdersPerMonth === -1 ? 'Unlimited' : plan.maxOrdersPerMonth}
                                    </span>
                                </div>
                                {plan.maxOrdersPerMonth > 0 && (
                                    <div className="w-full bg-border/40 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="bg-accent h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${Math.min(100, Math.round(((subscription.ordersUsedThisMonth || 0) / plan.maxOrdersPerMonth) * 100))}%` }} 
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Shipments Usage */}
                            <div className="p-4 rounded-md border border-border bg-surface space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <LuTruck className="w-4 h-4 text-accent" /> Monthly Shipments Limit
                                    </span>
                                    <span className="text-foreground font-bold">
                                        {subscription.shipmentsUsedThisMonth || 0} / {plan.maxShipmentsPerMonth === -1 ? 'Unlimited' : plan.maxShipmentsPerMonth}
                                    </span>
                                </div>
                                {plan.maxShipmentsPerMonth > 0 && (
                                    <div className="w-full bg-border/40 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="bg-accent h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${Math.min(100, Math.round(((subscription.shipmentsUsedThisMonth || 0) / plan.maxShipmentsPerMonth) * 100))}%` }} 
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Users Limit */}
                            <div className="p-4 rounded-md border border-border bg-surface space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <LuUsers className="w-4 h-4 text-accent" /> Workforce & Team Limit
                                    </span>
                                    <span className="text-foreground font-bold">
                                        Allowed {plan.maxCompanyUsers} employees
                                    </span>
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                    Employees can access based on assigned permissions
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 flex items-center justify-between">
                        <span>No active subscription currently registered for this company account. Please contact support or administration to configure your plan.</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                {/* Main Profile Form */}
                <div className="p-6 bg-surface border border-border rounded-md space-y-6">
                    <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border pb-4">
                        <LuBuilding className="w-5 h-5 text-accent" />
                        <span>Company Information & Profile</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company Name (Locked) */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center justify-between">
                                <span>Official Company Name</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <LuLock className="w-3 h-3 text-accent" /> Verified
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register("companyName")}
                                    disabled
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-border/20 text-muted-foreground cursor-not-allowed pl-9"
                                />
                                <LuBuilding className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                            </div>
                        </div>

                        {/* Email (Locked) */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center justify-between">
                                <span>Account Email</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <LuLock className="w-3 h-3 text-accent" /> Verified
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    {...register("email")}
                                    disabled
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-border/20 text-muted-foreground cursor-not-allowed pl-9"
                                />
                                <LuMail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                            </div>
                        </div>

                        {/* Tax Number (Locked) */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1 flex items-center justify-between">
                                <span>Tax Number (VAT)</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <LuLock className="w-3 h-3 text-accent" /> Verified
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register("taxNumber")}
                                    disabled
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-border/20 text-muted-foreground cursor-not-allowed pl-9"
                                />
                                <LuFileText className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                            </div>
                        </div>

                        {/* Phone (Editable) */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                Phone / Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register("phone", { required: true })}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent pl-9"
                                />
                                <LuPhone className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                            </div>
                        </div>

                        {/* City (Editable) */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                Main City <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register("city", { required: true })}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent pl-9"
                                />
                                <LuMapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                            </div>
                        </div>

                        {/* Address (Editable) */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                Detailed Headquarters Address
                            </label>
                            <input
                                type="text"
                                {...register("address")}
                                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent"
                            />
                        </div>
                    </div>

                    {/* Facility Info (Editable) */}
                    <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Commercial Register / Facility Description
                        </label>
                        <textarea
                            rows={3}
                            {...register("facilityInfo")}
                            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent"
                        />
                    </div>
                </div>

                {/* VAT &  Governance Section */}
                <div className="p-6 bg-surface border border-border rounded-md space-y-6">
                    <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border pb-4">
                        <LuPercent className="w-5 h-5 text-accent" />
                        <span>Value Added Tax (VAT) Settings</span>
                    </div>

                    <div className="p-4 rounded-md bg-accent-soft/30 border border-accent/20 text-xs text-foreground space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-accent">
                            <LuShieldAlert className="w-4 h-4" />
                            <span>Security Notice & Tax Protection Warning:</span>
                        </div>
                        <p className="leading-relaxed">
                            Modifying the company&apos;s operational tax rate applies **exclusively to new future invoices**. Previously issued and paid invoices retain their historical printed rates and amounts without being affected.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* VAT Rate Selection */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                Approved Operational VAT Rate <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("vatRate", { valueAsNumber: true })}
                                onChange={(e) => setSelectedVatRate(Number(e.target.value))}
                                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent cursor-pointer"
                            >
                                <option value={15}>15% - Standard Base Rate (Saudi Arabia)</option>
                                <option value={0}>0% - Tax Exempt / Zero Rate</option>
                            </select>
                        </div>

                        {/* Exemption Reason (Shows when rate is 0%) */}
                        {Number(watchedVatRate) === 0 && (
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    Official Tax Exemption Reason <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("vatExemptionReason")}
                                    placeholder="e.g. Export of logistics services, exempt facility..."
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent"
                                />
                            </div>
                        )}
                    </div>

                    {/* Tax Rate Change Reason (Shows when changing rate) */}
                    {Number(watchedVatRate) !== (profile?.vatRate !== undefined ? profile.vatRate : 15) && (
                        <div className="p-4 rounded-md border border-rose-500/30 bg-rose-500/5 space-y-2">
                            <label className="block text-xs font-bold text-rose-600 flex items-center gap-1.5">
                                <LuShieldAlert className="w-4 h-4" />
                                Reason for Modifying Tax Rate <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("vatRateReason")}
                                placeholder="Enter reason for changing company tax rate (e.g. issuance of tax registration or exemption certificate)..."
                                className="w-full px-3 py-2 text-sm rounded-md border border-rose-500/40 bg-surface text-foreground focus:outline-none focus:border-rose-500"
                            />
                        </div>
                    )}

                    {/* Audit Log Table */}
                    {auditLogs.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground border-t border-border pt-4">
                                <LuHistory className="w-4 h-4 text-accent" />
                                <span>Tax Rate Audit Log</span>
                            </div>

                            <div className="overflow-x-auto border border-border rounded-md">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-surface-muted text-muted-foreground font-semibold border-b border-border">
                                        <tr>
                                            <th className="p-2.5">Modification Date</th>
                                            <th className="p-2.5">New Rate</th>
                                            <th className="p-2.5">Reason for Change</th>
                                            <th className="p-2.5">Executed By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border text-foreground">
                                        {auditLogs.map((log: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-surface-muted/50">
                                                <td className="p-2.5">{new Date(log.changedAt).toLocaleString('en-US')}</td>
                                                <td className="p-2.5 font-bold text-accent">{log.rate}%</td>
                                                <td className="p-2.5">{log.reason}</td>
                                                <td className="p-2.5 text-muted-foreground">{log.changedByName || 'Company Owner'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Change Section */}
                <div className="p-6 bg-surface border border-border rounded-md space-y-6">
                    <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border pb-4">
                        <LuKeyRound className="w-5 h-5 text-accent" />
                        <span>Account Security & Password Change</span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Leave password fields blank if you do not wish to change the current account password.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Current Password */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    {...register("currentPassword")}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent pr-9"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    {showCurrentPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    {...register("newPassword")}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent pr-9"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    {showNewPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                {...register("confirmPassword")}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-foreground focus:outline-none focus:border-accent"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || updateMutation.isPending}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <LuSave className="w-4 h-4" />
                        <span>{updateMutation.isPending ? "Saving..." : "Save Changes & Security"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

