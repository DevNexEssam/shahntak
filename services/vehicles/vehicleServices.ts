import { Vehicle, VehicleResponse, VehicleSingleResponse, VehicleDeleteResponse } from "@/types/data";
import axios from "axios";

export const vehicleServices = {
    // Get paginated vehicles list with server-side search & filtering
    getVehicles: async (page: number = 1, limit: number = 10, search: string = "", status: string = "all"): Promise<VehicleResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search && search.trim() !== "") params.append("search", search.trim());
        if (status && status !== "all") params.append("status", status);

        const { data } = await axios.get(`/api/admin/vehicles?${params.toString()}`);
        return data;
    },

    // Get all vehicles without pagination
    getAllVehicles: async (): Promise<VehicleResponse> => {
        const { data } = await axios.get("/api/admin/vehicles?nopagination=true");
        return data;
    },

    // Get single vehicle by ID
    getVehicleById: async (id: string): Promise<VehicleSingleResponse> => {
        const { data } = await axios.get(`/api/admin/vehicles/${id}`);
        return data;
    },

    // Create a new vehicle
    createVehicle: async (payload: { data: Partial<Vehicle> }): Promise<VehicleSingleResponse> => {
        const { data } = await axios.post("/api/admin/vehicles/new", payload.data);
        return data;
    },

    // Update vehicle details by ID
    updateVehicle: async (payload: { id: string; updates: Partial<Vehicle> }): Promise<VehicleSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/vehicles/${payload.id}`, payload.updates);
        return data;
    },

    // Custom Business Logic: Update vehicle capacity specs (capacityWeight & capacityVolume)
    updateVehicleCapacities: async (payload: { id: string; capacityWeight: number; capacityVolume: number }): Promise<VehicleSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/vehicles/${payload.id}`, {
            capacityWeight: payload.capacityWeight,
            capacityVolume: payload.capacityVolume,
        });
        return data;
    },

    // Delete vehicle by ID
    deleteVehicle: async ({ id, hard = false }: { id: string; hard?: boolean }): Promise<VehicleDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/vehicles/${id}`, {
            params: { hard }
        });
        return data;
    },
};
