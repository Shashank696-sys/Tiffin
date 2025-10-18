import mongoose, { Schema, Document } from "mongoose";

export interface ISeller extends Document {
  userId: mongoose.Types.ObjectId;
  shopName: string;
  address: string;
  city: string;
  contactNumber: string;
  status: "pending" | "active" | "suspended";
  createdAt: Date;
}

const SellerSchema = new Schema<ISeller>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shopName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    contactNumber: { type: String, required: true },
    status: { type: String, enum: ["pending", "active", "suspended"], default: "pending" },
  },
  { timestamps: true }
);

export const Seller = mongoose.model<ISeller>("Seller", SellerSchema);
