import { Shipment, ShipmentResponse, ShipmentSingleResponse, ShipmentDeleteResponse, ShipmentStatus } from "@/types/data";
import axios from "axios";

export const shipmentServices = {
    // Get paginated shipments list with server-side search & filtering
    getShipments: async (page: number = 1, limit: number = 10, search: string = "", status: string = "all", type: string = "all", startDate: string = "", endDate: string = ""): Promise<ShipmentResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search && search.trim() !== "") params.append("search", search.trim());
        if (status && status !== "all") params.append("status", status);
        if (type && type !== "all") params.append("type", type);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const { data } = await axios.get(`/api/admin/shipments?${params.toString()}`);
        return data;
    },

    // Get all shipments without pagination
    getAllShipments: async (): Promise<ShipmentResponse> => {
        const { data } = await axios.get("/api/admin/shipments?nopagination=true");
        return data;
    },

    // Get single shipment by ID
    getShipmentById: async (id: string): Promise<ShipmentSingleResponse> => {
        const { data } = await axios.get(`/api/admin/shipments/${id}`);
        return data;
    },

    // Create a new shipment
    createShipment: async (payload: { data: Partial<Shipment> & { orderIds?: string[] } }): Promise<ShipmentSingleResponse> => {
        const { data } = await axios.post("/api/admin/shipments/new", payload.data);
        return data;
    },

    // Update shipment details by ID
    updateShipment: async (payload: { id: string; updates: Partial<Shipment> }): Promise<ShipmentSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/shipments/${payload.id}`, payload.updates);
        return data;
    },

    // Custom Business Logic: Assign route, carrier, and vehicle to shipment
    assignShipmentResources: async (payload: {
        id: string;
        routeId?: string;
        carrierId?: string;
        vehicleId?: string;
    }): Promise<ShipmentSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/shipments/${payload.id}/assign`, payload);
        return data;
    },

    // Custom Business Logic: Update shipment status (e.g. in_transit, delivered)
    updateShipmentStatus: async (payload: { id: string; status: ShipmentStatus }): Promise<ShipmentSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/shipments/${payload.id}/status`, { status: payload.status });
        return data;
    },

    // Delete shipment by ID
    deleteShipment: async ({ id, hard = false }: { id: string; hard?: boolean }): Promise<ShipmentDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/shipments/${id}`, {
            params: { hard }
        });
        return data;
    },
};
