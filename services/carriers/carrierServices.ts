import { Carrier, CarrierResponse, CarrierSingleResponse, CarrierDeleteResponse } from "@/types/data";
import axios from "axios";

export const carrierServices = {
    // Get paginated carriers list
    getCarriers: async (page: number = 1, limit: number = 10): Promise<CarrierResponse> => {
        const { data } = await axios.get(`/api/admin/carriers?page=${page}&limit=${limit}`);
        return data;
    },

    // Get all carriers without pagination
    getAllCarriers: async (): Promise<CarrierResponse> => {
        const { data } = await axios.get("/api/admin/carriers?nopagination=true");
        return data;
    },

    // Get single carrier by ID
    getCarrierById: async (id: string): Promise<CarrierSingleResponse> => {
        const { data } = await axios.get(`/api/admin/carriers/${id}`);
        return data;
    },

    // Create a new carrier
    createCarrier: async (payload: { data: Partial<Carrier> }): Promise<CarrierSingleResponse> => {
        const { data } = await axios.post("/api/admin/carriers/new", payload.data);
        return data;
    },

    // Update carrier details by ID
    updateCarrier: async (payload: { id: string; updates: Partial<Carrier> }): Promise<CarrierSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/carriers/${payload.id}`, payload.updates);
        return data;
    },

    // Custom Business Logic: Toggle carrier active status
    toggleCarrierStatus: async (payload: { id: string; isActive: boolean }): Promise<CarrierSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/carriers/${payload.id}`, { isActive: payload.isActive });
        return data;
    },

    // Delete carrier by ID
    deleteCarrier: async ({ id, hard = false }: { id: string; hard?: boolean }): Promise<CarrierDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/carriers/${id}`, {
            params: { hard }
        });
        return data;
    },
};
