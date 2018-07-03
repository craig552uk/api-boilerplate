import { NextFunction, Request, Response, Router } from "express";
import { LoggerService } from "../lib/logger.service";

const logger = LoggerService.getInstance();

/**
 * Logger middleware
 * Logs the request method, path and response code
 *
 * @param req Express Request
 * @param res Express Response
 * @param next Express Next Function
 */
export function LoggerMiddleware(req: Request, res: Response, next: NextFunction) {
    function requestLogger() {
        res.removeListener("finish", requestLogger);
        res.removeListener("close", requestLogger);
        logger.info({ req, res }, `${res.statusCode} ${req.method} ${req.url}`);
    }
    res.on("finish", requestLogger);
    res.on("close", requestLogger);
    next();
}
