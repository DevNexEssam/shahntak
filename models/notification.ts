import mongoose, { Schema, Types, Document } from "mongoose";

export interface INotification extends Document {
    recipientType: "company_user" | "user";
    recipientId: Types.ObjectId;
    channel: "email" | "sms" | "in_app";
    event: string;
    title: string;
    body: string;
    isRead: boolean;
    sentAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        recipientType: { type: String, enum: ["company_user", "user"], required: true },
        recipientId: { type: Schema.Types.ObjectId, required: true, index: true },
        channel: { type: String, enum: ["email", "sms", "in_app"], required: true },
        event: { type: String, required: true },
        title: { type: String, required: true, maxlength: 100 },
        body: { type: String, required: true, maxlength: 500 },
        isRead: { type: Boolean, default: false },
        sentAt: { type: Date },
    }, { timestamps: true, versionKey: false }
)

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
export default Notification;