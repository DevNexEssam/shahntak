/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { companyReportServices } from "@/services/company/CompanyReportServices";

// Object as const pattern for Query Keys
export const COMPANY_REPORT_KEYS = {
    all: ["companyReports"] as const,
    summary: () => [...COMPANY_REPORT_KEYS.all, "summary"] as const,
} as const;

// Fetch Company Reports Summary Hook
export const useCompanyReports = () => {
    return useQuery({
        queryKey: COMPANY_REPORT_KEYS.summary(),
        queryFn: () => companyReportServices.getReports(),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: true,
    });
};
