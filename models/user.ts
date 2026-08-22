import mongoose, { Schema } from "mongoose";

export interface IUser extends Document {
    name: string
    email: string;
    password: string;
    phone: string;
    role: "admin" | "super";
    status: "active" | "inactive";
}

export const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 50
        },
        email: { type: String, required: true, unique: true, minlength: 8, maxlength: 70 },
        password: { type: String, default: "123456", select: false },
        phone: { type: String, required: true, unique: true, minlength: 3, maxlength: 15 },
        role: {
            type: String,
            enum: ["admin", "super"],
            default: "admin",
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    }, { timestamps: true, versionKey: false }
)

// company users
UserSchema.virtual('approvedCompanies', {
    ref: 'Company',
    localField: '_id',
    foreignField: 'approvedBy',
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;