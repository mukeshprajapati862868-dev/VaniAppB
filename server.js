// // const dns = require("dns");

// // dns.setServers(["8.8.8.8", "1.1.1.1"]);

// // // ===============================
// // // ENV CONFIG
// // // ===============================

// // require("dotenv").config();

// // // ===============================
// // // DATABASE
// // // ===============================

// // const connectDB = require("./config/db");

// // // ===============================
// // // PACKAGES
// // // ===============================

// // const express = require("express");
// // const cors = require("cors");
// // const helmet = require("helmet");
// // const rateLimit = require("express-rate-limit");
// // const morgan = require("morgan");
// // const cookieParser = require("cookie-parser");
// // const mongoSanitize = require("express-mongo-sanitize");
// // const hpp = require("hpp");

// // // ===============================
// // // ROUTES
// // // ===============================

// // const authRoutes = require("./routes/auth");
// // const productRoutes = require("./routes/products");
// // // const cartRoutes = require("./routes/cart");
// // const bookingRoutes = require("./routes/bookings");
// // const userRoutes = require("./routes/users");
// // const adminRoutes = require("./routes/admin");
// // const serviceRoutes = require("./routes/serviceRoutes");
// // const settingsRoutes = 

// // // WORKER ROUTE ADD
// // const workerRoutes = require("./routes/workerRoutes");

// // // ===============================
// // // APP
// // // ===============================

// // const app = express();

// // const PORT = process.env.PORT || 5000;

// // app.set("trust proxy", 1);

// // app.disable("x-powered-by");

// // // ===============================
// // // SECURITY
// // // ===============================

// // app.use(helmet());

// // app.use(
// //     express.json({
// //         limit: "10kb"
// //     })
// // );

// // app.use(
// //     express.urlencoded({
// //         extended: true,
// //         limit: "10kb"
// //     })
// // );

// // app.use(cookieParser());

// // app.use(mongoSanitize());

// // app.use(hpp());

// // // ===============================
// // // CORS
// // // ===============================

// // // Allowed origins from ENV
// // const envOrigins = process.env.ALLOWED_ORIGINS
// //     ? process.env.ALLOWED_ORIGINS
// //         .split(",")
// //         .map((origin) => origin.trim())
// //         .filter(Boolean)
// //     : [];

// // // Default allowed origins
// // const allowedOrigins = [
// //     "http://localhost:3000",
// //     "http://localhost:5173",
// //     "http://localhost:8081",
// //     "http://localhost:19006",
// //     "http://127.0.0.1:3000",
// //     "http://127.0.0.1:5173",
// //     "http://127.0.0.1:8081",
// //     "http://127.0.0.1:19006",

// //     // ENV origins
// //     ...envOrigins
// // ];

// // // Remove duplicate origins
// // const uniqueAllowedOrigins = [
// //     ...new Set(allowedOrigins)
// // ];

// // console.log(
// //     "🌐 CORS Allowed Origins:",
// //     uniqueAllowedOrigins
// // );

// // const corsOptions = {
// //     origin: function (origin, callback) {

// //         // Mobile apps / server-to-server requests
// //         if (!origin) {
// //             return callback(null, true);
// //         }

// //         // Allow known origins
// //         if (uniqueAllowedOrigins.includes(origin)) {
// //             return callback(null, true);
// //         }

// //         // Allow localhost development ports
// //         if (
// //             origin.startsWith("http://localhost:") ||
// //             origin.startsWith("http://127.0.0.1:")
// //         ) {
// //             return callback(null, true);
// //         }

// //         // Keep development/mobile compatibility
// //         // without blocking the request
// //         return callback(null, true);
// //     },

// //     credentials: true,

// //     methods: [
// //         "GET",
// //         "POST",
// //         "PUT",
// //         "PATCH",
// //         "DELETE",
// //         "OPTIONS"
// //     ],

// //     allowedHeaders: [
// //         "Origin",
// //         "X-Requested-With",
// //         "Content-Type",
// //         "Accept",
// //         "Authorization",
// //         "Cache-Control",
// //         "Pragma"
// //     ],

// //     exposedHeaders: [
// //         "Authorization"
// //     ],

// //     optionsSuccessStatus: 204
// // };

// // // Main CORS middleware
// // app.use(cors(corsOptions));

// // // Explicit OPTIONS / preflight handling
// // app.options(/.*/, cors(corsOptions));

