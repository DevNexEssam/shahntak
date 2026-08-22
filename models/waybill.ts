import mongoose, { Schema, Types, Document } from "mongoose";

export interface IWaybill extends Document {
    shipmentId: Types.ObjectId;
    waybillNumber: string;
    pdfUrl: string;
    issuedAt: Date;
}

const WaybillSchema = new Schema<IWaybill>(
    {
        shipmentId: { type: Schema.Types.ObjectId, ref: "Shipment", required: true, unique: true },
        waybillNumber: { type: String, required: true, unique: true },
        pdfUrl: { type: String, required: true },
        issuedAt: { type: Date, default: Date.now },
    }, { timestamps: true, versionKey: false }
)

const Waybill = mongoose.models.Waybill || mongoose.model("Waybill", WaybillSchema);
export default Waybill;