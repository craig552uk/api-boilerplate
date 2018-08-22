import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import * as mongoosePaginate from "mongoose-paginate";
import * as JWTService from "../lib/jwt.service";

export interface IUser extends mongoose.Document {
    admin: boolean;
    createdAt: Date;
    customerId: string;
    enabled: boolean;
    id: string;
    login: string;
    name: string;
    password: string;
    root: boolean;
    type: "User";
    updatedAt: Date;

    checkPassword(candidatePassword: string): boolean;
    getJWT(payload?: any): string;
}

export const UserSchema = new mongoose.Schema(
    {
        admin: { type: Boolean, default: false },
        customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
        enabled: { type: Boolean, default: true },
        login: { type: String, required: true, index: { unique: true } },
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

// Apply pagination plugin to model
UserSchema.plugin(mongoosePaginate);

/**
 * Securely hash passwords before saving in DB
 */
UserSchema.pre("save", function save(this: IUser, next): void {
    const user = this;

    // Only hash the password if it has been modified (or is new)
    if (!user.isModified("password")) { return next(); }

    // Password policy
    if (!user.password.match(/^[a-z-A-Z0-9$@$!%*?&]{8,}$/)) {
        throw Error("Password must be at least 8 characters and may only use a-z, A-Z, 0-9 and $@$!%*?&");
    }

    // Hash the password
    bcrypt.genSalt(10)
        .then((salt) => bcrypt.hash(user.password, salt))
        .then((hash) => user.password = hash)
        .then(() => next())
        .catch(next);
});

/**
 * Check a submitted password against this User
 */
UserSchema.methods.checkPassword = function checkPassword(candidatePassword: string): boolean {
    candidatePassword = candidatePassword || "";
    return bcrypt.compareSync(candidatePassword, this.password);
};

/**
 * Get a JWT token for this User
 */
UserSchema.methods.getJWT = function getJWT(payload: any = {}): string {

    payload.id = this.id;
    payload.cid = this.customerId;

    // Include ACL flags when appropriate
    if (this.admin) { payload.admin = true; }
    if (this.root) { payload.root = true; }

    return JWTService.sign(payload);
};

export const User = mongoose.model<IUser>("User", UserSchema);
