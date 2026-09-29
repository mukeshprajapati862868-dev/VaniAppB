const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "app", unique: true },

    companyName: { type: String, default: "VaniSystem" },
    companyEmail: { type: String, default: "" },
    companyPhone: { type: String, default: "" },
    companyAddress: { type: String, default: "" },
    gstNumber: { type: String, default: "" },

    taxRate: { type: Number, default: 18 },
    adminCommission: { type: Number, default: 20 },
    workerCommission: { type: Number, default: 80 },
    bookingCharges: { type: Number, default: 50 },
    cancellationCharges: { type: Number, default: 100 },

    codEnabled: { type: Boolean, default: true },
    upiId: { type: String, default: "" },
    razorpayKeyId: { type: String, default: "" },
    stripeKey: { type: String, default: "" },

    supportEmail: { type: String, default: "" },
    supportPhone: { type: String, default: "" },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);
