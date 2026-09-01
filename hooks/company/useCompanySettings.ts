/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { companySettingsServices } from "@/services/company/CompanySettingsServices";

// Object as const pattern for Query Keys
export const COMPANY_SETTINGS_KEYS = {
    all: ["companySettings"] as const,
    profile: () => [...COMPANY_SETTINGS_KEYS.all, "profile"] as const,
} as const;

// Fetch Company Settings / Profile Hook
export const useCompanySettings = () => {
    return useQuery({
        queryKey: COMPANY_SETTINGS_KEYS.profile(),
        queryFn: () => companySettingsServices.getSettings(),
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 15,
        refetchOnWindowFocus: false,
    });
};

// Update Company Settings Mutation
export const useUpdateCompanySettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: companySettingsServices.updateSettings,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || "تم تحديث إعدادات الشركة بنجاح");
                queryClient.invalidateQueries({ queryKey: COMPANY_SETTINGS_KEYS.profile() });
            } else {
                toast.error(response.message || "حدث خطأ أثناء التحديث");
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || "حدث خطأ غير متوقع";
            toast.error(message);
        },
    });
};
