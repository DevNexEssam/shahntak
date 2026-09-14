"use client";

import React, { useState, useEffect } from "react";
import { CompanyUser } from "@/types/data";
import { useUpdateCompanyUserRoleAndPermissions } from "@/hooks/companyUsers/useCompanyUsers";
import { LuShieldCheck, LuX, LuPlus, LuCheck, LuRefreshCw } from "react-icons/lu";

interface EditPermissionsModalProps {
    isOpen?: boolean;
    user: CompanyUser | null;
    onClose: () => void;
}

const COMMON_PERMISSIONS = [
    { key: "orders.create", label: "Create Orders" },
    { key: "orders.read", label: "View Orders" },
    { key: "orders.update", label: "Edit Orders" },
    { key: "orders.delete", label: "Delete Orders" },
    { key: "shipments.read", label: "Track & Monitor Shipments" },
    { key: "shipments.update", label: "Update Shipment Statuses" },
    { key: "invoices.read", label: "View Logistics Invoices" },
    { key: "reports.read", label: "View Reports & Analytics" },
    { key: "company.read", label: "View Company Data" },
];

export default function EditPermissionsModal({
    isOpen = true,
    user,
    onClose,
}: EditPermissionsModalProps) {
    const [selectedRole, setSelectedRole] = useState<CompanyUser["userRole"]>("staff");
    const [permissionsList, setPermissionsList] = useState<string[]>([]);
    const [customPermInput, setCustomPermInput] = useState("");

    const { mutate: updatePermissions, isPending } = useUpdateCompanyUserRoleAndPermissions();

    useEffect(() => {
        if (user) {
            setSelectedRole(user.userRole || "staff");
            setPermissionsList(user.permissions || []);
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const togglePermission = (permKey: string) => {
        if (permissionsList.includes(permKey)) {
            setPermissionsList(permissionsList.filter((p) => p !== permKey));
        } else {
            setPermissionsList([...permissionsList, permKey]);
        }
    };

    const handleAddCustomPermission = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = customPermInput.trim();
        if (trimmed && !permissionsList.includes(trimmed)) {
            setPermissionsList([...permissionsList, trimmed]);
            setCustomPermInput("");
        }
    };

    const handleRemovePermission = (permKey: string) => {
        setPermissionsList(permissionsList.filter((p) => p !== permKey));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updatePermissions(
            {
                id: user._id,
                userRole: selectedRole,
                permissions: permissionsList,
            },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200"
            dir="ltr"
        >
            <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
                            <LuShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-heading">Edit Role & Permissions</h2>
                            <p className="text-xs text-body mt-0.5">
                                Assign a custom role and permissions to employee <b className="text-heading">{user.userName}</b>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-surface-muted text-body hover:text-heading transition-all cursor-pointer"
                        title="Close"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm text-left flex-1">

                    {/* Role Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-heading block">Employee Role in the Organization:</label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {[
                                { id: "owner", title: "Owner", desc: "Full permissions" },
                                { id: "manager", title: "Operations Manager", desc: "Operations management" },
                                { id: "staff", title: "Staff", desc: "Basic permissions" },
                            ].map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setSelectedRole(role.id as CompanyUser["userRole"])}
                                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${selectedRole === role.id
                                            ? "border-accent bg-accent/10 text-accent shadow-xs"
                                            : "border-border bg-surface-muted text-body hover:text-heading"
                                        }`}
                                >
                                    <span className="text-xs font-extrabold block">{role.title}</span>
                                    <span className="text-[10px] font-medium opacity-80">{role.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Checkbox Grid for Common Permissions */}
                    <div className="space-y-2.5">
                        <label className="text-xs font-bold text-heading block">Available Common Permissions:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {COMMON_PERMISSIONS.map((perm) => {
                                const isChecked = permissionsList.includes(perm.key);
                                return (
                                    <button
                                        key={perm.key}
                                        type="button"
                                        onClick={() => togglePermission(perm.key)}
                                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${isChecked
                                                ? "bg-accent/10 border-accent/40 text-accent"
                                                : "bg-surface-muted border-border text-body hover:text-heading"
                                            }`}
                                    >
                                        <span>{perm.label}</span>
                                        <div
                                            className={`w-4 h-4 rounded-md flex items-center justify-center border ${isChecked
                                                    ? "bg-accent border-accent text-white"
                                                    : "border-border bg-surface"
                                                }`}
                                        >
                                            {isChecked && <LuCheck className="w-3 h-3" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom Permission Add Input */}
                    <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold text-heading block">Add Custom Permission by Key:</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={customPermInput}
                                onChange={(e) => setCustomPermInput(e.target.value)}
                                placeholder="e.g., custom.export_data"
                                className="flex-1 px-4 py-2 rounded-xl bg-surface-muted border border-border text-xs text-heading placeholder:text-body/50 focus:outline-none focus:border-accent"
                            />
                            <button
                                type="button"
                                onClick={handleAddCustomPermission}
                                className="px-4 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1 shrink-0"
                            >
                                <LuPlus className="w-4 h-4" />
                                <span>Add</span>
                            </button>
                        </div>
                    </div>

                    {/* Currently Active Permissions List */}
                    <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold text-heading block">
                            Currently Selected Permissions ({permissionsList.length}):
                        </label>
                        {permissionsList.length > 0 ? (
                            <div className="flex flex-wrap gap-2 p-3 bg-surface-muted/60 rounded-2xl border border-border max-h-32 overflow-y-auto">
                                {permissionsList.map((perm) => (
                                    <span
                                        key={perm}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface border border-border text-xs font-bold text-heading shadow-xs"
                                    >
                                        <span>{perm}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePermission(perm)}
                                            className="text-body hover:text-rose-600 transition-colors cursor-pointer"
                                            title="Remove permission"
                                        >
                                            <LuX className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-body italic bg-surface-muted/40 p-3 rounded-2xl border border-border">
                                No custom permissions selected (default role-based permissions will apply).
                            </p>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-border flex items-center justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-body font-bold text-xs transition-all cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                        >
                            {isPending ? (
                                <>
                                    <LuRefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save Permissions & Role</span>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}