// // // ===============================
// // // RATE LIMIT
// // // ===============================

// // const limiter = rateLimit({

// //     windowMs: 15 * 60 * 1000,

// //     max: 100,

// //     message: {
// //         error: "Too many requests"
// //     }

// // });

// // app.use("/api/", limiter);

// // // ===============================
// // // LOGGER
// // // ===============================

// // app.use(
// //     morgan(
// //         process.env.NODE_ENV === "development"
// //             ? "dev"
// //             : "combined"
// //     )
// // );

// // // ===============================
// // // HEALTH
// // // ===============================

// // app.get(
// //     [
// //         "/health",
// //         "/api/health"
// //     ],

// //     (req, res) => {

// //         res.json({

// //             status: "success",

// //             message: "Server is healthy and running.",

// //             timestamp: new Date()

// //         });

// //     }
// // );

// // // ===============================
// // // API ROUTES
// // // ===============================

// // app.use(
// //     "/api/auth",
// //     authRoutes
// // );

// // app.use(
// //     "/api/products",
// //     productRoutes
// // );

// // // app.use(
// // //     "/api/cart",
// // //     cartRoutes
// // // );

// // app.use(
// //     "/api/bookings",
// //     bookingRoutes
// // );

// // app.use(
// //     "/api/users",
// //     userRoutes
// // );

// // app.use(
// //     "/api/admin",
// //     adminRoutes
// // );
// // app.use("/api/admin/settings", settings);

// // // ===============================
// // // WORKER API ROUTES
// // // ===============================

// // app.use(
// //     "/api/workers",
// //     workerRoutes
// // );

// // // ===============================
// // // SERVICES API ROUTES
// // // ===============================

// // app.use(
// //     "/api/services",
// //     serviceRoutes
// // );

// // // ===============================
// // // ROOT ROUTE
// // // ===============================

// // app.get("/", (req, res) => {

// //     res.status(200).json({

// //         status: "success",

// //         message: "VaniAppB API is running successfully.",

// //         server: "VaniAppB",

// //         environment:
// //             process.env.NODE_ENV || "production",

// //         timestamp: new Date()

// //     });

// // });

// // // ===============================
// // // 404 ROUTE HANDLER
// // // ===============================

// // app.use(
// //     (req, res, next) => {

// //         res.status(404).json({

// //             error: "Endpoint not found"

// //         });

// //     }
// // );

// // // ===============================
// // // GLOBAL ERROR HANDLER
// // // ===============================

// // app.use(
// //     (err, req, res, next) => {

// //         console.error(
// //             "❌ Error:",
// //             err.stack
// //         );

// //         res.status(
// //             err.statusCode || 500
// //         )
// //             .json({

// //                 status: "error",

// //                 message:
// //                     err.message ||
// //                     "Internal Server Error",

// //                 stack:
// //                     process.env.NODE_ENV === "development"
// //                         ? err.stack
// //                         : undefined

// //             });

// //     }
// // );

// // // ===============================
// // // START SERVER
// // // ===============================

// // let server;

// // const startServer = async () => {

// //     try {

// //         await connectDB();

// //         console.log(
// //             "✅ MongoDB Connected Successfully"
// //         );

// //         // Drop userId_1 index if it exists
// //         const Worker = require("./models/Worker");

// //         try {

// //             await Worker.collection
// //                 .dropIndex("userId_1")
// //                 .catch(() => {});

// //         } catch (e) {

// //             // Ignore if index doesn't exist

// //         }

// //         server = app.listen(

// //             PORT,

// //             "0.0.0.0",

// //             () => {

// //                 console.log(
// //                     `🚀 Server running on port ${PORT}`
// //                 );

// //                 console.log(
// //                     `Environment: ${
// //                         process.env.NODE_ENV || "production"
// //                     }`
// //                 );

// //                 console.log(
// //                     "🌐 CORS enabled successfully"
// //                 );

// //             }

// //         );

// //     }

// //     catch (error) {

// //         console.error(
// //             "❌ MongoDB Connection Failed:",
// //             error.message
// //         );

// //         process.exit(1);

// //     }

// // };

// // // ===============================
// // // RUN SERVER
// // // ===============================

// // startServer();

// // // ===============================
// // // PROCESS ERROR HANDLING
// // // ===============================

// // process.on(
// //     "unhandledRejection",
// //     (error) => {

// //         console.error(
// //             "💥 UNHANDLED REJECTION:",
// //             error.message
// //         );

