import mongoose, { Schema, Types, Document } from "mongoose";

export interface IRoute extends Document {
    companyId?: Types.ObjectId;
    origin: string;
    destination: string;
    vehicleType: string;
    basePrice: number;
    carrierId?: Types.ObjectId;
    estimatedTransitTime?: string;
    isActive: boolean;
    createdBy?: Types.ObjectId;
    deletedAt?: Date | null;
}

const RouteSchema = new Schema<IRoute>(
    {
        companyId: { type: Schema.Types.ObjectId, ref: "Company", index: true },
        origin: { type: String, required: true, minlength: 2, maxlength: 50 },
        destination: { type: String, required: true, minlength: 2, maxlength: 50 },
        vehicleType: { type: String, required: true },
        basePrice: { type: Number, required: true },
        carrierId: { type: Schema.Types.ObjectId, ref: "Carrier" },
        estimatedTransitTime: { type: String },
        isActive: { type: Boolean, default: true },
        createdBy: { type: Schema.Types.ObjectId },
        deletedAt: { type: Date, default: null },
    }, { timestamps: true, versionKey: false }
)

// shipments
RouteSchema.virtual('routeShipments', {
    ref: 'Shipment',
    localField: '_id',
    foreignField: 'routeId',
});

RouteSchema.index({ companyId: 1, origin: 1, destination: 1, vehicleType: 1 }, { unique: true, sparse: true });

const Route = mongoose.models.Route || mongoose.model("Route", RouteSchema);
export default Route;