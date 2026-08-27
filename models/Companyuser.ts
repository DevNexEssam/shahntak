import mongoose, { Schema, Types, Document } from "mongoose";

export interface ICompanyUser extends Document {
    companyId: Types.ObjectId;
    userName: string;
    userEmail: string;
    password: string;
    phone: string;
    userRole: "owner" | "manager" | "staff";
    status: "active" | "inactive";
    permissions: string[];
    userIsActive: boolean;
    createdBy: Types.ObjectId;
    createdByType: "user" | "company_user";
    deletedAt?: Date | null;
}

const CompanyUserSchema = new Schema<ICompanyUser>(
    {
        companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
        userName: { type: String, required: true, minlength: 3, maxlength: 50 },
        userEmail: { type: String, required: true, unique: true, minlength: 8, maxlength: 70 },
        password: { type: String, required: true, select: false },
        phone: { type: String, required: true, minlength: 3, maxlength: 15 },
        userRole: {
            type: String,
            enum: ["owner", "manager", "staff"],
            default: "staff",
        },
        permissions: [{ type: String }],
        userIsActive: { type: Boolean, default: true },
        createdBy: { type: Schema.Types.ObjectId, required: true },
        createdByType: {
            type: String,
            enum: ["user", "company_user"],
            default: "user",
        },
        deletedAt: { type: Date, default: null },
    }, { timestamps: true, versionKey: false }
)

// order
CompanyUserSchema.virtual('companyUserOrders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'createdByUserId',
});
const CompanyUser = mongoose.models.CompanyUser || mongoose.model("CompanyUser", CompanyUserSchema);
export default CompanyUser;