import mongoose, { Document, Schema } from "mongoose";

export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";

export interface IOrganization extends Document {
  name: string;
  slug: string;
  companyEmail?: string;
  companyDomain?: string;
  contactNumber?: string;
  companySize?: CompanySize;
  companyAddress?: string;
  status: "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: [true, "Organization slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },

    companyEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid company email address"],
    },

    companyDomain: {
      type: String,
      trim: true,
      lowercase: true,
    },

    contactNumber: {
      type: String,
      trim: true,
    },

    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
    },

    companyAddress: {
      type: String,
      trim: true,
      maxlength: [300, "Company address must not exceed 300 characters"],
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Organization = mongoose.model<IOrganization>(
  "Organization",
  organizationSchema
);

export default Organization;
