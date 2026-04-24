import mongoose,{Schema,Model} from "mongoose";


//interface for settings 
export interface ISettings {
    dataRetentionDays:number;
    alertsEnabled:boolean;
    timezone:string;
}

export interface IClient {
    name:string;
    slug:string;
    email:string;
    description?:string;
    website?:string;
    createdBy:mongoose.Types.ObjectId;
    isActive:boolean;
    settings:ISettings;
    createdAt:Date;
    updatedAt:Date;
}

//optional (recommended modern typing)
export type ClientDocument = mongoose.HydratedDocument<IClient>;

//3. Schema
// 3. Schema
const clientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9-]+$/,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      maxlength: 500,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    settings: {
      dataRetentionDays: {
        type: Number,
        default: 30,
        min: 7,
        max: 365,
      },
      alertsEnabled: {
        type: Boolean,
        default: true,
      },
      timezone: {
        type: String,
        default: "UTC",
      },
    },
  },
  {
    timestamps: true,
    collection: "clients",
  }
);

clientSchema.index({ isActive: 1 });

// 4. Model
const Client:Model<IClient> = mongoose.model<IClient>("Client", clientSchema);

export default Client;