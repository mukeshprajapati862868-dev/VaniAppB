// admin routes file me
const settingsController = require("../controllers/settings");

router.get(
  "/settings",
  protect,
  authorizeRoles("admin"),
  settingsController.getSettings
);

router.put(
  "/settings",
  protect,
  authorizeRoles("admin"),
  settingsController.updateSettings
);