// //         if (server) {

// //             server.close(() => {

// //                 process.exit(1);

// //             });

// //         }

// //         else {

// //             process.exit(1);

// //         }

// //     }
// // );

// // process.on(
// //     "uncaughtException",
// //     (error) => {

// //         console.error(
// //             "💥 UNCAUGHT EXCEPTION:",
// //             error.message
// //         );

// //         process.exit(1);

// //     }
// // );

// // // ===============================
// // // EXPORT
// // // ===============================

// // module.exports = app;





// const dns = require("dns");
// // dns.setServers(["8.8.8.8", "1.1.1.1"]);
// // Prefer IPv4 first — important for Gmail SMTP on Render
// dns.setDefaultResultOrder("ipv4first");
// dns.setServers(["8.8.8.8", "1.1.1.1"]);
// // ===============================
// // ENV CONFIG
// // ===============================
// require("dotenv").config();

// // ===============================
// // DATABASE
// // ===============================
// const connectDB = require("./config/db");

// // ===============================
// // PACKAGES
// // ===============================
// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");
// const morgan = require("morgan");
// const cookieParser = require("cookie-parser");
// const mongoSanitize = require("express-mongo-sanitize");
// const hpp = require("hpp");

// // ===============================
// // ROUTES
// // ===============================
// const authRoutes = require("./routes/auth");
// const productRoutes = require("./routes/products");
// // const cartRoutes = require("./routes/cart");
// const bookingRoutes = require("./routes/bookings");
// const userRoutes = require("./routes/users");
// const adminRoutes = require("./routes/admin");
// const serviceRoutes = require("./routes/serviceRoutes");
// const workerRoutes = require("./routes/workerRoutes");
// const chatRoutes = require("./routes/chatRoutes");

// // Settings routes (GET/PUT /api/admin/settings)
// const settingsRoutes = require("./routes/settingsRoutes");

// // ===============================
// // APP
// // ===============================
// const app = express();
// const PORT = process.env.PORT || 5000;

// app.set("trust proxy", 1);
// app.disable("x-powered-by");

// // ===============================
// // SECURITY
// // ===============================
// app.use(helmet());
// app.use(
//   express.json({
//     limit: "10kb",
//   })
// );
// app.use(
//   express.urlencoded({
//     extended: true,
//     limit: "10kb",
//   })
// );
// app.use(cookieParser());
// app.use(mongoSanitize());
// app.use(hpp());

// // ===============================
// // CORS
// // ===============================
// const envOrigins = process.env.ALLOWED_ORIGINS
//   ? process.env.ALLOWED_ORIGINS.split(",")
//       .map((origin) => origin.trim())
//       .filter(Boolean)
//   : [];

// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:5173",
//   "http://localhost:8081",
//   "http://localhost:19006",
//   "http://127.0.0.1:3000",
//   "http://127.0.0.1:5173",
//   "http://127.0.0.1:8081",
//   "http://127.0.0.1:19006",
//   ...envOrigins,
// ];

// const uniqueAllowedOrigins = [...new Set(allowedOrigins)];

