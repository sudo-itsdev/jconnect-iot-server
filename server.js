const http = require("http");
const express = require("express");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const { setupWebSocketServer } = require("./websocket-server");
const { setupRestApi } = require("./rest-api");
const { body, validationResult } = require("express-validator");
// const admin = require("firebase-admin"); // Firebase Admin SDK

const app = express();
const port = process.env.PORT || 3001;

// Load Firebase Admin SDK
// const serviceAccount = require("./its-jconnect-firebase-adminsdk-fbsvc-7a1e7a4914.json");

// Reference to the Firebase Admin SDK
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// Reference to the Firestore database
// const db = admin.firestore();

// Collection name to fetch valid client IDs
// const validClientIdsCollection = "manufacturer"; // Change this to your actual collection name

// Declare validClientIds in the global scope
let validClientIds = new Set();

async function fetchValidClientIds() {
  try {
    // Fetch the 'jclock' document from the 'manufacturer' collection
    // const doc = await db.collection("manufacturer").doc("jclock").get();
    // if (!doc.exists) {
    //   console.log(
    //     'Document "jclock" does not exist in the "manufacturer" collection.'
    //   );
    //   return;
    // }

    // Get the 'devices' array from the document
    // const data = doc.data();
    // if (Array.isArray(data.devices)) {
    //   // Clear the previous valid client IDs
    //   validClientIds.clear();

    //   // Add each device_id to the Set
    //   data.devices.forEach((device) => {
    //     if (device.device_id) {
    //       validClientIds.add(device.device_id);
    //     }
    //   });

    //   console.log(
    //     "Fetched valid client IDs (device_id):",
    //     Array.from(validClientIds)
    //   );
    // } else {
    //   console.log('No "devices" array found in the "jclock" document.');
    // }
  } catch (error) {
    console.error("Error fetching valid client IDs from Firestore:", error);
  }
}

// Fetch valid client IDs on startup
// fetchValidClientIds();

// Set an interval to periodically refresh valid client IDs every 5 minutes
// setInterval(fetchValidClientIds, 1000 * 60 * 5); // Refresh every 5 minutes

// Console log the valid client IDs
// console.log("Initial valid client IDs:", Array.from(validClientIds));

// // Apply rate limiting to all REST API routes
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: "Too many requests from this IP, please try again later.",
// });

// app.use("/api", apiLimiter); // Apply to all API routes

// // Middleware to validate JWT
// function authenticateToken(req, res, next) {
//   const token = req.headers["authorization"];
//   if (!token) return res.status(401).json({ error: "Unauthorized" });

//   jwt.verify(token, "your-secret-key", (err, user) => {
//     if (err) return res.status(403).json({ error: "Forbidden" });
//     req.user = user;
//     next();
//   });
// }

// // Protect API routes
// app.use("/api", authenticateToken);

// Create an HTTP server to attach both Express and WebSocket
const server = http.createServer(app);

// Create a Map to store clients by unique ID
const clients = new Map();

// Setup REST API
setupRestApi(app, clients);

// Setup WebSocket server
setupWebSocketServer(server, clients); // Pass valid client IDs to WebSocket server

// Endpoint to validate data
app.post(
  "/api/data",
  body("name").isString().notEmpty(),
  body("age").isInt({ min: 0 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.json({ message: "Data is valid" });
  }
);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`WebSocket server is also running on port ${port}`);
});
