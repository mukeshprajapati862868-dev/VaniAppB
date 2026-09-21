// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const Worker = require('../models/Worker');

// /**
//  * Middleware: protect
//  * Purpose: Verify Dynamic JWT Token from request headers and attach user to req.user using MongoDB.
//  */
// async function protect(req, res, next) {
//   try {
//     const authHeader = req.headers.authorization || '';
//     let token = null;

//     // चेक करें कि हेडर मौजूद है और 'Bearer ' से शुरू हो रहा है
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       // 'Bearer ' के बाद की पूरी टोकन स्ट्रिंग को डायनेमिकली अलग करें
//       token = authHeader.slice(7);
//     }

//     // अगर हेडर में टोकन नहीं मिला
//     if (!token) {
//       return res.status(401).json({ status: 'error', message: 'Authentication token missing.' });
//     }

//     // टोकन को वेरीफाई करें (Environment Secret या बैकअप 'SUPER_SECRET_KEY' का उपयोग करके)
//     const secret = process.env.JWT_SECRET || 'SUPER_SECRET_KEY';
//     const decoded = jwt.verify(token, secret);

//     // MongoDB डेटाबेस से सीधे यूजर का डेटा निकालें
//     const user = decoded.role === "worker"
//       ? await Worker.findById(decoded.id)
//       : await User.findById(decoded.id);

//     // यदि यूजर डेटाबेस में नहीं है या उसका अकाउंट एक्टिव नहीं है
//     if (
//       !user ||
//       (decoded.role === "worker"
//         ? ["blocked", "rejected"].includes(user.status)
//         : user.status !== "active")
//     ) {
//       return res.status(401).json({ status: 'error', message: 'User is not authorized.' });
//     }

//     // रिक्वेस्ट ऑब्जेक्ट में यूजर डेटा और उसकी ID सिंक करके अटैच करें
//     req.user = user;
     
//     next(); // अगले प्रोसेस या कंट्रोलर पर जाएँ
//   } catch (error) {
//     // अगर टोकन एक्सपायर हो गया है या गलत है
//     return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
//   }
// }

// /**
//  * Middleware: authorizeRoles
//  * Purpose: Restrict access based on user roles (e.g., admin)
//  */
// function authorizeRoles(...roles) {
//   return (req, res, next) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({ status: 'error', message: 'Access denied.' });
//     }
//     next();
//   };
// }

// module.exports = { protect, authorizeRoles };

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Worker = require('../models/Worker');
const Admin = require('../models/Admin');

/**
 * Middleware: protect
 * Purpose: Verify JWT Token and attach user to req.user
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    let token = null;

    // Check if Authorization header exists and starts with 'Bearer '
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7); // Remove 'Bearer ' prefix
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication token missing.'
      });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'SUPER_SECRET_KEY';
    const decoded = jwt.verify(token, secret);

    let user;

    // Find user based on role
    if (decoded.role === 'worker') {
      user = await Worker.findById(decoded.id);
    } else if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id);
    } else {
      user = await User.findById(decoded.id);
    }

    // If user not found
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User is not authorized.'
      });
    }

    // Status check
    if (decoded.role === 'worker') {
      if (['blocked', 'rejected'].includes(user.status)) {
        return res.status(401).json({
          status: 'error',
          message: 'User is not authorized.'
        });
      }
    } else {
      // For admin and normal users
      if (user.status !== 'active') {
        return res.status(401).json({
          status: 'error',
          message: 'User is not authorized.'
        });
      }
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.log('Auth Error →', error.message);
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.'
    });
  }
}

/**
 * Middleware: authorizeRoles
 * Purpose: Restrict access based on user roles
 */
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied.'
      });
    }
    next();
  };
}

module.exports = { protect, authorizeRoles };