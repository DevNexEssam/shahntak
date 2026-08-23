import { Route, RouteResponse, RouteSingleResponse, RouteDeleteResponse } from "@/types/data";
import axios from "axios";

export const routeServices = {
    // Get paginated logistics routes list
    getRoutes: async (page: number = 1, limit: number = 10): Promise<RouteResponse> => {
        const { data } = await axios.get(`/api/admin/routes?page=${page}&limit=${limit}`);
        return data;
    },

    // Get all routes without pagination
    getAllRoutes: async (): Promise<RouteResponse> => {
        const { data } = await axios.get("/api/admin/routes?nopagination=true");
        return data;
    },

    // Get single route by ID
    getRouteById: async (id: string): Promise<RouteSingleResponse> => {
        const { data } = await axios.get(`/api/admin/routes/${id}`);
        return data;
    },

    // Create a new route
    createRoute: async (payload: { data: Partial<Route> }): Promise<RouteSingleResponse> => {
        const { data } = await axios.post("/api/admin/routes/new", payload.data);
        return data;
    },

    // Update route details by ID
    updateRoute: async (payload: { id: string; updates: Partial<Route> }): Promise<RouteSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/routes/${payload.id}`, payload.updates);
        return data;
    },

    // Custom Business Logic: Set route pricing and transit time
    updateRoutePricing: async (payload: { id: string; basePrice: number; estimatedTransitTime?: string }): Promise<RouteSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/routes/${payload.id}`, {
            basePrice: payload.basePrice,
            estimatedTransitTime: payload.estimatedTransitTime,
        });
        return data;
    },

    // Delete route by ID
    deleteRoute: async ({ id, hard = false }: { id: string; hard?: boolean }): Promise<RouteDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/routes/${id}`, {
            params: { hard }
        });
        return data;
    },
};
