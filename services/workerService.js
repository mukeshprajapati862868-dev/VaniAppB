const Worker = require("../models/Worker");
const Service = require("../models/Service");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================================================
// GENERATE TOKEN
// =====================================================

function generateToken(worker) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  if (!worker || !worker._id) {
    throw new Error(
      "Invalid worker data for token generation"
    );
  }

  return jwt.sign(
    {
      id: worker._id.toString(),
      role: "worker",
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

// =====================================================
// WORKER REGISTER
// =====================================================

async function registerWorker(data) {
  data = data || {};

  const email = String(data.email || "")
    .trim()
    .toLowerCase();

  const phone = String(data.phone || "").trim();

  const name = String(data.name || "").trim();

  const password = String(data.password || "");

  // ===================================================
  // VALIDATION
  // ===================================================

  if (!name) {
    throw {
      statusCode: 400,
      message: "Name is required.",
    };
  }

  if (!email) {
    throw {
      statusCode: 400,
      message: "Email is required.",
    };
  }

  if (!phone) {
    throw {
      statusCode: 400,
      message: "Phone is required.",
    };
  }

  if (!password) {
    throw {
      statusCode: 400,
      message: "Password is required.",
    };
  }

  if (password.length < 6) {
    throw {
      statusCode: 400,
      message:
        "Password must be at least 6 characters.",
    };
  }

  // ===================================================
  // CHECK EXISTING WORKER
  // ===================================================

  const existingWorker =
    await Worker.findOne({
      email,
    }).select("_id email");

  if (existingWorker) {
    throw {
      statusCode: 409,
      message:
        "Worker with this email already exists.",
    };
  }

  // Also check by phone
  const existingWorkerByPhone =
    await Worker.findOne({
      phone,
    }).select("_id phone");

  if (existingWorkerByPhone) {
    throw {
      statusCode: 409,
      message:
        "Worker with this phone number already exists.",
    };
  }

  // ===================================================
  // HASH PASSWORD
  // ===================================================

  const saltRounds =
    Number(process.env.BCRYPT_ROUNDS) || 12;

  const passwordHash =
    await bcrypt.hash(
      password,
      saltRounds
    );

  if (
    !passwordHash ||
    typeof passwordHash !== "string"
  ) {
    throw {
      statusCode: 500,
      message: "Password hashing failed.",
    };
  }

  // ===================================================
  // CREATE WORKER
  // ===================================================
  //
  // IMPORTANT:
  // User collection mein koi document create nahi hoga.
  //
  // Worker ka passwordHash directly Worker collection
  // mein save hoga.
  // ===================================================

  const worker = await Worker.create({
    name,

    phone,

    email,

    passwordHash,

    profileImage:
      data.profileImage || "",

    address:
      data.address || "",

    city:
      data.city || "",

    state:
      data.state || "",

    pincode:
      data.pincode || "",

    experience:
      Number(data.experience) || 0,

    serviceCategory:
      Array.isArray(
        data.serviceCategory
      )
        ? data.serviceCategory
        : [],

    kycDocuments: {
      aadhaar:
        data.kycDocuments?.aadhaar ||
        data.aadhaar ||
        "",

      pan:
        data.kycDocuments?.pan ||
        data.pan ||
        "",

      certificate:
        data.kycDocuments?.certificate ||
        data.certificate ||
        "",
    },

    availabilityStatus: "OFF",

    status: "pending",

    totalJobs: 0,

    completedJobs: 0,

    rating: 0,

    role: "worker",

    location: {
      type: "Point",

      coordinates:
        Array.isArray(
          data.location?.coordinates
        ) &&
        data.location.coordinates.length === 2
          ? data.location.coordinates
          : [0, 0],
    },
  });

  // ===================================================
  // GENERATE WORKER TOKEN
  // ===================================================

  const token =
    generateToken(worker);

  // ===================================================
  // RETURN AUTH DATA
  // ===================================================

  return {
    token,

    user: {
      id: worker._id.toString(),

      name: worker.name,

      email: worker.email,

      phone: worker.phone,

      role: "worker",

      status: worker.status,
    },

    worker,

    requiresLogin: false,
  };
}

// =====================================================
// WORKER LOGIN
// =====================================================

async function loginWorker(
  email,
  password
) {
  const normalizedEmail =
    String(email || "")
      .trim()
      .toLowerCase();

  const loginPassword =
    String(password || "");

  // ===================================================
  // VALIDATION
  // ===================================================

  if (!normalizedEmail) {
    throw {
      statusCode: 400,
      message: "Email is required.",
    };
  }

  if (!loginPassword) {
    throw {
      statusCode: 400,
      message: "Password is required.",
    };
  }

  // ===================================================
  // FIND WORKER
  // ===================================================
  //
  // passwordHash has select:false
  // therefore +passwordHash is mandatory.
  // ===================================================

  const worker =
    await Worker.findOne({
      email: normalizedEmail,
    }).select(
      "+passwordHash"
    );

  // ===================================================
  // WORKER NOT FOUND
  // ===================================================

  if (!worker) {
    throw {
      statusCode: 401,
      message:
        "Invalid email or password.",
    };
  }

  // ===================================================
  // STATUS CHECK
  // ===================================================

  if (
    worker.status === "blocked"
  ) {
    throw {
      statusCode: 403,
      message:
        "Your account is blocked.",
    };
  }

  if (
    worker.status === "rejected"
  ) {
    throw {
      statusCode: 403,
      message:
        "Your worker account has been rejected.",
    };
  }

  // ===================================================
  // PASSWORD HASH CHECK
  // ===================================================

  if (
    !worker.passwordHash ||
    typeof worker.passwordHash !== "string"
  ) {
    console.error(
      "WORKER LOGIN ERROR: passwordHash is missing",
      {
        workerId: worker._id,
        email: worker.email,
      }
    );

    throw {
      statusCode: 500,
      message:
        "Worker password is not configured. Please reset the worker password.",
    };
  }

  // ===================================================
  // COMPARE PASSWORD
  // ===================================================

  let match = false;

  try {
    match =
      await bcrypt.compare(
        loginPassword,
        worker.passwordHash
      );
  } catch (bcryptError) {
    console.error(
      "WORKER BCRYPT ERROR:",
      bcryptError
    );

    throw {
      statusCode: 500,
      message:
        "Password verification failed.",
    };
  }

  // ===================================================
  // WRONG PASSWORD
  // ===================================================

  if (!match) {
    throw {
      statusCode: 401,
      message: "Wrong password.",
    };
  }

  // ===================================================
  // GENERATE TOKEN
  // ===================================================

  const token =
    generateToken(worker);

  // ===================================================
  // RETURN LOGIN DATA
  // ===================================================

  return {
    token,

    user: {
      id: worker._id.toString(),

      name: worker.name,

      email: worker.email,

      phone: worker.phone,

      role: "worker",

      status: worker.status,
    },

    worker,

    requiresLogin: false,
  };
}

// =====================================================
// PROFILE
// =====================================================

async function getProfile(
  workerId
) {
  if (!workerId) {
    throw {
      statusCode: 400,
      message:
        "Worker ID is required.",
    };
  }

  return await Worker.findById(
    workerId
  ).populate(
    "serviceCategory"
  );
}

// =====================================================
// UPDATE PROFILE
// =====================================================

async function updateProfile(
  workerId,
  data
) {
  if (!workerId) {
    throw {
      statusCode: 400,
      message:
        "Worker ID is required.",
    };
  }

  data = data || {};

  const allowedFields = [
    "name",
    "phone",
    "profileImage",
    "address",
    "city",
    "state",
    "pincode",
    "experience",
  ];

  const updateData = {};

  for (
    const field of allowedFields
  ) {
    if (
      Object.prototype.hasOwnProperty.call(
        data,
        field
      )
    ) {
      updateData[field] =
        data[field];
    }
  }

  // ===================================================
  // NAME
  // ===================================================

  if (
    Object.prototype.hasOwnProperty.call(
      updateData,
      "name"
    )
  ) {
    updateData.name =
      String(
        updateData.name || ""
      ).trim();

    if (!updateData.name) {
      throw {
        statusCode: 400,
        message:
          "Name cannot be empty.",
      };
    }
  }

  // ===================================================
  // PHONE
  // ===================================================

  if (
    Object.prototype.hasOwnProperty.call(
      updateData,
      "phone"
    )
  ) {
    updateData.phone =
      String(
        updateData.phone || ""
      ).trim();

    if (!updateData.phone) {
      throw {
        statusCode: 400,
        message:
          "Phone cannot be empty.",
      };
    }
  }

  // ===================================================
  // EXPERIENCE
  // ===================================================

  if (
    Object.prototype.hasOwnProperty.call(
      updateData,
      "experience"
    )
  ) {
    updateData.experience =
      Number(
        updateData.experience
      ) || 0;

    if (
      updateData.experience < 0
    ) {
      updateData.experience = 0;
    }
  }

  return await Worker.findByIdAndUpdate(
    workerId,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  );
}

// =====================================================
// KYC
// =====================================================

async function updateKYC(
  workerId,
  documents
) {
  if (!workerId) {
    throw {
      statusCode: 400,
      message:
        "Worker ID is required.",
    };
  }

  documents =
    documents || {};

  const kycDocuments = {
    aadhaar:
      documents.aadhaar || "",

    pan:
      documents.pan || "",

    certificate:
      documents.certificate || "",
  };

  return await Worker.findByIdAndUpdate(
    workerId,
    {
      $set: {
        kycDocuments,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
}

// =====================================================
// AVAILABILITY
// =====================================================

async function updateAvailability(
  workerId,
  status
) {
  if (!workerId) {
    throw {
      statusCode: 400,
      message:
        "Worker ID is required.",
    };
  }

  if (
    !["ON", "OFF"].includes(
      status
    )
  ) {
    throw {
      statusCode: 400,
      message:
        "Availability must be ON or OFF.",
    };
  }

  return await Worker.findByIdAndUpdate(
    workerId,
    {
      $set: {
        availabilityStatus:
          status,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
}

// =====================================================
// SERVICES
// =====================================================

async function getServices() {
  return await Service.find({
    status: "active",
  });
}

// =====================================================
// SELECT SERVICES
// =====================================================

async function selectServices(
  workerId,
  services
) {
  if (!workerId) {
    throw {
      statusCode: 400,
      message:
        "Worker ID is required.",
    };
  }

  if (
    !Array.isArray(services)
  ) {
    throw {
      statusCode: 400,
      message:
        "Services must be an array.",
    };
  }

  return await Worker.findByIdAndUpdate(
    workerId,
    {
      $set: {
        serviceCategory:
          services,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
}

// =====================================================
// UPDATE LOCATION
// =====================================================

async function updateLocation(
  workerId,
  coordinates
) {
  if (!workerId) {
    throw {
      statusCode: 400,
      message:
        "Worker ID is required.",
    };
  }

  if (
    !Array.isArray(
      coordinates
    ) ||
    coordinates.length !== 2
  ) {
    throw {
      statusCode: 400,
      message:
        "Location coordinates must be [longitude, latitude].",
    };
  }

  const longitude =
    Number(coordinates[0]);

  const latitude =
    Number(coordinates[1]);

  if (
    !Number.isFinite(
      longitude
    ) ||
    !Number.isFinite(
      latitude
    )
  ) {
    throw {
      statusCode: 400,
      message:
        "Invalid location coordinates.",
    };
  }

  if (
    longitude < -180 ||
    longitude > 180 ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw {
      statusCode: 400,
      message:
        "Invalid latitude or longitude.",
    };
  }

  return await Worker.findByIdAndUpdate(
    workerId,
    {
      $set: {
        location: {
          type: "Point",

          coordinates: [
            longitude,
            latitude,
          ],
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
}

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  registerWorker,
  loginWorker,
  getProfile,
  updateProfile,
  updateKYC,
  updateAvailability,
  getServices,
  selectServices,
  updateLocation,
};