import { Plan, PlanResponse, PlanSingleResponse, PlanDeleteResponse } from "@/types/data";
import axios from "axios";

export const planServices = {
    // Get paginated plans list with search & filtering
    getPlans: async (page: number = 1, limit: number = 10, search: string = "", cycle: string = "all"): Promise<PlanResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search && search.trim() !== "") params.append("search", search.trim());
        if (cycle && cycle !== "all") params.append("cycle", cycle);

        const { data } = await axios.get(`/api/admin/plans?${params.toString()}`);
        return data;
    },

    // Get all plans without pagination
    getAllPlans: async (): Promise<PlanResponse> => {
        const { data } = await axios.get("/api/admin/plans?nopagination=true");
        return data;
    },

    // Get single plan by ID
    getPlanById: async (id: string): Promise<PlanSingleResponse> => {
        const { data } = await axios.get(`/api/admin/plans/${id}`);
        return data;
    },

    // Create a new plan
    createPlan: async (payload: { data: Partial<Plan> }): Promise<PlanSingleResponse> => {
        const { data } = await axios.post("/api/admin/plans/new", payload.data);
        return data;
    },

    // Update plan details by ID
    updatePlan: async (payload: { id: string; updates: Partial<Plan> }): Promise<PlanSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/plans/${payload.id}`, payload.updates);
        return data;
    },

    // Delete plan by ID
    deletePlan: async ({ id, hard = false }: { id: string; hard?: boolean }): Promise<PlanDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/plans/${id}`, {
            params: { hard }
        });
        return data;
    },
};
