import mongoose, { Schema, Types, Document } from "mongoose";

export interface ITrackingEvent extends Document {
    shipmentId: Types.ObjectId;
    status: string;
    location?: string;
    occurredAt: Date;
}

const TrackingEventSchema = new Schema<ITrackingEvent>(
    {
        shipmentId: { type: Schema.Types.ObjectId, ref: "Shipment", required: true, index: true },
        status: { type: String, required: true },
        location: { type: String, maxlength: 255 },
        occurredAt: { type: Date, default: Date.now },
    }, { timestamps: true, versionKey: false }
)

const TrackingEvent = mongoose.models.TrackingEvent || mongoose.model("TrackingEvent", TrackingEventSchema);
export default TrackingEvent;