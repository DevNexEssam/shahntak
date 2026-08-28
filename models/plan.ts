import mongoose, { Schema, Document } from "mongoose";

export interface IPlan extends Document {
    name: string;
    description?: string;
    price: number;
    billingCycle: "monthly" | "yearly";
    maxOrdersPerMonth: number;
    maxShipmentsPerMonth: number;
    maxCompanyUsers: number;
    features: string[];
    isActive: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
    {
        name: { type: String, required: true, minlength: 2, maxlength: 100 },
        description: { type: String, maxlength: 500 },
        price: { type: Number, required: true, min: 0 },
        billingCycle: {
            type: String,
            enum: ["monthly", "yearly"],
            default: "monthly",
        },
        maxOrdersPerMonth: { type: Number, required: true, default: 100 },
        maxShipmentsPerMonth: { type: Number, required: true, default: 20 },
        maxCompanyUsers: { type: Number, required: true, default: 5 },
        features: { type: [String], default: [] },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true, versionKey: false }
);

const Plan = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
export default Plan;
