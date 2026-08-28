import mongoose, { Schema, Types, Document } from "mongoose";

export interface ISubscription extends Document {
    companyId: Types.ObjectId;
    planId: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    status: "active" | "expired" | "pending_payment" | "cancelled";
    ordersUsedThisMonth: number;
    shipmentsUsedThisMonth: number;
    autoRenew: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
    {
        companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
        planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true, index: true },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ["active", "expired", "pending_payment", "cancelled"],
            default: "active",
        },
        ordersUsedThisMonth: { type: Number, default: 0, min: 0 },
        shipmentsUsedThisMonth: { type: Number, default: 0, min: 0 },
        autoRenew: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true, versionKey: false }
);

SubscriptionSchema.index({ companyId: 1, status: 1 });

const Subscription = mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
export default Subscription;
