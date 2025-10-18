import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { storage } from "./storage";
import { authenticateToken, requireRole, type AuthRequest } from "./middleware/auth";
import {
  sendBookingConfirmationToCustomer,
  sendBookingNotificationToSeller,
  sendSellerStatusUpdate,
} from "./services/email";

// Create default admin account in-memory
(async () => {
  const existingAdmin = await storage.getUserByEmail("admin@tiffinbox.com");
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("shashank", 10);
    await storage.createUser({
      name: "Admin",
      email: "admin@tiffinbox.com",
      phone: "9999999999",
      password: hashedPassword,
      role: "admin",
    });
    console.log("✅ Default admin account created (admin@tiffinbox.com / shashank)");
  }
})();

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return secret;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post(
    "/api/auth/register",
    [
      body("email").isEmail(),
      body("password").isLength({ min: 6 }),
      body("name").notEmpty(),
      body("phone").notEmpty(),
      body("role").isIn(["admin", "seller", "customer"]),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { name, email, phone, password, role } = req.body;

        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await storage.createUser({
          name,
          email,
          phone,
          password: hashedPassword,
          role,
        });

        let seller = null;
        if (role === "seller") {
          seller = await storage.createSeller({
            userId: user._id,
            shopName: req.body.shopName || `${name}'s Kitchen`,
            address: req.body.address || "Address not provided",
            city: req.body.city || "City not specified",
            contactNumber: phone,
            status: "pending",
          });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, getJWTSecret(), {
          expiresIn: "7d",
        });

        res.status(201).json({
          token,
          user,
          seller,
        });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  app.post(
    "/api/auth/login",
    [body("email").isEmail(), body("password").notEmpty()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { email, password } = req.body;

        const user = await storage.getUserByEmail(email);
        if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        let seller = null;
        if (user.role === "seller") {
          seller = await storage.getSellerByUserId(user._id);
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, getJWTSecret(), {
          expiresIn: "7d",
        });

        res.json({
          token,
          user,
          seller,
        });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  // Seller routes
  app.get("/api/seller/profile", authenticateToken, requireRole("seller"), async (req: AuthRequest, res) => {
    try {
      const seller = await storage.getSellerByUserId(req.userId!);
      if (!seller) {
        return res.status(404).json({ message: "Seller profile not found" });
      }

      res.json(seller);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/seller/tiffins", authenticateToken, requireRole("seller"), async (req: AuthRequest, res) => {
    try {
      const seller = await storage.getSellerByUserId(req.userId!);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      const tiffins = await storage.getTiffinsBySellerId(seller._id);
      res.json(tiffins);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/seller/tiffins", authenticateToken, requireRole("seller"), async (req: AuthRequest, res) => {
    try {
      const seller = await storage.getSellerByUserId(req.userId!);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      if (seller.status !== "active") {
        return res.status(403).json({ message: "Your account must be active to add tiffins" });
      }

      const tiffin = await storage.createTiffin({
        ...req.body,
        sellerId: seller._id,
      });

      res.status(201).json(tiffin);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/seller/tiffins/:id", authenticateToken, requireRole("seller"), async (req: AuthRequest, res) => {
    try {
      const seller = await storage.getSellerByUserId(req.userId!);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      const tiffin = await storage.getTiffinById(req.params.id);
      if (!tiffin || tiffin.sellerId !== seller._id) {
        return res.status(404).json({ message: "Tiffin not found" });
      }

      const updated = await storage.updateTiffin(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/seller/tiffins/:id", authenticateToken, requireRole("seller"), async (req: AuthRequest, res) => {
    try {
      const seller = await storage.getSellerByUserId(req.userId!);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      const tiffin = await storage.getTiffinById(req.params.id);
      if (!tiffin || tiffin.sellerId !== seller._id) {
        return res.status(404).json({ message: "Tiffin not found" });
      }

      await storage.deleteTiffin(req.params.id);
      res.json({ message: "Tiffin deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/seller/bookings", authenticateToken, requireRole("seller"), async (req: AuthRequest, res) => {
    try {
      const seller = await storage.getSellerByUserId(req.userId!);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      const bookings = await storage.getBookingsBySellerId(seller._id);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Public tiffin routes
  app.get("/api/tiffins", async (req, res) => {
    try {
      const tiffins = await storage.getTiffinsWithActiveSellers();
      res.json(tiffins);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/tiffins/:id", async (req, res) => {
    try {
      const tiffin = await storage.getTiffinWithSellerById(req.params.id);
      if (!tiffin) {
        return res.status(404).json({ message: "Tiffin not found" });
      }

      res.json(tiffin);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Booking routes
  app.post("/api/bookings", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const booking = await storage.createBooking(req.body);

      const tiffin = await storage.getTiffinById(booking.tiffinId);
      const seller = await storage.getSellerById(booking.sellerId);

      if (tiffin && seller) {
        const sellerUser = await storage.getUserById(seller.userId);

        if (sellerUser) {
          await sendBookingConfirmationToCustomer(
            booking.customerEmail,
            booking.customerName,
            tiffin.title,
            seller.shopName,
            seller.contactNumber,
            new Date(booking.date).toLocaleDateString(),
            booking.slot,
            booking.quantity,
            booking.totalPrice
          );

          await sendBookingNotificationToSeller(
            sellerUser.email,
            seller.shopName,
            booking.customerName,
            booking.customerPhone,
            booking.deliveryAddress,
            tiffin.title,
            new Date(booking.date).toLocaleDateString(),
            booking.slot,
            booking.quantity,
            booking.totalPrice
          );
        }
      }

      res.status(201).json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bookings/my", authenticateToken, requireRole("customer"), async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserById(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const bookings = await storage.getBookingsByEmail(user.email);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/sellers", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const sellers = await storage.getAllSellersWithUsers();
      res.json(sellers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/sellers/:id/status", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const { status } = req.body;

      if (!["pending", "active", "suspended"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const seller = await storage.getSellerById(req.params.id);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      const updated = await storage.updateSellerStatus(req.params.id, status);

      const sellerUser = await storage.getUserById(seller.userId);
      if (sellerUser) {
        await sendSellerStatusUpdate(sellerUser.email, seller.shopName, status);
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/bookings", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const bookings = await storage.getAllBookingsWithDetails();
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
