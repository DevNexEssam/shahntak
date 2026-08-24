"use client";

import React, { useState, useMemo } from "react";
import Loading from "@/components/ui/loading";
import EmptyData from "@/components/ui/EmptyData";
import ConfirmDeletePopup from "@/components/ui/ConfirmDeletePopup";
import AddCompanies from "./AddCompanies";
import EditCompanies from "./EditCompanies";
import DetailsCompanies from "./DetailsCompanies";
import { Company } from "@/types/data";
import {
    useCompanies,
    useDeleteCompany,
    useApproveCompany,
    useUpdateCompanyStatus
} from "@/hooks/companies/useCompanies";
import {
    LuBuilding2,
    LuPlus,
    LuSearch,
    LuFilter,
    LuLayoutGrid,
    LuTable,
    LuPencil,
    LuTrash2,
    LuInfo,
    LuRefreshCw,
    LuShieldCheck,
    LuMapPin,
    LuMail,
    LuPhone,
    LuChevronRight,
    LuChevronLeft
} from "react-icons/lu";
import { FaCircle } from "react-icons/fa6";

export default function Companies() {
    // 1. Pagination & Search/Filter states
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const limit = 9;

    // 2. Modals & Selection states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [companyToDeleteId, setCompanyToDeleteId] = useState<string | null>(null);

    // 3. Custom Hooks
    const { data: companiesRes, isLoading, isError, error, refetch, isFetching } = useCompanies(page, limit);
    const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany();
    const { mutate: approveCompany, isPending: isApproving } = useApproveCompany();
    const { mutate: updateCompanyStatus } = useUpdateCompanyStatus();

    // 4. Handlers for search/filter resetting page to 1
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleFilterStatusChange = (status: string) => {
        setFilterStatus(status);
        setPage(1);
    };

    // 5. Client-side filtered list
    const filteredCompanies = useMemo(() => {
        if (!companiesRes?.data) return [];
        return companiesRes.data.filter((comp) => {
            const matchesSearch =
                comp.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                comp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                comp.phone.includes(searchQuery) ||
                (comp.city && comp.city.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = filterStatus === "all" || comp.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [companiesRes?.data, searchQuery, filterStatus]);

    const totalPages = Math.ceil((companiesRes?.total || filteredCompanies.length || 1) / limit);

    const getStatusBadge = (status: Company["status"]) => {
        switch (status) {
            case "active":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <FaCircle className="w-1.5 h-1.5 text-emerald-500 animate-pulse" />
                        نشط
                    </span>
                );
            case "inactive":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        غير نشط
                    </span>
                );
            case "archived":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        مؤرشف
                    </span>
                );
            case "banned":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        محظور
                    </span>
                );
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    // Initial Loading State
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loading />
            </div>
        );
    }

    return (
        <section className="space-y-6 text-right" dir="rtl">
            {/* Error Banner if any */}
            {isError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-semibold">
                    حدث خطأ أثناء جلب قائمة الشركات: {(error as Error)?.message || "خطأ في الشبكة"}
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                        <LuBuilding2 className="w-7 h-7 text-amber-600" />
                        إدارة الشركات المسجلة (Tenants)
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        متابعة حسابات شركات الشحن، تفاصيل الاعتماد، والسجلات المحدثة.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Refresh Button */}
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50"
                        title="تحديث البيانات"
                    >
                        <LuRefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-amber-600" : ""}`} />
                    </button>

                    {/* View Toggle */}
                    <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                                viewMode === "grid" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"
                            }`}
                            title="عرض البطاقات"
                        >
                            <LuLayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                                viewMode === "table" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"
                            }`}
                            title="عرض الجدول المدمج"
                        >
                            <LuTable className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Add Company Button */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>تسجيل شركة شحن</span>
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
                <div className="relative w-full md:w-96">
                    <LuSearch className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="بحث باسم الشركة، البريد، الهاتف، أو المدينة..."
                        className="w-full pr-10 pl-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-500"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                    <LuFilter className="w-4 h-4 text-gray-400 shrink-0" />
                    <button
                        onClick={() => handleFilterStatusChange("all")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            filterStatus === "all" ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        الكل ({companiesRes?.total || 0})
                    </button>
                    <button
                        onClick={() => handleFilterStatusChange("active")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            filterStatus === "active" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        النشطة
                    </button>
                    <button
                        onClick={() => handleFilterStatusChange("inactive")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            filterStatus === "inactive" ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        غير النشطة
                    </button>
                    <button
                        onClick={() => handleFilterStatusChange("banned")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            filterStatus === "banned" ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        المحظورة
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {filteredCompanies.length === 0 ? (
                <div className="p-12 bg-white border border-gray-200 rounded-2xl text-center">
                    <EmptyData message="لا يوجد شركات مسجلة مطابقة لخيارات البحث والحالة" />
                </div>
            ) : (
                <>
                    {/* VIEW 1: Grid Cards */}
                    {viewMode === "grid" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredCompanies.map((comp) => (
                                <div
                                    key={comp._id}
                                    className="bg-white rounded-2xl border border-gray-200 hover:border-amber-400/60 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                                >
                                    <div className="p-5 space-y-4">

                                        {/* Logo & Basic Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-extrabold text-lg flex items-center justify-center shrink-0 border border-amber-100">
                                                    {comp.companyName ? comp.companyName.charAt(0) : "C"}
                                                </div>
                                                <div>
                                                    <h3 className="font-extrabold text-base text-gray-900 leading-tight">
                                                        {comp.companyName}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <LuMapPin className="w-3 h-3 text-gray-400" />
                                                        {comp.city || "غير محدد"}
                                                    </span>
                                                </div>
                                            </div>

                                            {getStatusBadge(comp.status)}
                                        </div>

                                        {/* Contact Details */}
                                        <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                                            <div className="flex items-center justify-between text-gray-600">
                                                <span className="flex items-center gap-1.5 text-gray-500">
                                                    <LuMail className="w-3.5 h-3.5 text-gray-400" />
                                                    البريد:
                                                </span>
                                                <span className="font-mono font-bold text-gray-800 dir-ltr">{comp.email}</span>
                                            </div>

                                            <div className="flex items-center justify-between text-gray-600">
                                                <span className="flex items-center gap-1.5 text-gray-500">
                                                    <LuPhone className="w-3.5 h-3.5 text-gray-400" />
                                                    الهاتف:
                                                </span>
                                                <span className="font-mono font-bold text-gray-800 dir-ltr">{comp.phone}</span>
                                            </div>

                                            {comp.taxNumber && (
                                                <div className="flex items-center justify-between text-gray-600">
                                                    <span className="text-gray-500">الرقم الضريبي:</span>
                                                    <span className="font-mono text-gray-800">{comp.taxNumber}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Approval Status Card */}
                                        <div className="pt-2">
                                            {comp.approvedBy ? (
                                                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                    <LuShieldCheck className="w-4 h-4" />
                                                    <span>معتمدة من الإدارة</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => approveCompany({ id: comp._id, approvedBy: "SuperAdmin" })}
                                                    disabled={isApproving}
                                                    className="w-full py-1.5 px-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <LuShieldCheck className="w-4 h-4" />
                                                    <span>اعتماد الشركة الآن</span>
                                                </button>
                                            )}
                                        </div>

                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedCompany(comp);
                                                setIsDetailsModalOpen(true);
                                            }}
                                            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                                            title="التفاصيل"
                                        >
                                            <LuInfo className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setSelectedCompany(comp);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 text-blue-600 transition-colors"
                                            title="تعديل"
                                        >
                                            <LuPencil className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => setCompanyToDeleteId(comp._id)}
                                            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-rose-50 text-rose-600 transition-colors"
                                            title="حذف"
                                        >
                                            <LuTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* VIEW 2: Table View */}
                    {viewMode === "table" && (
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-bold">
                                        <tr>
                                            <th className="py-3.5 px-5">اسم الشركة والمقر</th>
                                            <th className="py-3.5 px-4">بيانات الاتصال</th>
                                            <th className="py-3.5 px-4">الرقم الضريبي</th>
                                            <th className="py-3.5 px-4">الحالة</th>
                                            <th className="py-3.5 px-4">الاعتماد</th>
                                            <th className="py-3.5 px-5 text-center">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredCompanies.map((comp) => (
                                            <tr key={comp._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center shrink-0 border border-amber-100">
                                                            {comp.companyName ? comp.companyName.charAt(0) : "C"}
                                                        </div>
                                                        <div>
                                                            <b className="text-gray-900 block font-extrabold">{comp.companyName}</b>
                                                            <span className="text-xs text-gray-500">{comp.city || "غير محدد"}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-xs font-mono">
                                                    <span className="block text-gray-800">{comp.email}</span>
                                                    <span className="text-gray-500">{comp.phone}</span>
                                                </td>
                                                <td className="py-4 px-4 text-xs font-mono text-gray-700">
                                                    {comp.taxNumber || "—"}
                                                </td>
                                                <td className="py-4 px-4">
                                                    {getStatusBadge(comp.status)}
                                                </td>
                                                <td className="py-4 px-4">
                                                    {comp.approvedBy ? (
                                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                                            معتمدة
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => approveCompany({ id: comp._id, approvedBy: "SuperAdmin" })}
                                                            disabled={isApproving}
                                                            className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 transition-colors"
                                                        >
                                                            اعتماد
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="py-4 px-5 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCompany(comp);
                                                                setIsDetailsModalOpen(true);
                                                            }}
                                                            title="التفاصيل"
                                                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        >
                                                            <LuInfo size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCompany(comp);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            title="تعديل"
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <LuPencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setCompanyToDeleteId(comp._id)}
                                                            title="حذف"
                                                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        >
                                                            <LuTrash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-xs font-semibold">
                            <span className="text-gray-500">
                                عرض الصفحة {page} من أصل {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                    disabled={page === 1}
                                    className="p-2 border rounded-xl hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1"
                                >
                                    <LuChevronRight className="w-4 h-4" />
                                    <span>السابقة</span>
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={page >= totalPages}
                                    className="p-2 border rounded-xl hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1"
                                >
                                    <span>التالية</span>
                                    <LuChevronLeft className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <AddCompanies
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <EditCompanies
                isOpen={isEditModalOpen}
                company={selectedCompany}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCompany(null);
                }}
            />

            <DetailsCompanies
                isOpen={isDetailsModalOpen}
                company={selectedCompany}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedCompany(null);
                }}
            />

            {/* Confirm Delete Modal */}
            <ConfirmDeletePopup
                isOpen={!!companyToDeleteId}
                onClose={() => setCompanyToDeleteId(null)}
                onConfirm={() => {
                    if (companyToDeleteId) {
                        deleteCompany(
                            { id: companyToDeleteId },
                            {
                                onSuccess: () => setCompanyToDeleteId(null),
                            }
                        );
                    }
                }}
                isDeleting={isDeleting}
                title="تأكيد حذف الشركة"
                description="هل أنت أصلًا متأكد من حذف هذه الشركة؟ سيؤدي هذا الإجراء لإخفاء بيانات الشركة مؤقتاً بالمنظومة (Soft Delete)."
            />
        </section>
    );
}