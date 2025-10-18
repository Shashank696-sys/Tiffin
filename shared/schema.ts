import { z } from "zod";

// User Schema
export const userSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  password: z.string(),
  role: z.enum(["admin", "seller", "customer"]),
  createdAt: z.string(),
});

export const insertUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "seller", "customer"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

// Seller Schema
export const sellerSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  shopName: z.string(),
  address: z.string(),
  city: z.string(),
  contactNumber: z.string(),
  status: z.enum(["pending", "active", "suspended"]),
  createdAt: z.string(),
});

export const insertSellerSchema = z.object({
  userId: z.string(),
  shopName: z.string().min(2, "Shop name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
});

export const updateSellerStatusSchema = z.object({
  status: z.enum(["pending", "active", "suspended"]),
});

export type Seller = z.infer<typeof sellerSchema>;
export type InsertSeller = z.infer<typeof insertSellerSchema>;

// Tiffin Schema
export const tiffinSchema = z.object({
  _id: z.string(),
  sellerId: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(["Veg", "Non-Veg", "Jain"]),
  price: z.number(),
  availableDays: z.array(z.string()),
  slots: z.array(z.string()),
  imageUrl: z.string().optional(),
  createdAt: z.string(),
});

export const insertTiffinSchema = z.object({
  sellerId: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["Veg", "Non-Veg", "Jain"]),
  price: z.number().min(1, "Price must be greater than 0"),
  availableDays: z.array(z.string()).min(1, "Select at least one available day"),
  slots: z.array(z.string()).min(1, "Select at least one time slot"),
  imageUrl: z.string().optional(),
});

export type Tiffin = z.infer<typeof tiffinSchema>;
export type InsertTiffin = z.infer<typeof insertTiffinSchema>;

// Booking Schema
export const bookingSchema = z.object({
  _id: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerPhone: z.string(),
  tiffinId: z.string(),
  sellerId: z.string(),
  deliveryAddress: z.string(),
  date: z.string(),
  slot: z.string(),
  quantity: z.number(),
  totalPrice: z.number(),
  status: z.enum(["Pending", "Confirmed", "Cancelled"]),
  createdAt: z.string(),
});

export const insertBookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone must be at least 10 digits"),
  tiffinId: z.string(),
  sellerId: z.string(),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  date: z.string().min(1, "Date is required"),
  slot: z.string().min(1, "Time slot is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  totalPrice: z.number(),
});

export type Booking = z.infer<typeof bookingSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Auth Response
export type AuthResponse = {
  token: string;
  user: User;
  seller?: Seller;
};

// Seller with User data
export type SellerWithUser = Seller & {
  user: User;
};

// Tiffin with Seller data
export type TiffinWithSeller = Tiffin & {
  seller: Seller;
};

// Booking with details
export type BookingWithDetails = Booking & {
  tiffin: Tiffin;
  seller: Seller;
};

// Dashboard stats
export type AdminStats = {
  totalSellers: number;
  totalTiffins: number;
  totalBookings: number;
  pendingSellers: number;
};
