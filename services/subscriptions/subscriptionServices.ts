import { Subscription, SubscriptionResponse, SubscriptionSingleResponse, SubscriptionDeleteResponse, CompanySubscriptionQuotaResponse } from "@/types/data";
import axios from "axios";

export const subscriptionServices = {
    // Get paginated subscriptions list with search & filtering
    getSubscriptions: async (page: number = 1, limit: number = 10, search: string = "", status: string = "all", companyId: string = ""): Promise<SubscriptionResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search && search.trim() !== "") params.append("search", search.trim());
        if (status && status !== "all") params.append("status", status);
        if (companyId) params.append("companyId", companyId);

        const { data } = await axios.get(`/api/admin/subscriptions?${params.toString()}`);
        return data;
    },

    // Get all subscriptions without pagination
    getAllSubscriptions: async (): Promise<SubscriptionResponse> => {
        const { data } = await axios.get("/api/admin/subscriptions?nopagination=true");
        return data;
    },

    // Get single subscription by ID
    getSubscriptionById: async (id: string): Promise<SubscriptionSingleResponse> => {
        const { data } = await axios.get(`/api/admin/subscriptions/${id}`);
        return data;
    },

    // Get active subscription by company ID
    getCompanySubscription: async (companyId: string): Promise<CompanySubscriptionQuotaResponse> => {
        const { data } = await axios.get(`/api/admin/subscriptions/company/${companyId}`);
        return data;
    },


    // Create a new subscription for a company
    createSubscription: async (payload: { data: Partial<Subscription> }): Promise<SubscriptionSingleResponse> => {
        const { data } = await axios.post("/api/admin/subscriptions/new", payload.data);
        return data;
    },

    // Update subscription details by ID (Renew/Upgrade)
    updateSubscription: async (payload: { id: string; updates: Partial<Subscription> }): Promise<SubscriptionSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/subscriptions/${payload.id}`, payload.updates);
        return data;
    },

    // Delete subscription by ID
    deleteSubscription: async ({ id, hard = false }: { id: string; hard?: boolean }): Promise<SubscriptionDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/subscriptions/${id}`, {
            params: { hard }
        });
        return data;
    },
};
