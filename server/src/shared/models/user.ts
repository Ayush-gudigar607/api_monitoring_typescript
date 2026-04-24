import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { Validator } from "mongoose";


// 1. Role type
export type UserRole = "super_admin" | "client_admin" | "client_viewer";

// 2. Permissions
export interface IUserPermissions {
  canCreateApiKeys: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
}

// 3. Base user interface
export interface IUser {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  clientId?: mongoose.Types.ObjectId;
  isActive: boolean;
  permissions: IUserPermissions;
  createdAt: Date;
  updatedAt: Date;
}

// 4. Methods interface
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 5. Model type
type UserModel = Model<IUser, {}, IUserMethods>;

// 6. Document type
export type UserDocument = mongoose.HydratedDocument<IUser, IUserMethods>;

// 7. Schema
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      match: [/^[a-zA-Z0-9_.-]+$/, "Invalid username"],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    role: {
      type: String,
      enum: ["super_admin", "client_admin", "client_viewer"],
      default: "client_viewer",
    },

    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: function (this: IUser) {
        return this.role !== "super_admin";
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    permissions: {
      canCreateApiKeys: { type: Boolean, default: false },
      canManageUsers: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: true },
      canExportData: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// 8. Pre-save hook
userSchema.pre("save", async function () {
  const user = this as UserDocument;

  if (!user.isModified("password")) {
    return;
  }

  const isHashed = /^\$2[ayb]\$/.test(user.password);

  if (!isHashed) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// 9. Method (fixed naming + typing)
userSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 10. Hide password
userSchema.methods.toJSON = function (this: UserDocument) {
  const obj = this.toObject() as { password?: string };
  delete obj.password;
  return obj;
};

// 11. Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ clientId: 1, isActive: 1 });
userSchema.index({ role: 1 });

// 12. Model
const User: UserModel = mongoose.model<IUser, UserModel>(
  "User",
  userSchema
);

export default User;