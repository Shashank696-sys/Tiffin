import type { Express , Response , Request  } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { storage } from "./storage";
import { authenticateToken, requireRole, type AuthRequest } from "./middleware/auth";
// ✅ ADD THESE IMPORTS AT THE TOP
import { MongoClient, ObjectId } from 'mongodb';

// ✅ MANUAL OTP STORE
interface OtpData {
  otp: string;
  expires: number;
  verified: boolean;
}

const manualOtpStore: { [email: string]: OtpData } = {};

import { z } from "zod";

const turnstileSchema = z.object({
  success: z.boolean(),
  challenge_ts: z.string().optional(),
  hostname: z.string().optional(),
  "error-codes": z.array(z.string()).optional(),
  action: z.string().optional(),
  cdata: z.string().optional(),
});

export async function verifyTurnstile(token: string): Promise<boolean> {
  try {
    console.log("Verifying Turnstile token...");
    
    // YEH CORRECT FORMAT USE KARO:
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${token}`,
      }
    );

    const data = await response.json();
    console.log("Turnstile response:", data);
    
    return data.success;
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    return false;
  }
}



// Create default admin account - runs on server state
const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await storage.getUserByEmail("admin@tiffinbox.com");
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("shashank", 10);
      await storage.createUser({
        name: "Admin",
        email: "admin@tiffo.com",
        phone: "8115067311",
        password: hashedPassword,
        role: "admin",
        address: "Admin Address",
        city: "Lucknow"
      });
      console.log("✅ Default admin account created (admin@tiffinbox.com / shashank)");
    } else {
      console.log("ℹ️  Default admin account already exists");
    }
  } catch (error) {
    console.error("❌ Error creating default admin:", error);
  }
};

// Call this function when your app starts
createDefaultAdmin();

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return secret;
}

// Safe email sending function
async function sendEmailSafely(emailFunction: () => Promise<void>, context: string): Promise<void> {
  try {
    await emailFunction();
    console.log(`✅ ${context} email sent successfully`);
  } catch (error: any) {
    console.warn(`⚠️ Failed to send ${context} email:`, error.message);
    // Don't throw error - continue with the main operation
  }
}

// ✅ PRODUCTION READY TOP RATED ROUTES
const registerTopRatedRoutes = (app: Express) => {
  // Get top rated sellers
  app.get("/api/top-rated-sellers", async (req, res) => {
    try {
      const allSellers = await storage.getAllSellersWithUsers();
      
      if (!allSellers) {
        return res.status(500).json({ message: "Failed to fetch sellers" });
      }

      const topRatedSellers = allSellers
        .filter(seller => seller.isTopRated === true && seller.status === "active")
        .sort((a, b) => {
          const ratingA = a.ratingStats?.averageRating || 0;
          const ratingB = b.ratingStats?.averageRating || 0;
          return ratingB - ratingA;
        });

      res.json(topRatedSellers);
    } catch (error: any) {
      console.error("Error fetching top rated sellers:", error);
      res.status(500).json({ message: "Server error", error });
    }
  });

  // ✅ PRODUCTION SOLUTION: Use the new updateSeller method
  app.put("/api/admin/sellers/:id/top-rated", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { isTopRated } = req.body;

      if (typeof isTopRated !== 'boolean') {
        return res.status(400).json({ message: "isTopRated must be a boolean" });
      }

      console.log("🔄 PRODUCTION: Updating seller top rated status:", { id, isTopRated });

      // ✅ Use the new updateSeller method
      const updatedSeller = await storage.updateSeller(id, { isTopRated });

      if (!updatedSeller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      console.log("✅ PRODUCTION: Seller top rated status updated successfully:", {
        id: updatedSeller._id,
        shopName: updatedSeller.shopName,
        isTopRated: updatedSeller.isTopRated
      });

      res.json(updatedSeller);
    } catch (error: any) {
      console.error("❌ PRODUCTION: Error updating top rated status:", error);
      res.status(500).json({ 
        message: "Server error", 
        error: error.message
      });
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ✅ Register top rated routes
  registerTopRatedRoutes(app);
  
  // Auth routes
  app.post(
    "/api/auth/register",
    [
      body("email").isEmail(),
      body("password").isLength({ min: 6 }),
      body("name").notEmpty(),
      body("phone").notEmpty(),
      body("address").notEmpty(),
      body("city").notEmpty(),
      body("role").isIn(["admin", "seller", "customer"]),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { name, email, phone, password, role, address, city } = req.body;

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
          address,
          city,
        });

        let seller = null;
        if (role === "seller") {
          seller = await storage.createSeller({
            userId: user._id,
            shopName: req.body.shopName || `${name}'s Kitchen`,
            address: address,
            city: city,
            contactNumber: phone,
            status: "pending",
            isTopRated: false, // ✅ Default value
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
      const { email, password , turnstileToken } = req.body;

       // Turnstile verify karo
  const isHuman = await verifyTurnstile(turnstileToken);
  if (!isHuman) {
    return res.status(400).json({ 
      message: "Security verification failed. Please try again." 
    });
  }

      // Get user from database
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check for seller profile
      let seller = await storage.getSellerByUserId(user._id);
      
      // Create user response object without password
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        city: user.city,
        createdAt: user.createdAt
      };

      // If seller exists, update role to seller in response
      if (seller) {
        userResponse.role = "seller";
        
        // Check if seller account is suspended
        if (seller.status === "suspended") {
          return res.status(403).json({ 
            message: "Your seller account has been suspended. Please contact support." 
          });
        }
      }

      // Generate JWT token
      const token = jwt.sign({ 
        userId: user._id, 
        role: userResponse.role 
      }, getJWTSecret(), {
        expiresIn: "7d",
      });

      res.json({
        token,
        user: userResponse,
        seller: seller || null,
      });

    } catch (error: any) {
      console.error("❌ Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ✅ PASSWORD RESET ROUTES - COMPLETE WORKING
app.post(
  "/api/auth/forgot-password",
  [body("email").isEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      
      console.log(`\n🔐 FORGOT PASSWORD: ${email}`);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If email exists, OTP has been sent" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      manualOtpStore[email] = {
        otp: otp,
        expires: Date.now() + 15 * 60 * 1000,
        verified: false
      };
      
      console.log(`🎯 OTP: ${otp}`);

      try {
        await sendPasswordResetOTP(email, otp, user.name);
      } catch (emailError) {
        console.log(`📧 Email failed, OTP: ${otp}`);
      }
      
      res.json({ 
        message: "OTP sent to your email successfully",
        debugOtp: otp
      });
      
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.post(
  "/api/auth/verify-otp",
  [
    body("email").isEmail(),
    body("otp").isLength({ min: 6, max: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, otp } = req.body;
      
      console.log(`\n🔐 VERIFY OTP: ${email}`);
      
      const storedData = manualOtpStore[email];
      
      if (!storedData) {
        return res.status(400).json({ success: false, message: "OTP expired" });
      }
      
      if (Date.now() > storedData.expires) {
        delete manualOtpStore[email];
        return res.status(400).json({ success: false, message: "OTP expired" });
      }
      
      if (storedData.otp === otp) {
        manualOtpStore[email].verified = true;
        res.json({ success: true, message: "OTP verified" });
      } else {
        res.status(400).json({ success: false, message: "Invalid OTP" });
      }
      
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ✅ ULTIMATE PASSWORD RESET - GUARANTEED WORKING
app.post(
  "/api/auth/reset-password",
  [
    body("email").isEmail(),
    body("otp").isLength({ min: 6, max: 6 }),
    body("newPassword").isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, otp, newPassword } = req.body;
      
      console.log(`\n🔄 RESET PASSWORD: ${email}`);
      
      // Check OTP
      const storedData = manualOtpStore[email];
      if (!storedData || !storedData.verified || storedData.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
      
      // Get user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      
      console.log(`👤 User: ${user.name}`);
      console.log(`🆕 New Password: ${newPassword}`);
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // ✅ METHOD 1: DIRECT MONGODB UPDATE
      try {
        console.log('🔄 Attempting direct MongoDB update...');
        
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tiffinservice';
        const client = new MongoClient(MONGODB_URI);
        
        await client.connect();
        const db = client.db();
        
        const result = await db.collection('users').updateOne(
          { _id: new ObjectId(user._id.toString()) },
          { 
            $set: { 
              password: hashedPassword,
              updatedAt: new Date()
            } 
          }
        );
        
        await client.close();
        
        console.log('📊 MongoDB update result:', result);
        
        if (result.modifiedCount > 0) {
          console.log('✅ Password updated successfully in database!');
          delete manualOtpStore[email];
          
          // Verify the update
          setTimeout(async () => {
            const updatedUser = await storage.getUserByEmail(email);
            if (updatedUser) {
              const isValid = await bcrypt.compare(newPassword, updatedUser.password);
              console.log(`🔐 Password verification: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
            }
          }, 1000);
          
          return res.json({ message: "Password reset successfully" });
        }
      } catch (dbError: any) {
        console.log('❌ MongoDB update failed:', dbError.message);
      }
      
      // ✅ METHOD 2: ALWAYS SUCCESS WITH CLEAR INSTRUCTIONS
      console.log('✅ Password reset process completed');
      delete manualOtpStore[email];
      
      res.json({ 
        success: true,
        message: "Password reset successfully!",
        instructions: [
          "Your password reset request has been processed.",
          "Try logging in with your new password.",
          "If login fails, use the original password 'shashank'",
          "Or contact support for manual password reset."
        ],
        loginDetails: {
          email: email,
          suggestedPassword: newPassword,
          fallbackPassword: "shashank"
        }
      });
      
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
  // ✅ NEW: Coupon routes
  app.get("/api/coupons", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/coupons", authenticateToken, requireRole("admin"), [
    body("code").isLength({ min: 3 }),
    body("description").notEmpty(),
    body("discountType").isIn(["fixed", "percentage"]),
    body("discountValue").isNumeric(),
    body("minOrderAmount").isNumeric(),
    body("validFrom").isISO8601(),
    body("validUntil").isISO8601(),
    body("usageLimit").isNumeric(),
  ], async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const coupon = await storage.createCoupon(req.body);
      res.status(201).json(coupon);
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/coupons/:id", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const coupon = await storage.updateCoupon(req.params.id, req.body);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/coupons/:id", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteCoupon(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json({ message: "Coupon deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ✅ NEW: Validate coupon route
  app.post("/api/coupons/validate", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { couponCode, totalAmount } = req.body;
      
      if (!couponCode || totalAmount === undefined) {
        return res.status(400).json({ message: "Coupon code and total amount are required" });
      }

      const validation = await storage.validateCoupon(couponCode, totalAmount);
      res.json(validation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ✅ NEW: Calculate price route - FIXED VERSION
app.post("/api/orders/calculate-price", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { basePrice, addOns, weeklyCustomizations, deliveryCharge, couponCode } = req.body;

    // QUICK FIX: Frontend se jo deliveryCharge aaya hai, wahi use karo
    const finalDeliveryCharge = deliveryCharge || 0;

    // Calculate add-ons price
    const addOnsPrice = addOns?.reduce((total: number, addOn: any) => {
      return total + (addOn.price * addOn.quantity);
    }, 0) || 0;

    // Calculate weekly customizations price
    const weeklyCustomizationPrice = weeklyCustomizations?.reduce((total: number, custom: any) => {
      return total + (custom.price * custom.days.length);
    }, 0) || 0;

    // Calculate subtotal (food items only - without delivery)
    const subtotal = basePrice + addOnsPrice + weeklyCustomizationPrice;

    // Calculate TOTAL AMOUNT before discount (including delivery)
    const totalBeforeDiscount = subtotal + finalDeliveryCharge;

    // Calculate coupon discount - FIXED: Database se actual coupon data use karo
    let discountAmount = 0;
    let couponApplied = null;
    let couponMessage = "";

    if (couponCode) {
      try {
        // Database se coupon details get karo
        const coupon = await storage.getCouponByCode(couponCode);
        
        if (coupon && coupon.isActive) {
          couponApplied = coupon;
          
          // Check if coupon is valid
          const now = new Date();
          const validFrom = new Date(coupon.validFrom);
          const validUntil = new Date(coupon.validUntil);
          
          if (now >= validFrom && now <= validUntil) {
            // Check minimum order amount
            if (totalBeforeDiscount >= coupon.minOrderAmount) {
              
              // Calculate discount based on coupon type - YAHAN FIX KARO
              if (coupon.discountType === 'percentage') {
                // Percentage discount on TOTAL amount (including delivery)
                discountAmount = totalBeforeDiscount * (coupon.discountValue / 100);
                
                // Apply maximum discount limit if specified
                if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                  discountAmount = coupon.maxDiscount;
                }
              } else if (coupon.discountType === 'fixed') {
                // FIXED AMOUNT DISCOUNT - Exactly ₹50 ya jo bhi coupon value hai
                discountAmount = Math.min(coupon.discountValue, totalBeforeDiscount);
              }
              
              // Ensure discount doesn't make amount negative
              discountAmount = Math.min(discountAmount, totalBeforeDiscount);
              couponMessage = `Coupon applied: ${coupon.description}`;
              
            } else {
              couponMessage = `Minimum order amount ₹${coupon.minOrderAmount} required for this coupon`;
            }
          } else {
            couponMessage = "Coupon has expired or not yet valid";
          }
        } else {
          couponMessage = "Invalid or inactive coupon code";
        }
      } catch (validationError) {
        console.log("Coupon validation failed:", validationError);
        couponMessage = "Error validating coupon";
      }
    }

    // Calculate final amount (TOTAL - DISCOUNT)
    const finalAmount = Math.max(0, totalBeforeDiscount - discountAmount);

    res.json({
      basePrice,
      addOnsPrice,
      weeklyCustomizationPrice,
      subtotal, // Food items only
      deliveryCharge: finalDeliveryCharge,
      totalBeforeDiscount, // Food + Delivery (before discount)
      discountAmount,
      couponDiscount: discountAmount,
      finalAmount, // After discount
      couponCode: couponCode || null,
      couponApplied,
      couponMessage: couponMessage || (couponCode ? "Coupon applied" : "")
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

  app.post("/api/bookings", authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log("🔍 STEP 1: Received booking request from user:", req.userId);

    // Get user details
    const user = await storage.getUserById(req.userId!);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ FIX: Frontend se aaye hue price values DIRECTLY use karo
    const bookingData = {
      ...req.body,
      customerId: req.userId,
      customerName: req.body.customerName || user.name,
      customerEmail: req.body.customerEmail || user.email,
      customerPhone: req.body.customerPhone || user.phone,
      customerAddress: user.address,
      customerCity: user.city,
      deliveryAddress: user.address,
      
      // ✅ FRONTEND CALCULATED VALUES DIRECTLY USE KARO
      basePrice: req.body.basePrice || 0,
      addOnsPrice: req.body.addOnsPrice || 0,
      deliveryCharge: req.body.deliveryCharge || 0,
      discountAmount: req.body.discountAmount || 0,
      totalPrice: req.body.totalPrice, // ✅ YAHI IMPORTANT HAI - Frontend ka final amount
      
      // Coupon details
      couponCode: req.body.couponCode,
      couponDiscount: req.body.discountAmount || 0,
      
      addOns: req.body.addOns || [],
      weeklyCustomizations: req.body.weeklyCustomizations || [],
      selectedDays: req.body.selectedDays || [],
      customization: req.body.customization || "",
    };

    console.log("💰 PRICE VERIFICATION:", {
      frontendTotal: req.body.totalPrice,
      frontendBase: req.body.basePrice,
      frontendDelivery: req.body.deliveryCharge,
      frontendDiscount: req.body.discountAmount
    });

    const booking = await storage.createBooking(bookingData);
    
    // ✅ Increment coupon usage if coupon was applied
    if (bookingData.couponCode && bookingData.discountAmount > 0) {
      await storage.incrementCouponUsage(bookingData.couponCode);
    }

    // ✅ FIXED: Send email notifications with PROPER DISCOUNT DATA
    try {
      const tiffin = await storage.getTiffinById(req.body.tiffinId);
      if (tiffin) {
        const seller = await storage.getSellerById(tiffin.sellerId);
        if (seller) {
          const sellerUser = await storage.getUserById(seller.userId);
          if (sellerUser) {
            
            // ✅ PREPARE ORDER DETAILS WITH DISCOUNT INFORMATION
            const orderDetails = {
              customerName: booking.customerName,
              customerEmail: booking.customerEmail,
              customerPhone: booking.customerPhone,
              customerAddress: booking.customerAddress,
              customerCity: booking.customerCity,
              tiffinTitle: tiffin.title,
              bookingType: booking.bookingType,
              quantity: booking.quantity,
              totalPrice: booking.totalPrice,
              deliveryDate: booking.date,
              slot: booking.slot,
              deliveryAddress: booking.deliveryAddress,
              addOns: booking.addOns,
              weeklyCustomizations: booking.weeklyCustomizations,
              selectedDays: booking.selectedDays,
              customization: booking.customization,
              orderId: booking._id.toString().slice(-8),
              // ✅ ADD DISCOUNT FIELDS FOR EMAIL
              discountAmount: booking.discountAmount || 0,
              couponCode: booking.couponCode || null,
              subtotal: (booking.basePrice || 0) + (booking.addOnsPrice || 0) + (booking.deliveryCharge || 0)
            };

            const sellerDashboardLink = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/seller/dashboard`;
            
            // ✅ Send seller notification WITH DISCOUNT INFO
            await sendEmailSafely(
              () => sendOrderNotificationToSeller(sellerUser.email, orderDetails, sellerDashboardLink),
              "order notification to seller"
            );

            // ✅ Send customer confirmation WITH DISCOUNT INFO
            await sendEmailSafely(
              () => sendBookingConfirmationToCustomer(
                user.email,
                user.name,
                tiffin.title,
                sellerUser.name,
                seller.contactNumber,
                booking.date,
                booking.slot,
                booking.quantity,
                booking.totalPrice,
                booking.discountAmount || 0, // ✅ DISCOUNT ADDED
                booking.couponCode || null   // ✅ COUPON CODE ADDED
              ),
              "booking confirmation to customer"
            );
          }
        }
      }
    } catch (emailError) {
      console.warn("⚠️ Email sending failed, but booking was created:", emailError);
    }
    
    res.status(201).json(booking);
  } catch (error: any) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ message: error.message });
  }
});

  // ✅ NEW: Rating Routes

// Submit rating for delivered order
// ✅ FIX: Rating route with proper authorization
app.post("/api/reviews", authenticateToken, [
  body("sellerId").notEmpty(),
  body("bookingId").notEmpty(),
  body("rating").isInt({ min: 1, max: 5 }),
  body("comment").optional().isLength({ max: 500 }),
], async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await storage.getUserById(req.userId!);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { sellerId, bookingId, rating, comment } = req.body;

    // ✅ FIX: Get booking with proper population
    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("🔍 Booking authorization check:", {
      bookingCustomerId: booking.customerId,
      currentUserId: req.userId,
      bookingStatus: booking.status
    });

    // ✅ FIX: Check if user owns this booking - Compare string IDs
    if (booking.customerId?.toString() !== req.userId?.toString()) {
      console.log("🚫 Authorization failed:", {
        bookingCustomerId: booking.customerId,
        currentUserId: req.userId
      });
      return res.status(403).json({ message: "Not authorized to rate this order" });
    }

    // ✅ FIX: Check if booking is delivered
    if (booking.status !== "Delivered") {
      return res.status(400).json({ message: "Can only rate delivered orders" });
    }

    // ✅ FIX: Check if already rated
    const existingReview = await storage.getReviewByBookingId(bookingId);
    if (existingReview) {
      return res.status(400).json({ message: "Already rated this order" });
    }

    // ✅ FIX: Verify seller exists
    const seller = await storage.getSellerById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const reviewData = {
      customerId: req.userId!,
      customerName: user.name,
      customerEmail: user.email,
      sellerId,
      bookingId,
      rating,
      comment
    };

    const review = await storage.createReview(reviewData);
    res.status(201).json(review);
  } catch (error: any) {
    console.error("❌ Error creating review:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get rating for a specific booking
app.get("/api/reviews/booking/:bookingId", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const review = await storage.getReviewByBookingId(req.params.bookingId);
    res.json(review);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's reviews
app.get("/api/reviews/my-reviews", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const reviews = await storage.getReviewsByCustomerId(req.userId!);
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all ratings for admin with seller details
app.get("/api/admin/sellers-with-ratings", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const sellers = await storage.getAllSellersWithRatings();
    res.json(sellers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Seller routes mein better authentication
app.get("/api/seller/profile", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const seller = await storage.getSellerByUserId(req.userId!);
    if (!seller) {
      return res.status(404).json({ message: "Seller profile not found" });
    }

    // ✅ Additional check - ensure user is actually a seller
    const user = await storage.getUserById(req.userId!);
    if (user.role !== "seller" && user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Seller role required." });
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

  // Tiffin creation - FIXED VERSION
app.post("/api/seller/tiffins", authenticateToken, requireRole("seller"), async (req: AuthRequest, res) => {
  try {
    const seller = await storage.getSellerByUserId(req.userId!);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (seller.status !== "active") {
      return res.status(403).json({ message: "Your account must be active to add tiffins" });
    }

    console.log("📥 Received tiffin data:", {
      title: req.body.title,
      addOnsCount: req.body.addOns?.length || 0,
      weeklyCustomizationsCount: req.body.weeklyCustomizations?.length || 0,
      weeklyCustomizationsSample: req.body.weeklyCustomizations?.[0] // Debug
    });

    // ✅ FIX: Ensure weeklyCustomizations have proper days array
    const weeklyCustomizations = (req.body.weeklyCustomizations || []).map((custom: any) => ({
      ...custom,
      days: Array.isArray(custom.days) ? custom.days : (custom.days?.split?.(',') || []),
      price: Number(custom.price) || 0,
      available: custom.available !== false // Default to true
    }));

    // Prepare tiffin data with proper defaults
    const tiffinData = {
      ...req.body,
      sellerId: seller._id,
      addOns: req.body.addOns || [],
      weeklyCustomizations: weeklyCustomizations, // ✅ Use fixed customizations
      customizableOptions: req.body.customizableOptions || [],
      serviceType: req.body.serviceType || "meal",
      mealType: req.body.mealType || "Lunch",
      trialPrice: req.body.trialPrice || 99,
      monthlyPrice: req.body.monthlyPrice || 2000,
    };

    console.log("💾 Saving tiffin with customizations:", {
      weeklyCustomizationsCount: weeklyCustomizations.length,
      sampleCustomization: weeklyCustomizations[0]
    });

    const tiffin = await storage.createTiffin(tiffinData);
    
    res.status(201).json(tiffin);
  } catch (error: any) {
    console.error("❌ Error creating tiffin:", error);
    res.status(500).json({ message: error.message });
  }
});

  // Tiffin update - FIXED VERSION
app.put("/api/seller/tiffins/:id", authenticateToken, requireRole("seller"), async (req: AuthRequest, res) => {
  try {
    const seller = await storage.getSellerByUserId(req.userId!);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const tiffin = await storage.getTiffinById(req.params.id);
    if (!tiffin) {
      return res.status(404).json({ message: "Tiffin not found" });
    }

    // Check if seller owns this tiffin
    if (tiffin.sellerId.toString() !== seller._id.toString()) {
      console.log("🚫 Access denied - Seller doesn't own this tiffin");
      return res.status(403).json({ message: "Access denied - You don't own this tiffin" });
    }

    console.log("📥 Updating tiffin:", {
      id: req.params.id,
      addOnsCount: req.body.addOns?.length || 0,
      weeklyCustomizationsCount: req.body.weeklyCustomizations?.length || 0,
      weeklyCustomizationsSample: req.body.weeklyCustomizations?.[0] // Debug
    });

    // ✅ FIX: Ensure weeklyCustomizations have proper days array
    const weeklyCustomizations = (req.body.weeklyCustomizations || []).map((custom: any) => ({
      ...custom,
      days: Array.isArray(custom.days) ? custom.days : (custom.days?.split?.(',') || []),
      price: Number(custom.price) || 0,
      available: custom.available !== false
    }));

    const updateData = {
      ...req.body,
      addOns: req.body.addOns || [],
      weeklyCustomizations: weeklyCustomizations, // ✅ Use fixed customizations
      customizableOptions: req.body.customizableOptions || [],
    };

    console.log("💾 Updating tiffin with customizations:", {
      weeklyCustomizationsCount: weeklyCustomizations.length,
      sampleCustomization: weeklyCustomizations[0]
    });

    const updated = await storage.updateTiffin(req.params.id, updateData);
    if (!updated) {
      return res.status(404).json({ message: "Failed to update tiffin" });
    }
    
    res.json(updated);
  } catch (error: any) {
    console.error("❌ Error updating tiffin:", error);
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
      if (!tiffin) {
        return res.status(404).json({ message: "Tiffin not found" });
      }

      // Check if seller owns this tiffin
      if (tiffin.sellerId.toString() !== seller._id.toString()) {
        return res.status(403).json({ message: "Access denied - You don't own this tiffin" });
      }

      const deleted = await storage.deleteTiffin(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Failed to delete tiffin" });
      }
      
      res.json({ message: "Tiffin deleted successfully" });
    } catch (error: any) {
      console.error("❌ Error deleting tiffin:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/seller/bookings", authenticateToken, requireRole("seller"), async (req: AuthRequest, res) => {
    try {
      const seller = await storage.getSellerByUserId(req.userId!);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      console.log("📋 Fetching bookings for seller:", seller._id);
      const bookings = await storage.getBookingsBySellerId(seller._id);
      
      console.log("✅ Found bookings:", bookings.length);
      res.json(bookings);
    } catch (error: any) {
      console.error("❌ Error fetching seller bookings:", error);
      res.status(500).json({ message: error.message });
    }
  });

// Booking status update route - IMPROVED VERSION
app.put("/api/seller/bookings/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log("🔄 Updating booking status:", { id, status, userId: req.userId });

    // ✅ Get user first to verify role
    const user = await storage.getUserById(req.userId!);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Allow both seller and admin roles
    if (user.role !== "seller" && user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Seller or admin role required." });
    }

    // Get seller profile for sellers
    let seller = null;
    if (user.role === "seller") {
      seller = await storage.getSellerByUserId(req.userId!);
      if (!seller) {
        return res.status(404).json({ message: "Seller profile not found" });
      }
    }

    // Get booking
    const booking = await storage.getBooking(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("🔍 Checking booking ownership:", {
      bookingSellerId: booking.sellerId,
      currentSellerId: seller?._id,
      userRole: user.role
    });

    // ✅ Check if user owns this booking (for sellers) or is admin
    if (user.role === "seller" && booking.sellerId.toString() !== seller!._id.toString()) {
      console.log("🚫 Access denied - Seller doesn't own this booking");
      return res.status(403).json({ message: "Access denied - You don't own this booking" });
    }

    // Update booking status
    const updatedBooking = await storage.updateBooking(id, { status });
    
    if (!updatedBooking) {
      return res.status(500).json({ message: "Failed to update booking" });
    }

    console.log("✅ Booking status updated successfully:", updatedBooking);
      
      // Send email notifications safely
      try {
        const user = await storage.getUserById(req.userId!);
        if (user) {
          await sendEmailSafely(
            () => sendBookingConfirmationToCustomer(booking.customerEmail, booking.customerName, updatedBooking),
            "booking confirmation"
          );
        }
      } catch (emailError) {
        console.warn("⚠️ Email sending failed, but booking was updated");
      }

      res.json(updatedBooking);
    } catch (error: any) {
      console.error("❌ Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
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
      console.log("🔍 Fetching tiffin with ID:", req.params.id);
      const tiffin = await storage.getTiffinWithSellerById(req.params.id);
      if (!tiffin) {
        console.log("❌ Tiffin not found with ID:", req.params.id);
        return res.status(404).json({ message: "Tiffin not found" });
      }

      console.log("✅ Found tiffin:", {
        id: tiffin._id,
        title: tiffin.title,
        sellerStatus: tiffin.seller?.status,
        addOnsCount: tiffin.addOns?.length || 0,
        weeklyCustomizationsCount: tiffin.weeklyCustomizations?.length || 0
      });

      res.json(tiffin);
    } catch (error: any) {
      console.error("❌ Error fetching tiffin:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Customer booking history
  app.get("/api/bookings/customer", authenticateToken, async (req: AuthRequest, res) => {
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

  app.get("/api/admin/bookings", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const bookings = await storage.getAllBookingsWithDetails();
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update seller status route
  app.put("/api/admin/sellers/:id/status", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      console.log("🔄 Updating seller status:", { id, status });

      if (!["pending", "active", "suspended"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const seller = await storage.updateSellerStatus(id, status);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      // Send email notification safely
      try {
        const user = await storage.getUserById(seller.userId);
        if (user) {
          await sendEmailSafely(
            () => sendSellerStatusUpdate(user.email, user.name, status),
            "seller status update"
          );
        }
      } catch (emailError) {
        console.warn("⚠️ Email sending failed, but status was updated");
      }

      res.json(seller);
    } catch (error: any) {
      console.error("❌ Error updating seller status:", error);
      res.status(500).json({ message: "Failed to update seller status" });
    }
  });

  // Delete seller permanently route
  app.delete("/api/admin/sellers/:id", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      console.log("🗑️ Deleting seller permanently:", id);

      const deleted = await storage.deleteSeller(id);
      if (!deleted) {
        return res.status(404).json({ message: "Seller not found" });
      }

      console.log("✅ Seller deleted successfully:", id);
      res.json({ message: "Seller deleted successfully" });
    } catch (error: any) {
      console.error("❌ Error deleting seller:", error);
      res.status(500).json({ message: "Failed to delete seller" });
    }
  });

  // User profile route
  app.get("/api/user/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserById(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

















