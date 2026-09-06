import mongoose, { Schema, Types, Document } from "mongoose";

export interface IInvoice extends Document {
    invoiceNumber: string;
    companyId: Types.ObjectId;
    subtotal?: number;
    discount?: number;
    vatAmount?: number;
    taxRateSnapshot?: number;
    total: number;
    status: "draft" | "issued" | "paid" | "overdue" | "cancelled";
    dueDate?: Date;
    deletedAt?: Date | null;
}

const InvoiceSchema = new Schema<IInvoice>(
    {
        invoiceNumber: { type: String, required: true, unique: true },
        companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
        total: { type: Number, required: true },
        subtotal: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        vatAmount: { type: Number, default: 0 },
        taxRateSnapshot: { type: Number, default: 15 },
        status: {
            type: String,
            enum: ["draft", "issued", "paid", "overdue", "cancelled"],
            default: "draft",
        },
        dueDate: { type: Date },
        deletedAt: { type: Date, default: null },
    }, { timestamps: true, versionKey: false }
)

// payments
InvoiceSchema.virtual('invoicePayments', {
    ref: 'Payment',
    localField: '_id',
    foreignField: 'invoiceId',
});

// shipments
InvoiceSchema.virtual('invoiceShipments', {
    ref: 'Shipment',
    localField: '_id',
    foreignField: 'invoiceId',
});

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
export default Invoice;