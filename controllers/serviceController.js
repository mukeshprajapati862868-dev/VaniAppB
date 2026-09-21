const Service = require("../models/Service");

// =====================================================
// CREATE SERVICE
// =====================================================
exports.createService = async (req, res) => {
  try {
    const { name, description, category, price, image, status, sortOrder } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        status: "error",
        message: "Name and Category are required",
      });
    }

    const service = await Service.create({
      name,
      description: description || "",
      category,
      price: price || 0,
      image: image || "",
      status: status || "active",
      sortOrder: sortOrder || 0,
    });

    return res.status(201).json({
      status: "success",
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    console.error("Create Service Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error",
    });
  }
};

// =====================================================
// GET ALL SERVICES (with optional category filter)
// =====================================================
exports.getAllServices = async (req, res) => {
  try {
    const { category, status } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    } else {
      // Default: only active
      filter.status = "active";
    }

    const services = await Service.find(filter).sort({
      category: 1,
      sortOrder: 1,
      name: 1,
    });

    return res.status(200).json({
      status: "success",
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Get All Services Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error",
    });
  }
};

// =====================================================
// GET SERVICES GROUPED BY CATEGORY
// =====================================================
exports.getServicesByCategory = async (req, res) => {
  try {
    const services = await Service.find({ status: "active" }).sort({
      sortOrder: 1,
      name: 1,
    });

    // Group by category
    const grouped = {};

    services.forEach((service) => {
      if (!grouped[service.category]) {
        grouped[service.category] = [];
      }
      grouped[service.category].push(service);
    });

    return res.status(200).json({
      status: "success",
      data: grouped,
    });
  } catch (error) {
    console.error("Get Services By Category Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error",
    });
  }
};

// =====================================================
// GET SINGLE SERVICE
// =====================================================
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        status: "error",
        message: "Service not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: service,
    });
  } catch (error) {
    console.error("Get Service Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error",
    });
  }
};

// =====================================================
// UPDATE SERVICE
// =====================================================
exports.updateService = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "description",
      "category",
      "price",
      "image",
      "status",
      "sortOrder",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        status: "error",
        message: "Service not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Update Service Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error",
    });
  }
};

// =====================================================
// DELETE SERVICE
// =====================================================
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        status: "error",
        message: "Service not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete Service Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error",
    });
  }
};