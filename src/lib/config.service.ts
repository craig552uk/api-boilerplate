
// Load config file
const conf = require(`../../config.json`);

// JWT configuration
export const JWT_ISSUER = conf.JWT_ISSUER || "api.featherback.co";
export const JWT_EXPIRY = conf.JWT_EXPIRY || "1 day";
export const JWT_SECRET = conf.JWT_SECRET || "1bf6c4701e12565f8ad937db603e49d1";
