import mongoose, { Schema, Types } from "mongoose";

export interface ICompany extends Document {
    companyName: string
    email: string;
    password: string;
    city: string;
    taxNumber: string;
    address: string;
    facilityInfo: string
    phone: string;
    status: "active" | "inactive" | "archived" | "banned";
    approvedBy?: Types.ObjectId;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
    {
        companyName: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 50
        },
        email: { type: String, required: true, unique: true, minlength: 8, maxlength: 70 },
        password: { type: String, default: "123456", select: false },
        phone: { type: String, required: true, unique: true, minlength: 3, maxlength: 15 },
        city: { type: String, required: true, minlength: 1, maxlength: 50 },
        taxNumber: { type: String, minlength: 1, maxlength: 50 },
        address: { type: String, minlength: 1, maxlength: 255 },
        facilityInfo: { type: String, minlength: 1, maxlength: 500 },
        status: {
            type: String,
            enum: ["active", "inactive", "archived", "banned"],
            default: "active",
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
        approvedAt: { type: Date },
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