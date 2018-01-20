import * as mongoose from "mongoose";
import * as JWTService from "../lib/jwt.service";

export interface IUser extends mongoose.Document {
    admin: boolean;
    createdAt: Date;
    customerId: string;
    id: string;
    login: string;
    name: string;
    root: boolean;
    type: "User";
    updatedAt: Date;

    getJWT(): string;
}

export const UserSchema = new mongoose.Schema(
    {
        admin: { type: Boolean, default: false },
        customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
        login: { type: String, required: true },
        name: { type: String, required: true },
        password: { type: String, required: true },
        root: { type: Boolean, default: false },
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

/**
 * Get a JWT token for this User
 */
UserSchema.methods.getJWT = function getJWT(): string {
    const payload: any = { id: this.id, cid: this.customerId };

    // Include ACL flags when appropriate
    if (this.admin) { payload.admin = true; }
    if (this.root) { payload.root = true; }

    return JWTService.sign(payload);
};

export const User = mongoose.model<IUser>("User", UserSchema);
