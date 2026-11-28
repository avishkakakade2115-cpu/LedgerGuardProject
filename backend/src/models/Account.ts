
import { Document, Schema, Types } from "mongoose";

export type AccountStatus = "active" | "blocked" | "closed";

export interface IAccount extends Document {
  userId: Types.ObjectId;
  accountNumber: string;
  balancePaise: number;
  currency: string;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      index: true,
    },

    accountNumber: {
      type: String,
      required: [true, "Account number is required"],
      unique: true,
      trim: true,
    },

    balancePaise: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Balance cannot be negative"],
      validate: {
        validator: (value: number) =>
          Number.isSafeInteger(value),
        message: "Balance must be a safe integer in paise",
      },
    },

    currency: {
      type: String,
      default: "INR",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "blocked", "closed"],
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export { accountSchema };
