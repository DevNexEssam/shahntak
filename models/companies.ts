import mongoose, { Schema, Types } from "mongoose";

export interface ITaxAuditLog {
    rate: number;
    changedAt: Date;
    changedBy: Types.ObjectId;
    changedByName?: string;
    reason: string;
}

export interface ICompany extends Document {
    companyName: string;
    email: string;
    password: string;
    city: string;
    taxNumber: string;
    address: string;
    facilityInfo: string;
    phone: string;
    status: "active" | "inactive" | "archived" | "banned";
    role : "company";
    vatRate?: number;
    vatExemptionReason?: string;
    taxRateAuditLog?: ITaxAuditLog[];
    approvedBy?: Types.ObjectId;
    approvedAt?: Date;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
    {
        companyName: {
            type: String,
            required: true,
            // unique: true,
            minlength: 3,
            maxlength: 100
        },
        email: { type: String, required: true, unique: true, minlength: 4, maxlength: 70 },
        password: { type: String, default: "123456", select: false, minlength: 6, maxlength: 70 },
        phone: { type: String, required: true, unique: true, minlength: 3, maxlength: 20 },
        city: { type: String, required: true, minlength: 1, maxlength: 50 },
        taxNumber: { type: String, maxlength: 50 },
        address: { type: String, maxlength: 255 },
        facilityInfo: { type: String, maxlength: 500 },
        vatRate: { type: Number, default: 15 },
        vatExemptionReason: { type: String, maxlength: 255 },
        taxRateAuditLog: [
            {
                rate: { type: Number, required: true },
                changedAt: { type: Date, default: Date.now },
                changedBy: { type: Schema.Types.ObjectId },
                changedByName: { type: String },
                reason: { type: String, required: true },
            },
        ],
        status: {
            type: String,
            enum: ["active", "inactive", "archived", "banned"],
            default: "active",
        },
        role: { type: String, default: "company" },
        approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
        approvedAt: { type: Date },
        deletedAt: { type: Date, default: null },
    }, { timestamps: true, versionKey: false }
)

// shipment
CompanySchema.virtual('companyShipments', {
    ref: 'Shipment',
    localField: '_id',
    foreignField: 'companyId',
});

// employees
CompanySchema.virtual('companyEmployees', {
    ref: 'CompanyUser',
    localField: '_id',
    foreignField: 'companyId',
});

//  ordrs
CompanySchema.virtual('companyOrders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'companyId',
});

// invoice
CompanySchema.virtual('companyInvoices', {
    ref: 'Invoice',
    localField: '_id',
    foreignField: 'companyId',
});



const Company = mongoose.models.Company || mongoose.model("Company", CompanySchema);
export default Company;