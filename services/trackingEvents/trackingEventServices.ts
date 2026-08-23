import { TrackingEvent, TrackingEventResponse, TrackingEventSingleResponse, TrackingEventDeleteResponse } from "@/types/data";
import axios from "axios";

export const trackingEventServices = {
    // Get tracking events for a specific shipment
    getTrackingEventsByShipment: async (shipmentId: string): Promise<TrackingEventResponse> => {
        const { data } = await axios.get(`/api/admin/tracking-events?shipmentId=${shipmentId}`);
        return data;
    },

    // Custom Business Logic: Log new tracking event & auto-update associated shipment status
    logTrackingEvent: async (payload: {
        shipmentId: string;
        status: string;
        location?: string;
        occurredAt?: string;
    }): Promise<TrackingEventSingleResponse> => {
        const { data } = await axios.post("/api/admin/tracking-events/new", payload);
        return data;
    },

    // Delete tracking event
    deleteTrackingEvent: async ({ id }: { id: string }): Promise<TrackingEventDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/tracking-events/${id}`);
        return data;
    },
};
