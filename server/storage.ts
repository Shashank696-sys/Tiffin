import { randomUUID } from "crypto";
import type {
  User,
  Seller,
  Tiffin,
  Booking,
  SellerWithUser,
  TiffinWithSeller,
  BookingWithDetails,
  AdminStats,
} from "@shared/schema";

export interface IStorage {
  createUser(user: Omit<User, "_id" | "createdAt">): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  
  createSeller(seller: Omit<Seller, "_id" | "createdAt">): Promise<Seller>;
  getSellerByUserId(userId: string): Promise<Seller | null>;
  getSellerById(id: string): Promise<Seller | null>;
  getAllSellersWithUsers(): Promise<SellerWithUser[]>;
  updateSellerStatus(id: string, status: "pending" | "active" | "suspended"): Promise<Seller | null>;
  
  createTiffin(tiffin: Omit<Tiffin, "_id" | "createdAt">): Promise<Tiffin>;
  getTiffinById(id: string): Promise<Tiffin | null>;
  getTiffinsBySellerId(sellerId: string): Promise<Tiffin[]>;
  getTiffinsWithActiveSellers(): Promise<TiffinWithSeller[]>;
  getTiffinWithSellerById(id: string): Promise<TiffinWithSeller | null>;
  updateTiffin(id: string, data: Partial<Tiffin>): Promise<Tiffin | null>;
  deleteTiffin(id: string): Promise<boolean>;
  
  createBooking(booking: Omit<Booking, "_id" | "createdAt" | "status">): Promise<Booking>;
  getBookingsByEmail(email: string): Promise<BookingWithDetails[]>;
  getBookingsBySellerId(sellerId: string): Promise<BookingWithDetails[]>;
  getAllBookingsWithDetails(): Promise<BookingWithDetails[]>;
  
  getAdminStats(): Promise<AdminStats>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private sellers: Map<string, Seller> = new Map();
  private tiffins: Map<string, Tiffin> = new Map();
  private bookings: Map<string, Booking> = new Map();

  async createUser(userData: Omit<User, "_id" | "createdAt">): Promise<User> {
    const user: User = {
      ...userData,
      _id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.users.set(user._id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async createSeller(sellerData: Omit<Seller, "_id" | "createdAt">): Promise<Seller> {
    const seller: Seller = {
      ...sellerData,
      _id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.sellers.set(seller._id, seller);
    return seller;
  }

  async getSellerByUserId(userId: string): Promise<Seller | null> {
    for (const seller of this.sellers.values()) {
      if (seller.userId === userId) return seller;
    }
    return null;
  }

  async getSellerById(id: string): Promise<Seller | null> {
    return this.sellers.get(id) || null;
  }

  async getAllSellersWithUsers(): Promise<SellerWithUser[]> {
    const result: SellerWithUser[] = [];
    for (const seller of this.sellers.values()) {
      const user = await this.getUserById(seller.userId);
      if (user) {
        result.push({ ...seller, user });
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateSellerStatus(id: string, status: "pending" | "active" | "suspended"): Promise<Seller | null> {
    const seller = this.sellers.get(id);
    if (!seller) return null;
    seller.status = status;
    return seller;
  }

  async createTiffin(tiffinData: Omit<Tiffin, "_id" | "createdAt">): Promise<Tiffin> {
    const tiffin: Tiffin = {
      ...tiffinData,
      _id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.tiffins.set(tiffin._id, tiffin);
    return tiffin;
  }

  async getTiffinById(id: string): Promise<Tiffin | null> {
    return this.tiffins.get(id) || null;
  }

  async getTiffinsBySellerId(sellerId: string): Promise<Tiffin[]> {
    return Array.from(this.tiffins.values()).filter((t) => t.sellerId === sellerId);
  }

  async getTiffinsWithActiveSellers(): Promise<TiffinWithSeller[]> {
    const result: TiffinWithSeller[] = [];
    const activeSellers = Array.from(this.sellers.values()).filter((s) => s.status === "active");
    const activeSellerIds = new Set(activeSellers.map((s) => s._id));

    for (const tiffin of this.tiffins.values()) {
      if (activeSellerIds.has(tiffin.sellerId)) {
        const seller = this.sellers.get(tiffin.sellerId);
        if (seller) {
          result.push({ ...tiffin, seller });
        }
      }
    }
    return result;
  }

  async getTiffinWithSellerById(id: string): Promise<TiffinWithSeller | null> {
    const tiffin = this.tiffins.get(id);
    if (!tiffin) return null;
    const seller = this.sellers.get(tiffin.sellerId);
    if (!seller) return null;
    return { ...tiffin, seller };
  }

  async updateTiffin(id: string, data: Partial<Tiffin>): Promise<Tiffin | null> {
    const tiffin = this.tiffins.get(id);
    if (!tiffin) return null;
    Object.assign(tiffin, data);
    return tiffin;
  }

  async deleteTiffin(id: string): Promise<boolean> {
    return this.tiffins.delete(id);
  }

  async createBooking(bookingData: Omit<Booking, "_id" | "createdAt" | "status">): Promise<Booking> {
    const booking: Booking = {
      ...bookingData,
      _id: randomUUID(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    this.bookings.set(booking._id, booking);
    return booking;
  }

  async getBookingsByEmail(email: string): Promise<BookingWithDetails[]> {
    const result: BookingWithDetails[] = [];
    for (const booking of this.bookings.values()) {
      if (booking.customerEmail === email) {
        const tiffin = this.tiffins.get(booking.tiffinId);
        const seller = this.sellers.get(booking.sellerId);
        if (tiffin && seller) {
          result.push({ ...booking, tiffin, seller });
        }
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getBookingsBySellerId(sellerId: string): Promise<BookingWithDetails[]> {
    const result: BookingWithDetails[] = [];
    for (const booking of this.bookings.values()) {
      if (booking.sellerId === sellerId) {
        const tiffin = this.tiffins.get(booking.tiffinId);
        const seller = this.sellers.get(booking.sellerId);
        if (tiffin && seller) {
          result.push({ ...booking, tiffin, seller });
        }
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllBookingsWithDetails(): Promise<BookingWithDetails[]> {
    const result: BookingWithDetails[] = [];
    for (const booking of this.bookings.values()) {
      const tiffin = this.tiffins.get(booking.tiffinId);
      const seller = this.sellers.get(booking.sellerId);
      if (tiffin && seller) {
        result.push({ ...booking, tiffin, seller });
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAdminStats(): Promise<AdminStats> {
    return {
      totalSellers: this.sellers.size,
      totalTiffins: this.tiffins.size,
      totalBookings: this.bookings.size,
      pendingSellers: Array.from(this.sellers.values()).filter((s) => s.status === "pending").length,
    };
  }
}

export const storage = new MemStorage();
