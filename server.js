// const dns = require("dns");

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

// // WORKER ROUTE ADD
// const workerRoutes = require("./routes/workerRoutes");


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
//     express.json({
//         limit: "10kb"
//     })
// );


// app.use(
//     express.urlencoded({
//         extended: true,
//         limit: "10kb"
//     })
// );


// app.use(cookieParser());


// app.use(mongoSanitize());


// app.use(hpp());


// // ===============================
// // CORS (UPDATED TO ALLOW ALL ORIGINS FOR MOBILE DEVS)
// // ===============================

// const allowedOrigins = process.env.ALLOWED_ORIGINS
//     ?
//     process.env.ALLOWED_ORIGINS.split(",")
//     :
//     [
//         "http://localhost:3000",
//         "http://localhost:5173",
//         "http://localhost:19006"
//     ];


// app.use(
//     cors({

//         origin: (origin, callback) => {

//             // origin: true allows requests from mobile emulators and tools without deleting allowedOrigins checks
//             if (!origin || origin === true || allowedOrigins.includes(origin)) {
//                 callback(null, true);
//             }
//             else {
//                 // Fallback to true to stop 'Network request failed' blocking on mobile devices
//                 callback(null, true);
//             }

//         },

//         credentials: true

//     })
// );


// // ===============================
// // RATE LIMIT
// // ===============================


// const limiter = rateLimit({

//     windowMs: 15 * 60 * 1000,

//     max: 100,

//     message: {
//         error: "Too many requests"
//     }

// });


// app.use("/api/", limiter);


// // ===============================
// // LOGGER
// // ===============================


// app.use(
//     morgan(
//         process.env.NODE_ENV === "development"
//             ?
//             "dev"
//             :
//             "combined"
//     )
// );


// // ===============================
// // HEALTH
// // ===============================


// app.get(
//     [
//         "/health",
//         "/api/health"
//     ],

//     (req, res) => {

//         res.json({

//             status: "success",

//             message: "Server is healthy and running.",

//             timestamp: new Date()

//         });

//     }

// );


// // ===============================
// // API ROUTES
// // ===============================


// app.use(
//     "/api/auth",
//     authRoutes
// );


// app.use(
//     "/api/products",
//     productRoutes
// );


// // app.use(
// //     "/api/cart",
// //     cartRoutes
// // );


// app.use(
//     "/api/bookings",
//     bookingRoutes
// );


// app.use(
//     "/api/users",
//     userRoutes
// );


// app.use(
//     "/api/admin",
//     adminRoutes
// );


// // WORKER API ROUTES

// app.use(
//     "/api/workers",
//     workerRoutes
// );


// // ... existing routes ...

// app.use(
//     "/api/services",
//     serviceRoutes
// );


// // ===============================
// // ROOT ROUTE
// // ===============================
// // ADDED ONLY TO FIX:
// // {"error":"Endpoint not found"}
// // when opening https://vaniappb.onrender.com/

// app.get("/", (req, res) => {

//     res.status(200).json({

//         status: "success",

//         message: "VaniAppB API is running successfully.",

//         server: "VaniAppB",

//         environment: process.env.NODE_ENV || "production",

//         timestamp: new Date()

//     });

// });


// // ===============================
// // 404 ROUTE HANDLER
// // ===============================


// app.use(
//     (req, res, next) => {

//         res.status(404).json({

//             error: "Endpoint not found"

//         });

//     }
// );


// // ===============================
// // GLOBAL ERROR HANDLER
// // ===============================


// app.use(
//     (err, req, res, next) => {


//         console.error(
//             "❌ Error:",
//             err.stack
//         );


//         res.status(
//             err.statusCode || 500
//         )
//             .json({

//                 status: "error",

//                 message:
//                     err.message ||
//                     "Internal Server Error",

//                 stack:
//                     process.env.NODE_ENV === "development"
//                         ?
//                         err.stack
//                         :
//                         undefined

//             });


//     }
// );


// // ===============================
// // START SERVER
// // ===============================


// let server;


// const startServer = async () => {


//     try {


//         await connectDB();


//         console.log(
//             "✅ MongoDB Connected Successfully"
//         );


//         // Drop userId_1 index if it exists
//         const Worker = require('./models/Worker');

//         try {

//             await Worker.collection.dropIndex('userId_1').catch(() => {});

//         } catch (e) {

//             // Ignore if index doesn't exist

//         }


//         server = app.listen(

//             PORT,

//             "0.0.0.0",

//             () => {


//                 console.log(
//                     `🚀 Server running on http://192.168.1.12:${PORT}`
//                 );


//                 console.log(
//                     `Environment: ${process.env.NODE_ENV}`
//                 );


//             }

//         );


//     }

//     catch (error) {


//         console.error(
//             "❌ MongoDB Connection Failed:",
//             error.message
//         );

//         process.exit(1);

//     }

// };


// // RUN SERVER

// startServer();


// // ===============================
// // PROCESS ERROR HANDLING
// // ===============================


// process.on(

//     "unhandledRejection",

//     (error) => {


//         console.error(
//             "💥 UNHANDLED REJECTION:",
//             error.message
//         );


//         if (server) {


//             server.close(() => {

//                 process.exit(1);

//             });


//         }

//         else {

//             process.exit(1);

//         }

//     }

// );


// process.on(

//     "uncaughtException",

//     (error) => {

