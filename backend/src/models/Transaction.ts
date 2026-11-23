
import { Document, Schema, Types } from "mongoose";

export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "reversed";

export type TransactionType = "credit" | "debit";

export interface ITransaction extends Document {
  eventId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  referenceDetails?: {
    referenceType?: string;
    referenceId?: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    eventId: {
      type: String,
      required: [true, "Event ID is required"],
      unique: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    type: {
      type: String,
      enum: ["credit", "debit"],
      required: [true, "Transaction type is required"],
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "reversed"],
      default: "pending",
      required: true,
    },

    referenceDetails: {
      referenceType: {
        type: String,
        trim: true,
      },
      referenceId: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);



export { transactionSchema };
