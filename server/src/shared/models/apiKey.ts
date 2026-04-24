import mongoose, { Schema, Model } from "mongoose";

// 1. Nested Interfaces

export interface IPermissions {
  canIngest: boolean;
  canReadAnalytics: boolean;
  allowedServices: string[];
}

export interface ISecurity {
  allowedIPs: string[];
  allowedOrigins: string[];
  lastRotated: Date;
  rotationWarningDays: number;
}

export interface IMetadata {
  createdBy?: mongoose.Types.ObjectId;
  purpose?: string;
  tags: string[];
}

// 2. Main Interface
export interface IApiKey {
  keyId: string;
  keyValue: string;
  clientId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  environment: "production" | "staging" | "development" | "testing";
  isActive: boolean;
  permissions: IPermissions;
  security: ISecurity;
  expiresAt: Date;
  metadata: IMetadata;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Optional (recommended modern typing)
export type ApiKeyDocument = mongoose.HydratedDocument<IApiKey>;

// 3. Schema
const apiKeySchema = new Schema<IApiKey>(
  {
    keyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    keyValue: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
    environment: {
      type: String,
      enum: ["production", "staging", "development", "testing"],
      default: "production",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    permissions: {
      canIngest: {
        type: Boolean,
        default: true,
      },
      canReadAnalytics: {
        type: Boolean,
        default: false,
      },
      allowedServices: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    security: {
      allowedIPs: [
        {
          type: String,
          validate: {
            validator: function (v: string) {
              return (
                /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(v) ||
                v === "0.0.0.0/0"
              );
            },
            message: "Invalid IP address format",
          },
        },
      ],
      allowedOrigins: [
        {
          type: String,
          validate: {
            validator:function (v: string) {
              return /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/.*)?$/.test(v);
            },
            message: "Invalid origin format",
          },
        },
      ],
      lastRotated: {
        type: Date,
        default: Date.now,
      },
      rotationWarningDays: {
        type: Number,
        default: 30,
      },
    },

    expiresAt: {
      type: Date,
      default: () => {
       const days=parseInt(process.env.API_KEY_DEFAULT_EXPIRATION_DAYS || "365", 10);
       //this will return example: 2025-06-01T12:00:00.000Z if today is 2024-06-01 and API_KEY_DEFAULT_EXPIRATION_DAYS is 365
       return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      },
      index: true,
    },

    metadata: {
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      purpose: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      tags: [
        {
          type: String,
          trim: true,
          maxlength: 50,
        },
      ],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "api_keys",
  }
);

// 4. Indexes
apiKeySchema.index({ clientId: 1, isActive: 1 });
apiKeySchema.index({ keyValue: 1, isActive: 1 });
apiKeySchema.index({ environment: 1, clientId: 1 });
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 5. Model
const ApiKey: Model<IApiKey> = mongoose.model<IApiKey>(
  "ApiKey",
  apiKeySchema
);

export default ApiKey;