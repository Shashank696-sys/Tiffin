import mongoose, { Schema, Document } from "mongoose";

export interface ITiffin extends Document {
  sellerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: "Veg" | "Non-Veg" | "Jain";
  price: number;
  availableDays: string[];
  slots: string[];
  imageUrl?: string;
  createdAt: Date;
}

const TiffinSchema = new Schema<ITiffin>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["Veg", "Non-Veg", "Jain"], required: true },
    price: { type: Number, required: true },
    availableDays: { type: [String], required: true },
    slots: { type: [String], required: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export const Tiffin = mongoose.model<ITiffin>("Tiffin", TiffinSchema);
