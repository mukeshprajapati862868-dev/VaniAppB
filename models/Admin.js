const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    refreshTokens: [
      {
        tokenHash: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    passwordResetToken: String,
    passwordResetExpires: Date,
    role: {
      type: String,
      enum: ["admin"],
      default: "admin"
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Admin || mongoose.model("Admin", adminSchema);