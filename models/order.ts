import mongoose, { Schema, Types, Document } from "mongoose";

export interface IOrder extends Document {
    orderNumber: string;
    companyId: Types.ObjectId;
    shipmentId?: Types.ObjectId;
    createdByUserId: Types.ObjectId;
    recipientName: string;
    recipientPhone: string;
    recipientCity: string;
    recipientDistrict?: string;
    recipientAddress: string;
    description?: string;
    quantity: number;
    weight: number;
    orderValue: number;
    codAmount?: number;
    status: "pending" | "validated" | "error" | "grouped" | "shipped" | "delivered" | "cancelled";
    source: "manual" | "bulk_upload";
}

const OrderSchema = new Schema<IOrder>(
    {
        orderNumber: { type: String, required: true, unique: true },
        companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
        shipmentId: { type: Schema.Types.ObjectId, ref: "Shipment", index: true },
        createdByUserId: { type: Schema.Types.ObjectId, ref: "CompanyUser", required: true },
        recipientName: { type: String, required: true, minlength: 2, maxlength: 50 },
        recipientPhone: { type: String, required: true, minlength: 8, maxlength: 15 },
        recipientCity: { type: String, required: true, minlength: 2, maxlength: 50 },
        recipientDistrict: { type: String, maxlength: 50 },
        recipientAddress: { type: String, required: true, maxlength: 255 },
        description: { type: String, maxlength: 255 },
        quantity: { type: Number, required: true, default: 1 },
        weight: { type: Number, required: true },
        orderValue: { type: Number, required: true },
        codAmount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["pending", "validated", "error", "grouped", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        source: { type: String, enum: ["manual", "bulk_upload"], default: "manual" },
    }, { timestamps: true, versionKey: false }
)

OrderSchema.index({ companyId: 1, recipientCity: 1, status: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export default Order;