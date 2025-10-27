import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectDB } from "./db";
import { createDefaultAdmin } from "./seed";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";
import { fileURLToPath } from "url";

// ✅ ES Module compatible __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment variables at the top
dotenv.config();

const app = express();

// ✅ SECURITY MIDDLEWARE - ORDER MATTERS!

// 1. Helmet - Security headers (production mein thoda adjust karo)
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
      fontSrc: ["'self'", "https:", "http:"],
      connectSrc: ["'self'"],
    },
  } : false,
  crossOriginEmbedderPolicy: false
}));

// 2. CORS - Configure properly
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Production mein sab allow karo
    : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:10000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 3. Body parser with limits
app.use(express.json({ 
  limit: '10kb'
}));
app.use(express.urlencoded({ 
  extended: false, 
  limit: '10kb' 
}));

// 4. Data sanitization against NoSQL injection
app.use(mongoSanitize());

// 5. Prevent parameter pollution
app.use(hpp());

// 6. Rate limiting (development me thoda relaxed)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many login attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limits
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ✅ Check JWT secret presence
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET missing in .env file!");
  process.exit(1);
} else {
  console.log("✅ JWT_SECRET loaded successfully");
}

// ✅ Request logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestPath = req.path;
  let capturedJsonResponse: any = undefined;

  const originalResJson = res.json.bind(res);

  res.json = ((body: any): Response => {
    capturedJsonResponse = body;
    return originalResJson(body);
  }) as typeof res.json;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith("/api")) {
      let logLine = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
          logLine += " :: [unserializable response]";
        }
      }
      if (logLine.length > 120) logLine = logLine.slice(0, 119) + "…";
      log ? log(logLine) : console.log(logLine);
    }
  });

  next();
});

// ✅ Main async block
(async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    await createDefaultAdmin();

    // Register all routes
    const server = await registerRoutes(app);

    // ✅ IMPORTANT: Static files setup - PRODUCTION FIX
    if (process.env.NODE_ENV === 'production') {
      console.log("📁 Serving static files from dist/public...");
      
      // ✅ FIXED: Use process.cwd() for reliable path
      const publicPath = path.join(process.cwd(), 'dist', 'public');
      console.log(`📂 Static files path: ${publicPath}`);
      
      // Static files serve karo
      app.use(express.static(publicPath));
      
      // SPA support - all routes to index.html
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(publicPath, 'index.html'));
      });
      
      console.log("✅ Production static files configured");
    } else {
      console.log("🔧 Setting up Vite dev server...");
      await setupVite(app, server);
    }

    // ✅ Root route
    app.get("/", (req: Request, res: Response) => {
      if (process.env.NODE_ENV === "development") {
        res.redirect("http://localhost:3000");
      } else {
        res.json({ 
          message: "Tiffin Service API is running!",
          version: "1.0.0",
          status: "active",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || "development"
        });
      }
    });

    // ✅ Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("❌ Error:", err);
      res.status(status).json({ message });
    });

    // ✅ FIXED: Render.com compatible server start
    const port = parseInt(process.env.PORT || "10000", 10);
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

    server.listen(port, host, () => {
      const msg = `🚀 Server running at http://${host}:${port}`;
      log ? log(msg) : console.log(msg);
      
      if (process.env.NODE_ENV === 'production') {
        console.log("🌐 Production server ready!");
        console.log("✅ Static files should now load properly");
      } else {
        console.log("🌐 Dev Website: http://localhost:5000");
      }
    });

    server.on("error", (err: any) => {
      console.error("❌ Server failed to start:", err.message);
      process.exit(1);
    });

  } catch (err: any) {
    console.error("💥 Startup error:", err.message);
    process.exit(1);
  }
})();
