import { Order, OrderResponse, OrderSingleResponse, OrderDeleteResponse } from "@/types/data";
import axios from "axios";

export const orderServices = {
    // Get paginated orders list with server-side search & filtering
    getOrders: async (page: number = 1, limit: number = 10, search: string = "", status: string = "all"): Promise<OrderResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search && search.trim() !== "") params.append("search", search.trim());
        if (status && status !== "all") params.append("status", status);

        const { data } = await axios.get(`/api/admin/orders?${params.toString()}`);
        return data;
    },

    // Get all orders without pagination
    getAllOrders: async (): Promise<OrderResponse> => {
        const { data } = await axios.get("/api/admin/orders?nopagination=true");
        return data;
    },

    // Get single order by ID
    getOrderById: async (id: string): Promise<OrderSingleResponse> => {
        const { data } = await axios.get(`/api/admin/orders/${id}`);
        return data;
    },

    // Create a single order (manual creation)
    createOrder: async (payload: { data: Partial<Order> }): Promise<OrderSingleResponse> => {
        const { data } = await axios.post("/api/admin/orders/new", payload.data);
        return data;
    },

    // Custom Business Logic: Bulk Upload orders (Excel/CSV upload)
    bulkUploadOrders: async (ordersData: Partial<Order>[]): Promise<OrderResponse> => {
        const { data } = await axios.post("/api/admin/orders/bulk", { orders: ordersData });
        return data;
    },

    // Update order details by ID
    updateOrder: async (payload: { id: string; updates: Partial<Order> }): Promise<OrderSingleResponse> => {
        const { data } = await axios.patch(`/api/admin/orders/${payload.id}`, payload.updates);
        return data;
    },

    // Custom Business Logic: Group multiple orders into a single shipment
    groupOrdersToShipment: async (payload: { orderIds: string[]; shipmentId: string }): Promise<{ success: boolean; message: string }> => {
        const { data } = await axios.patch("/api/admin/orders/group", payload);
        return data;
    },

    // Delete order by ID
    deleteOrder: async ({ id, hard = false }: { id: string; hard?: boolean }): Promise<OrderDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/orders/${id}`, {
            params: { hard }
        });
        return data;
    },
};
