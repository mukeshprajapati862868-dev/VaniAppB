const Settings = require("../models/Settings");

async function getSettings(req, res, next) {
  try {
    let doc = await Settings.findOne({ key: "app" });
    if (!doc) {
      doc = await Settings.create({ key: "app" });
    }
    return res.json({ status: "success", data: doc });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const body = req.body || {};

    const allowed = [
      "companyName",
      "companyEmail",
      "companyPhone",
      "companyAddress",
      "gstNumber",
      "taxRate",
      "adminCommission",
      "workerCommission",
      "bookingCharges",
      "cancellationCharges",
      "codEnabled",
      "upiId",
      "razorpayKeyId",
      "stripeKey",
      "supportEmail",
      "supportPhone",
      "maintenanceMode",
    ];

    const update = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const doc = await Settings.findOneAndUpdate(
      { key: "app" },
      { $set: update },
      { new: true, upsert: true }
    );

    return res.json({
      status: "success",
      message: "Settings updated",
      data: doc,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, updateSettings };
