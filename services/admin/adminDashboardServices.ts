import axios from "axios";
import { AdminKPIsResponse, AdminTopCompaniesResponse, AdminAlertsResponse } from "@/types/data";

export const adminDashboardServices = {
    // get core KPIs
    getKPIs: async (): Promise<AdminKPIsResponse> => {
        const { data } = await axios.get("/api/admin/dashboard/stats?section=kpis");
        return data;
    },

    // get top active companies
    getTopCompanies: async (): Promise<AdminTopCompaniesResponse> => {
        const { data } = await axios.get("/api/admin/dashboard/stats?section=top-companies");
        return data;
    },

    // get urgent platform alerts
    getUrgentAlerts: async (): Promise<AdminAlertsResponse> => {
        const { data } = await axios.get("/api/admin/dashboard/stats?section=alerts");
        return data;
    },
};
