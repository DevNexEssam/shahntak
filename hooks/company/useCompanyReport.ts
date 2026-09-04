/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { companyReportServices } from "@/services/company/CompanyReportServices";

// Object as const pattern for Query Keys
export const COMPANY_REPORT_KEYS = {
    all: ["companyReports"] as const,
    byType: (type: string = "overview") => [...COMPANY_REPORT_KEYS.all, type] as const,
} as const;

// Fetch Company Reports Hook
export const useCompanyReports = (type: string = "overview") => {
    return useQuery({
        queryKey: COMPANY_REPORT_KEYS.byType(type),
        queryFn: () => companyReportServices.getReports(type),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: true,
    });
};
