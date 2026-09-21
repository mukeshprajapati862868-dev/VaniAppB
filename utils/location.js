const axios = require('axios');

/**
 * Attempts to resolve a user's location from the incoming request.
 * Strategy:
 * 1. Extract client IP from `x-forwarded-for`, `x-real-ip` or `req.ip`.
 * 2. Call a public IP geolocation service (ip-api.com) to get city, region (state) and zip.
 * 3. Return a structured address object suitable for Booking/address storage.
 *
 * Notes:
 * - Accuracy depends on IP provider. For mobile users or private networks results may be coarse.
 * - If geolocation fails, returns a minimal object with empty fields.
 */
async function getLocationFromRequest(req) {
  try {
    // Prefer x-forwarded-for chain, then x-real-ip, then req.ip
    const xff = req.headers['x-forwarded-for'];
    const ip = (xff && xff.split(',')[0].trim()) || req.headers['x-real-ip'] || req.ip || req.connection?.remoteAddress || '';

    // ip-api accepts plain IP or empty to mean caller IP
    const target = (ip && !ip.startsWith('::1') && ip !== '::ffff:127.0.0.1') ? ip : '';
    const url = `http://ip-api.com/json/${target}?fields=status,message,country,regionName,city,zip,lat,lon,query`;

    const res = await axios.get(url, { timeout: 3000 });
    const data = res.data || {};
    if (data.status !== 'success') {
      return {
        houseNo: '',
        landmark: '',
        city: data.city || '',
        state: data.regionName || '',
        pincode: data.zip || '',
        fullAddress: [data.city, data.regionName, data.country, data.zip].filter(Boolean).join(', '),
        latitude: data.lat,
        longitude: data.lon,
        raw: data,
      };
    }

    return {
      houseNo: '',
      landmark: '',
      city: data.city || '',
      state: data.regionName || '',
      pincode: data.zip || '',
      fullAddress: [data.city, data.regionName, data.country, data.zip].filter(Boolean).join(', '),
      latitude: data.lat,
      longitude: data.lon,
      raw: data,
    };
  } catch (err) {
    return {
      houseNo: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      fullAddress: '',
      latitude: undefined,
      longitude: undefined,
      raw: { error: err.message },
    };
  }
}

module.exports = {
  getLocationFromRequest,
};
