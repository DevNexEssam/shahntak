import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trackingEventServices } from "@/services/trackingEvents/trackingEventServices";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Query keys
export const trackingEventKeys = {
    all: ["tracking-events"] as const,
    shipmentEvents: (shipmentId: string) => [...trackingEventKeys.all, "shipment", shipmentId] as const,
};

// Queries
export const useShipmentTrackingEvents = (shipmentId: string) => {
    return useQuery({
        queryKey: trackingEventKeys.shipmentEvents(shipmentId),
        queryFn: () => trackingEventServices.getTrackingEventsByShipment(shipmentId),
        enabled: !!shipmentId,
    });
};

// Mutations
export const useLogTrackingEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { shipmentId: string; status: string; location?: string; occurredAt?: string }) =>
            trackingEventServices.logTrackingEvent(payload),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: trackingEventKeys.shipmentEvents(variables.shipmentId) });
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            toast.success(res.message || "تم تسجيل نقطة التتبع وتحديث حالة الشحنة بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء إضافة حدث التتبع");
        },
    });
};

export const useDeleteTrackingEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { id: string }) => trackingEventServices.deleteTrackingEvent(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: trackingEventKeys.all });
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            toast.success(res.message || "تم حذف حدث التتبع بنجاح");
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف حدث التتبع");
        },
    });
};
