import { useQuery } from "@tanstack/react-query";
import { adminDashboardServices } from "@/services/admin/adminDashboardServices";

// Query keys
export const adminDashboardKeys = {
    all: ["adminDashboard"] as const,
    kpis: () => [...adminDashboardKeys.all, "kpis"] as const,
    topCompanies: () => [...adminDashboardKeys.all, "topCompanies"] as const,
    alerts: () => [...adminDashboardKeys.all, "alerts"] as const,
};

// Queries
export const useAdminKPIs = () => {
    return useQuery({
        queryKey: adminDashboardKeys.kpis(),
        queryFn: adminDashboardServices.getKPIs,
        staleTime: 1000 * 60 * 2,
    });
};

export const useAdminTopCompanies = () => {
    return useQuery({
        queryKey: adminDashboardKeys.topCompanies(),
        queryFn: adminDashboardServices.getTopCompanies,
        staleTime: 1000 * 60 * 3,
    });
};

export const useAdminUrgentAlerts = () => {
    return useQuery({
        queryKey: adminDashboardKeys.alerts(),
        queryFn: adminDashboardServices.getUrgentAlerts,
        staleTime: 1000 * 60 * 5,
    });
};
