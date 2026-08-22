import mongoose, { Schema, Document } from "mongoose";

export interface ICarrier extends Document {
    name: string;
    type: "local" | "external_api";
    contactPhone?: string;
    contactEmail?: string;
    isActive: boolean;
    deletedAt?: Date | null;
}

const CarrierSchema = new Schema<ICarrier>(
    {
        name: { type: String, required: true, unique: true, minlength: 2, maxlength: 50 },
        type: { type: String, enum: ["local", "external_api"], default: "local" },
        contactPhone: { type: String, minlength: 3, maxlength: 15 },
        contactEmail: { type: String, minlength: 8, maxlength: 70 },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null },
    }, { timestamps: true, versionKey: false }
)

// routes
CarrierSchema.virtual('carrierRoutes', {
    ref: 'Route',
    localField: '_id',
    foreignField: 'carrierId',
});

const Carrier = mongoose.models.Carrier || mongoose.model("Carrier", CarrierSchema);
export default Carrier;