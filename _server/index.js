/* eslint-disable */

/**
 * Vercel serverless entry point.
 * Wraps the Express app as a Vercel serverless function
 * and ensures MongoDB is connected on cold start.
 */
const dotenv = require("dotenv");
const path = require("path");

// Load env from root .env (for local testing; Vercel injects env vars natively)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = require("../backend/dist/app.js").default;

// Lazy-connect to MongoDB on cold start
let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      const mongoose = require("mongoose");
      const dbUrl = process.env.MONGO_DB_URL;
      if (dbUrl && mongoose.connection.readyState === 0) {
        await mongoose.connect(dbUrl);
        console.log("[Vercel] MongoDB connected");
      }
      isConnected = true;
    } catch (err) {
      console.error("[Vercel] MongoDB connection error:", err);
    }
  }
  return app(req, res);
};
