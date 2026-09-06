/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { companyAnalyticsServices } from "@/services/company/CompanyAnalyticsServices";

export const COMPANY_ANALYTICS_KEYS = {
    all: ["companyAnalytics"] as const,
    tab: (tab: string, startDate: string, endDate: string) =>
        [...COMPANY_ANALYTICS_KEYS.all, tab, { startDate, endDate }] as const,
} as const;

export const useCompanyAnalyticsTab = (
    tab: string,
    startDate: string = "",
    endDate: string = "",
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: COMPANY_ANALYTICS_KEYS.tab(tab, startDate, endDate),
        queryFn: () => companyAnalyticsServices.getAnalyticsTab(tab, startDate, endDate),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: true,
        placeholderData: keepPreviousData,
        enabled,
    });
};