// console.log("🌐 CORS Allowed Origins:", uniqueAllowedOrigins);

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) {
//       return callback(null, true);
//     }
//     if (uniqueAllowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     if (
//       origin.startsWith("http://localhost:") ||
//       origin.startsWith("http://127.0.0.1:")
//     ) {
//       return callback(null, true);
//     }
//     return callback(null, true);
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: [
//     "Origin",
//     "X-Requested-With",
//     "Content-Type",
//     "Accept",
//     "Authorization",
//     "Cache-Control",
//     "Pragma",
//   ],
//   exposedHeaders: ["Authorization"],
//   optionsSuccessStatus: 204,
// };

// app.use(cors(corsOptions));
// app.options(/.*/, cors(corsOptions));

// // ===============================
// // RATE LIMIT
// // ===============================
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: {
//     error: "Too many requests",
//   },
// });
// app.use("/api/", limiter);

// // ===============================
// // LOGGER
// // ===============================
// app.use(
//   morgan(process.env.NODE_ENV === "development" ? "dev" : "combined")
// );

// // ===============================
// // HEALTH
// // ===============================
// app.get(["/health", "/api/health"], (req, res) => {
//   res.json({
//     status: "success",
//     message: "Server is healthy and running.",
//     timestamp: new Date(),
//   });
// });

// // ===============================
// // API ROUTES
// // ===============================
// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// // app.use("/api/cart", cartRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/admin", adminRoutes);

// // Settings: GET/PUT /api/admin/settings
// app.use("/api/admin/settings", settingsRoutes);

// app.use("/api/workers", workerRoutes);
// app.use("/api/services", serviceRoutes);

// // ===============================
// // ROOT ROUTE
// // ===============================
// app.get("/", (req, res) => {
//   res.status(200).json({
//     status: "success",
//     message: "VaniAppB API is running successfully.",
//     server: "VaniAppB",
//     environment: process.env.NODE_ENV || "production",
//     timestamp: new Date(),
//   });
// });

// // ===============================
// // 404 ROUTE HANDLER
// // ===============================
// app.use((req, res, next) => {
//   res.status(404).json({
//     error: "Endpoint not found",
//   });
// });




// // ===============================
// // CHATBOT ROUTE — 404 SE PEHLE
// // ===============================
// app.use("/api/chat", chatRoutes);

// // ===============================
// // ROOT ROUTE
// // ===============================
// app.get("/", (req, res) => {
//   res.status(200).json({
//     status: "success",
//     message: "VaniAppB API is running successfully.",
//     server: "VaniAppB",
//     environment: process.env.NODE_ENV || "production",
//     timestamp: new Date(),
//   });
// });

// // ===============================
// // 404 HANDLER — SABHI ROUTES KE BAAD
// // ===============================
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     error: "Endpoint not found",
//     path: req.originalUrl,
//   });
// });

// // ===============================
// // GLOBAL ERROR HANDLER
// // ===============================
// app.use((err, req, res, next) => {
//   console.error("❌ Error:", err.stack);
//   res.status(err.statusCode || 500).json({
//     status: "error",
//     message: err.message || "Internal Server Error",
//     stack:
//       process.env.NODE_ENV === "development" ? err.stack : undefined,
//   });
// });

// // ===============================
// // START SERVER
// // ===============================
// let server;

// const startServer = async () => {
//   try {
//     await connectDB();
//     console.log("✅ MongoDB Connected Successfully");

//     const Worker = require("./models/Worker");
//     try {
//       await Worker.collection.dropIndex("userId_1").catch(() => {});
//     } catch (e) {
//       // Ignore if index doesn't exist
//     }

//     server = app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(
//         `Environment: ${process.env.NODE_ENV || "production"}`
//       );
//       console.log("🌐 CORS enabled successfully");
//     });
//   } catch (error) {
//     console.error("❌ MongoDB Connection Failed:", error.message);
//     process.exit(1);
//   }
// };

// startServer();

// // ===============================
// // PROCESS ERROR HANDLING
// // ===============================
// process.on("unhandledRejection", (error) => {
//   console.error("💥 UNHANDLED REJECTION:", error.message);
//   if (server) {
//     server.close(() => {
//       process.exit(1);
//     });
//   } else {
//     process.exit(1);
//   }
// });

// process.on("uncaughtException", (error) => {
//   console.error("💥 UNCAUGHT EXCEPTION:", error.message);
//   process.exit(1);
// });

// // ===============================
// // EXPORT
// // ===============================
// module.exports = app;






const dns = require("dns");

// ===============================
// DNS CONFIG — RENDER / GMAIL SMTP
// ===============================
try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (error) {
  console.warn("DNS configuration warning:", error.message);
}

// ===============================
// ENV CONFIG
// ===============================
require("dotenv").config();

// ===============================
// DATABASE
// ===============================
const connectDB = require("./config/db");

// ===============================
// PACKAGES
// ===============================
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

// ===============================
// EXISTING ROUTES
// ===============================
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
// const cartRoutes = require("./routes/cart");
const bookingRoutes = require("./routes/bookings");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const serviceRoutes = require("./routes/serviceRoutes");
const workerRoutes = require("./routes/workerRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

// ===============================
// CHAT ROUTE FACTORY
// Your chatRoutes.js currently exports
// createChatRouter(authMiddleware).
// ===============================
const createChatRouter = require("./routes/chatRoutes");

// IMPORTANT:
// This path must match the auth middleware file
// that already exists in your backend project.
// If your middleware is exported from a different
// file, change only this require path.
const authMiddleware = require("./middleware/authMiddleware");

// ===============================
// APP
// ===============================
const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);
app.disable("x-powered-by");

// ===============================
// SECURITY HEADERS
// ===============================
app.use(helmet());

// The chatbot accepts a maximum 4000-character
// message, so 10kb is sufficient for normal chat.
app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);

app.use(cookieParser());

// Sanitize query/body data against MongoDB operators.
app.use(mongoSanitize());

// Protect against HTTP parameter pollution.
app.use(hpp());

// ===============================
// CORS
// ===============================
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:8081",
  "http://localhost:19006",

  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:8081",
  "http://127.0.0.1:19006",

  // Additional origins from Render environment variables.
  ...envOrigins,
];

const uniqueAllowedOrigins = [...new Set(allowedOrigins)];

console.log(
  "🌐 CORS Allowed Origins:",
  uniqueAllowedOrigins
);

const corsOptions = {
  origin: function (origin, callback) {
    // Mobile apps and server-to-server requests
    // may not send an Origin header.
    if (!origin) {
      return callback(null, true);
    }

    if (uniqueAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Preserve your existing local-development behavior.
    if (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:")
    ) {
      return callback(null, true);
    }

    // Preserved from your existing configuration.
    // For production security, replace this with
    // callback(new Error("Origin not allowed by CORS")).
    return callback(null, true);
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
  ],

  exposedHeaders: ["Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// ===============================
// RATE LIMIT
// ===============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
});

app.use("/api/", limiter);

// ===============================
// CHAT-SPECIFIC RATE LIMIT
// Additional protection against excessive AI requests.
// ===============================
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many chat requests. Please try again later.",
  },
});

