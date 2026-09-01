import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVehicle extends Document {
    companyId?: Types.ObjectId;
    createdBy?: Types.ObjectId;
    type: string;
    capacityWeight?: number;
    capacityVolume?: number;
    isActive: boolean;
    deletedAt?: Date | null;
}

const VehicleSchema = new Schema<IVehicle>(
    {
        companyId: { type: Schema.Types.ObjectId, ref: "Company", index: true },
        createdBy: { type: Schema.Types.ObjectId },
        type: { type: String, required: true, minlength: 2, maxlength: 50 },
        capacityWeight: { type: Number },
        capacityVolume: { type: Number },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true, versionKey: false }
);

// vehicles virtual
VehicleSchema.virtual("routeVehicles", {
    ref: "Vehicle",
    localField: "_id",
    foreignField: "vehicleId",
});

const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", VehicleSchema);
export default Vehicle;