import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITenant extends Document {
  organizationId: Types.ObjectId;
  databaseName: string;
  connectionStatus: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
    },

    databaseName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[a-zA-Z0-9_-]+$/,
    },

    connectionStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Tenant = mongoose.model<ITenant>("Tenant", tenantSchema);

export default Tenant;