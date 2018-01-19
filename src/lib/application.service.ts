// The main API application instance
// Here middleware are assigned to parse POST data and log request/response info
// Also handlers are assigned for logging and returning errors
import * as bodyParser from "body-parser";
import * as express from "express";
import { NextFunction, Request, Response, Router } from "express";
import { HttpError, InternalServerError, NotFound } from "http-errors";
import { LoggerService } from "./logger.service";

const logger = LoggerService.getInstance();

export class ApplicationService {

    /**
     * Get/create a singleton HTTP Application instance
     */
    public static getInstance(): express.Application {
        if (this.instance) {
            return this.instance;
        }

        // Create application instance
        this.instance = express();

        // Parse JSON or URL encoded data in the request body
        this.instance.use(bodyParser.json());
        this.instance.use(bodyParser.urlencoded({ extended: true }));

        // Hello World route
        this.instance.get("/", (req, res) => res.send("Hello World"));

        // 404 Not Found
        // If no previous route handler has matched the request, this one is called
        this.instance.use((req, res) => {
            throw new NotFound();
        });

        // Error handler
        // This catches any error thrown in the aplication
        // If the error is an HttpError, it is used in the response
        // For all other errors, the error is logged and an Internal Server Error is returned
        this.instance.use((err: HttpError | Error, req: Request, res: Response, next: NextFunction) => {
            if (err instanceof HttpError) {
                // Respond with thrown HTTP Errors
                res.status(err.statusCode);
                res.jsonp({ message: err.message });
            } else {
                // Log other Errors and respond with Internal Server Error
                logger.error(err);
                const ise = new InternalServerError();
                res.status(ise.statusCode);
                res.jsonp({ message: ise.message });
            }
        });

        return this.instance;
    }

    // Express application singleton instance
    private static instance: express.Application;
}