import * as mongoose from "mongoose";

export interface INotification extends mongoose.Document {
    class: "INFO" | "WARNING" | "ERROR";
    createdAt: Date;
    customerId: string;
    id: string;
    message: string;
    type: "Notification";
    updatedAt: Date;
    userId: string;
}

export const NotificationSchema = new mongoose.Schema(
    {
        class: { type: String, default: "INFO" },
        customerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
        message: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc: any, ret: any): INotification {
                ret.id = ret._id;
                ret.type = "Notification";
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },

    });

// Compound index on IDs
NotificationSchema.index({ customerId: 1, userId: 1, _id: 1 });

export const Notification = mongoose.model("Notification", NotificationSchema);