// ===============================
// LOGGER
// ===============================
app.use(
  morgan(
    process.env.NODE_ENV === "development"
      ? "dev"
      : "combined"
  )
);

// ===============================
// HEALTH CHECK
// ===============================
app.get(
  ["/health", "/api/health"],
  (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Server is healthy and running.",
      timestamp: new Date(),
    });
  }
);

// ===============================
// ROOT ROUTE
// Keep one root handler; duplicate handlers
// for the same GET path are unnecessary.
// ===============================
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "VaniAppB API is running successfully.",
    server: "VaniAppB",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date(),
  });
});

// ===============================
// EXISTING API ROUTES
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Keep cart route available for later use.
// app.use("/api/cart", cartRoutes);

app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Settings: GET/PUT /api/admin/settings
app.use("/api/admin/settings", settingsRoutes);

// Worker APIs
app.use("/api/workers", workerRoutes);

// Services APIs
app.use("/api/services", serviceRoutes);

// ===============================
// CHATBOT API — MUST BE BEFORE 404
// Frontend calls POST /api/chat.
// The factory receives your existing auth middleware.
// ===============================
app.use(
  "/api/chat",
  chatLimiter,
  createChatRouter(authMiddleware)
);

// ===============================
// 404 HANDLER — AFTER ALL ROUTES
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
  console.error(
    "❌ Error:",
    err.stack || err.message || err
  );

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    status: "error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message || "Internal Server Error"
        : statusCode >= 500
          ? "Internal Server Error"
          : err.message || "Request failed",
    ...(process.env.NODE_ENV === "development"
      ? { stack: err.stack }
      : {}),
  });
});

// ===============================
// START SERVER
// ===============================
let server;

const startServer = async () => {
  try {
    await connectDB();

    console.log("✅ MongoDB Connected Successfully");

    // Preserve your existing Worker index cleanup.
    const Worker = require("./models/Worker");

    try {
      await Worker.collection
        .dropIndex("userId_1")
        .catch(() => {});
    } catch (error) {
      // Ignore if the index does not exist.
    }

    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `Environment: ${process.env.NODE_ENV || "production"}`
      );
      console.log("🌐 CORS enabled successfully");
      console.log("🤖 Chat API mounted at /api/chat");
    });

    server.on("error", (error) => {
      console.error("❌ HTTP server error:", error.message);
    });
  } catch (error) {
    console.error(
      "❌ MongoDB Connection Failed:",
      error.message
    );

    process.exit(1);
  }
};

// Start application.
startServer();

// ===============================
// PROCESS ERROR HANDLING
// ===============================
process.on("unhandledRejection", (error) => {
  console.error(
    "💥 UNHANDLED REJECTION:",
    error?.stack || error?.message || error
  );

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  console.error(
    "💥 UNCAUGHT EXCEPTION:",
    error?.stack || error?.message || error
  );

  process.exit(1);
});

// ===============================
// EXPORT
// ===============================
module.exports = app;
