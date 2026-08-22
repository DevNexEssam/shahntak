import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
    type: string;
    capacityWeight?: number;
    capacityVolume?: number;
    isActive: boolean;
    deletedAt?: Date | null;
}

const VehicleSchema = new Schema<IVehicle>(
    {
        type: { type: String, required: true, minlength: 2, maxlength: 50 },
        capacityWeight: { type: Number },
        capacityVolume: { type: Number },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null },
    }, { timestamps: true, versionKey: false }
)

// vehicles
VehicleSchema.virtual('routeVehicles', {
    ref: 'Vehicle',
    localField: '_id',
    foreignField: 'vehicleId',
});

const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", VehicleSchema);
export default Vehicle;