//         console.error(
//             "💥 UNCAUGHT EXCEPTION:",
//             error.message
//         );

//         process.exit(1);

//     }

// );


// // ===============================
// // EXPORT
// // ===============================

// module.exports = app;




const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

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
// ROUTES
// ===============================

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
// const cartRoutes = require("./routes/cart");
const bookingRoutes = require("./routes/bookings");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const serviceRoutes = require("./routes/serviceRoutes");

// WORKER ROUTE ADD
const workerRoutes = require("./routes/workerRoutes");

// ===============================
// APP
// ===============================

const app = express();

const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

app.disable("x-powered-by");

// ===============================
// SECURITY
// ===============================

app.use(helmet());

app.use(
    express.json({
        limit: "10kb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10kb"
    })
);

app.use(cookieParser());

app.use(mongoSanitize());

app.use(hpp());

// ===============================
// CORS
// ===============================

// Allowed origins from ENV
const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

// Default allowed origins
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8081",
    "http://localhost:19006",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:19006",

    // ENV origins
    ...envOrigins
];

// Remove duplicate origins
const uniqueAllowedOrigins = [
    ...new Set(allowedOrigins)
];

console.log(
    "🌐 CORS Allowed Origins:",
    uniqueAllowedOrigins
);

const corsOptions = {
    origin: function (origin, callback) {

        // Mobile apps / server-to-server requests
        if (!origin) {
            return callback(null, true);
        }

        // Allow known origins
        if (uniqueAllowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow localhost development ports
        if (
            origin.startsWith("http://localhost:") ||
            origin.startsWith("http://127.0.0.1:")
        ) {
            return callback(null, true);
        }

        // Keep development/mobile compatibility
        // without blocking the request
        return callback(null, true);
    },

    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ],

    allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
        "Cache-Control",
        "Pragma"
    ],

    exposedHeaders: [
        "Authorization"
    ],

    optionsSuccessStatus: 204
};

// Main CORS middleware
app.use(cors(corsOptions));

// Explicit OPTIONS / preflight handling
app.options(/.*/, cors(corsOptions));

// ===============================
// RATE LIMIT
// ===============================

const limiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 100,

    message: {
        error: "Too many requests"
    }

});

app.use("/api/", limiter);

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
// HEALTH
// ===============================

app.get(
    [
        "/health",
        "/api/health"
    ],

    (req, res) => {

        res.json({

            status: "success",

            message: "Server is healthy and running.",

            timestamp: new Date()

        });

    }
);

// ===============================
// API ROUTES
// ===============================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/products",
    productRoutes
);

// app.use(
//     "/api/cart",
//     cartRoutes
// );

app.use(
    "/api/bookings",
    bookingRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

// ===============================
// WORKER API ROUTES
// ===============================

app.use(
    "/api/workers",
    workerRoutes
);

// ===============================
// SERVICES API ROUTES
// ===============================

app.use(
    "/api/services",
    serviceRoutes
);

// ===============================
// ROOT ROUTE
// ===============================

app.get("/", (req, res) => {

    res.status(200).json({

        status: "success",

        message: "VaniAppB API is running successfully.",

        server: "VaniAppB",

        environment:
            process.env.NODE_ENV || "production",

        timestamp: new Date()

    });

});

// ===============================
// 404 ROUTE HANDLER
// ===============================

app.use(
    (req, res, next) => {

        res.status(404).json({

            error: "Endpoint not found"

        });

    }
);

// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use(
    (err, req, res, next) => {

        console.error(
            "❌ Error:",
            err.stack
        );

        res.status(
            err.statusCode || 500
        )
            .json({

                status: "error",

                message:
                    err.message ||
                    "Internal Server Error",

                stack:
                    process.env.NODE_ENV === "development"
                        ? err.stack
                        : undefined

            });

    }
);

// ===============================
// START SERVER
// ===============================

let server;

const startServer = async () => {

    try {

        await connectDB();

        console.log(
            "✅ MongoDB Connected Successfully"
        );

        // Drop userId_1 index if it exists
        const Worker = require("./models/Worker");

        try {

            await Worker.collection
                .dropIndex("userId_1")
                .catch(() => {});

        } catch (e) {

            // Ignore if index doesn't exist

        }

        server = app.listen(

            PORT,

            "0.0.0.0",

            () => {

                console.log(
                    `🚀 Server running on port ${PORT}`
                );

                console.log(
                    `Environment: ${
                        process.env.NODE_ENV || "production"
                    }`
                );

                console.log(
                    "🌐 CORS enabled successfully"
                );

            }

        );

    }

    catch (error) {

        console.error(
            "❌ MongoDB Connection Failed:",
            error.message
        );

        process.exit(1);

    }

};

// ===============================
// RUN SERVER
// ===============================

startServer();

// ===============================
// PROCESS ERROR HANDLING
// ===============================

process.on(
    "unhandledRejection",
    (error) => {

        console.error(
            "💥 UNHANDLED REJECTION:",
            error.message
        );

        if (server) {

            server.close(() => {

                process.exit(1);

            });

        }

        else {

            process.exit(1);

        }

    }
);

process.on(
    "uncaughtException",
    (error) => {

        console.error(
            "💥 UNCAUGHT EXCEPTION:",
            error.message
        );

        process.exit(1);

    }
);

// ===============================
// EXPORT
// ===============================

module.exports = app;
