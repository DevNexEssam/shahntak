import mongoose, { Schema, Types, Document } from "mongoose";

export interface IShipment extends Document {
    shipmentNumber: string;
    companyId: Types.ObjectId;
    type: "ftl" | "ltl" | "local_delivery";
    origin: string;
    destination: string;
    routeId?: Types.ObjectId;
    carrierId?: Types.ObjectId;
    vehicleId?: Types.ObjectId;
    invoiceId?: Types.ObjectId;
    ordersCount: number;
    shippingCost: number;
    customerPrice: number;
    waybillNumber?: string;
    trackingNumber?: string;
    status:
    | "created" | "confirmed" | "assigned" | "ready_for_pickup" | "picked_up"
    | "in_transit" | "arrived" | "out_for_delivery" | "delivered"
    | "delivery_failed" | "cancelled" | "returned" | "exception";
}

const ShipmentSchema = new Schema<IShipment>(
    {
        shipmentNumber: { type: String, required: true, unique: true },
        companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
        type: { type: String, enum: ["ftl", "ltl", "local_delivery"], default: "ftl" },
        origin: { type: String, required: true },
        destination: { type: String, required: true },
        routeId: { type: Schema.Types.ObjectId, ref: "Route" },
        carrierId: { type: Schema.Types.ObjectId, ref: "Carrier" },
        vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
        invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },
        ordersCount: { type: Number, default: 0 },
        shippingCost: { type: Number, required: true },
        customerPrice: { type: Number, required: true },
        waybillNumber: { type: String },
        trackingNumber: { type: String },
        status: {
            type: String,
            enum: [
                "created", "confirmed", "assigned", "ready_for_pickup", "picked_up",
                "in_transit", "arrived", "out_for_delivery", "delivered",
                "delivery_failed", "cancelled", "returned", "exception",
            ],
            default: "created",
        },
    }, { timestamps: true, versionKey: false }
)

// order
ShipmentSchema.virtual('shipmentOrders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'shipmentId',
});

// trackings
ShipmentSchema.virtual('shipmentTracks', {
    ref: 'Track',
    localField: '_id',
    foreignField: 'shipmentId',
});

// waybills
ShipmentSchema.virtual('shipmentWaybills', {
    ref: 'Waybill',
    localField: '_id',
    foreignField: 'shipmentId',
});

const Shipment = mongoose.models.Shipment || mongoose.model("Shipment", ShipmentSchema);
export default Shipment;