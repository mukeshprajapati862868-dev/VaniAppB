const mongoose = require('mongoose');

/**
 * Model: ContentConfig
 * Stores CMS/configuration used by the customer app home screen.
 */
const contentConfigSchema = new mongoose.Schema({
  appName: String,
  welcomeText: String,
  sections: [String],
  products: [String],
}, { timestamps: true });

module.exports = mongoose.models.ContentConfig || mongoose.model('ContentConfig', contentConfigSchema);
