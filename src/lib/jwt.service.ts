import * as jwt from "jsonwebtoken";

// TODO #16 Move to config file
const ISSUER = "api.featherback.co";
const EXPIRY = "1 day";
const SECRET = "1bf6c4701e12565f8ad937db603e49d1";

/**
 * Generate a JWT signed with the application secret
 * @param payload Payload data
 */
export function sign(payload: any): string {
    return jwt.sign(payload, SECRET, { issuer: ISSUER, expiresIn: EXPIRY });
}

/**
 * Verify a JWT returning payload data
 * @param token JWT
 */
export function verify(token: string): any {
    return jwt.verify(token, SECRET, { issuer: ISSUER });
}
