import mongoose, { Schema, Types, Document } from "mongoose";

export interface IPayment extends Document {
    invoiceId: Types.ObjectId;
    amount: number;
    method: "bank_transfer" | "card" | "cash" | "other";
    paidAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
    {
        invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true, index: true },
        amount: { type: Number, required: true },
        method: { type: String, enum: ["bank_transfer", "card", "cash", "other"], required: true },
        paidAt: { type: Date, default: Date.now },
    }, { timestamps: true, versionKey: false }
)

const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
export default Payment;