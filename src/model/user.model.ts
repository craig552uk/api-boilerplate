import * as mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    createdAt: Date;
    customerId: string;
    id: string;
    isAdmin: boolean;
    login: string;
    type: "User";
    updatedAt: Date;
}

export const UserSchema = new mongoose.Schema(
    {
        customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
        isAdmin: {type: Boolean, default: false },
        login: { type: String, required: true },
        password: { type: String, required: true },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc: any, ret: any): IUser {
                ret.id = ret._id;
                ret.type = "User";
                delete ret._id;
                delete ret.__v;
                delete ret.password;
                return ret;
            },
        },

    });

export const User = mongoose.model("User", UserSchema);
