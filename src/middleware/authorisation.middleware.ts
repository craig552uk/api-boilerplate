import { NextFunction, Request, Response, Router } from "express";
import { BadRequest } from "http-errors";
import * as JWTService from "../lib/jwt.service";

/**
 * Ensure the request provides basic authentication header
 * If so, unpack the header and attach username/password to the request object
 *
 * @param req Express Request
 * @param res Express Response
 * @param next Express Next Function
 */
export function parseBasicAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.header("authorization")) {
        throw new BadRequest("No authorization header provided");
    }

    try {
        let auth = req.header("authorization") as string;
        auth = auth.replace(/^basic /i, "");
        auth = new Buffer(auth, "base64").toString();
        [req.username, req.password] = auth.split(":");
        next();
    } catch (err) {
        throw new BadRequest("Malformed Authorization Header");
    }
}

/**
 * Ensure the request provides a JWT token
 * If so, unpack the token payload an attach it to the request object
 *
 * @param req Express Request
 * @param res Express Response
 * @param next Express Next Function
 */
export function requireJWTAuth(req: Request, res: Response, next: NextFunction) {
    let token: string;
    const authHeader = req.header("authorization");

    if (authHeader !== undefined && authHeader.match(/^bearer /i)) {
        // JWT provided in authorization header
        token = authHeader.replace(/^bearer /i, "");
    } else if (req.query.jwt) {
        // JWT provided in query string
        token = req.query.jwt;
    } else {
        throw new BadRequest("Required JWT authorization token missing");
    }

    try {
        req.jwt = JWTService.verify(token);
    } catch (err) {
        throw new BadRequest("Malformed JWT authorization token provided");
    }
    next();
}
