import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tiffinId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  deliveryAddress: string;
  date: Date;
  slot: string;
  quantity: number;
  totalPrice: number;
  status: "Pending" | "Confirmed" | "Cancelled";
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    tiffinId: { type: Schema.Types.ObjectId, ref: "Tiffin", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    deliveryAddress: { type: String, required: true },
    date: { type: Date, required: true },
    slot: { type: String, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
