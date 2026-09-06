import mongoose, { Schema, Types, Document } from "mongoose";

export interface IExpense extends Document {
    companyId: Types.ObjectId;
    title: string;
    category: string;
    amount: number;
    taxIncluded: boolean;
    taxAmount: number;
    expenseDate: Date;
    receiptNumber?: string;
    notes?: string;
    createdBy?: Types.ObjectId;
    deletedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const ExpenseSchema = new Schema<IExpense>(
    {
        companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
        title: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true, index: true },
        amount: { type: Number, required: true, min: 0 },
        taxIncluded: { type: Boolean, default: false },
        taxAmount: { type: Number, default: 0 },
        expenseDate: { type: Date, default: Date.now, index: true },
        receiptNumber: { type: String, trim: true },
        notes: { type: String, trim: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true, versionKey: false }
);

const Expense = mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
export default Expense;
