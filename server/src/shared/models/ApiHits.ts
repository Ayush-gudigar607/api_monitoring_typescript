import mongoose,{Document,Schema,Model} from "mongoose";

//Interface for the document
export interface ApiHits extends Document{
    eventId:string;
    timestamp:Date;
    serviceName:string;
    endpoint:string;
    method:"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
    statusCode:number;
    latencyMs:number;
    clientId:mongoose.Types.ObjectId;
    apiKeyId:mongoose.Types.ObjectId;
    ip:string;
    userAgent:string;
    createdAt:Date;
    updatedAt:Date;
}

const apiHitSchma:Schema<ApiHits> = new Schema({
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    serviceName: {
      type: String,
      required: true,
      index: true,
    },

    endpoint: {
      type: String,
      required: true,
      index: true,
    },

    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    },

    statusCode: {
      type: Number,
      required: true,
      index: true,
    },

    latencyMs: {
      type: Number,
      required: true,
      index: true,
    },

    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    apiKeyId: {
      type: Schema.Types.ObjectId,
      ref: "ApiKey",
      required: true,
      index: true,
    },

    ip: {
      type: String,
      required: true,
    },

    userAgent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "api_hits",
  }
);

// 3. Indexes
apiHitSchma.index({ clientId: 1, serviceName: 1, endpoint: 1, timestamp: -1 });
apiHitSchma.index({ clientId: -1, timestamp: -1, statusCode: 1 });
apiHitSchma.index({ apiKeyId: 1, timestamp: -1 });

apiHitSchma.index(
  { timestamp: -1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 } // 30 days TTL
);

// 4. Model
const ApiHits:Model<ApiHits> = mongoose.model<ApiHits>("ApiHits", apiHitSchma);
    
export default ApiHits;

