import * as jwt from "jsonwebtoken";
import { JWT_EXPIRY, JWT_ISSUER, JWT_SECRET } from "./config.service";

console.log(JWT_ISSUER);

/**
 * Generate a JWT signed with the application secret
 * @param payload Payload data
 */
export function sign(payload: any): string {
    return jwt.sign(payload, JWT_SECRET, { issuer: JWT_ISSUER, expiresIn: JWT_EXPIRY });
}

/**
 * Verify a JWT returning payload data
 * @param token JWT
 */
export function verify(token: string): any {
    return jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });
}
