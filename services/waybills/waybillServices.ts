import { Waybill, WaybillResponse, WaybillSingleResponse, WaybillDeleteResponse } from "@/types/data";
import axios from "axios";

export const waybillServices = {
    // Get paginated waybills list
    getWaybills: async (page: number = 1, limit: number = 10): Promise<WaybillResponse> => {
        const { data } = await axios.get(`/api/admin/waybills?page=${page}&limit=${limit}`);
        return data;
    },

    // Get single waybill by ID
    getWaybillById: async (id: string): Promise<WaybillSingleResponse> => {
        const { data } = await axios.get(`/api/admin/waybills/${id}`);
        return data;
    },

    // Custom Business Logic: Issue / Generate Waybill PDF for a shipment
    generateWaybill: async (payload: { shipmentId: string }): Promise<WaybillSingleResponse> => {
        const { data } = await axios.post("/api/admin/waybills/generate", payload);
        return data;
    },

    // Create a waybill entry manually
    createWaybill: async (payload: { data: Partial<Waybill> }): Promise<WaybillSingleResponse> => {
        const { data } = await axios.post("/api/admin/waybills/new", payload.data);
        return data;
    },

    // Delete waybill by ID
    deleteWaybill: async ({ id }: { id: string }): Promise<WaybillDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/waybills/${id}`);
        return data;
    },
};
