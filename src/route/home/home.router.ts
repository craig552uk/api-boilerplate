// This is the base router, which provides a few generic utility endpoints
import { Router } from "express";
import { ImATeapot } from "http-errors";
import { join } from "path";

const router = Router() as Router;

/**
 * Responds with project metadata
 * This endpoint is useful to interrogate the status and version of the running service
 */
router.all("/", (req, res) => {
    const metadata = require(join("..", "..", "..", "package.json"));
    res.jsonp({
        docs: {
            author: metadata.author,
            description: metadata.description,
            name: metadata.name,
            version: metadata.version,
        },
    });
});

/**
 * Responds with HTTP I'm A Teapot Error
 */
router.all("/teapot", (req, res) => {
    throw new ImATeapot();
});

/**
 * Thrown native Error
 * should log native Error and return Server Error
 */
router.all("/error", (req, res) => {
    throw new Error("Danger Will Robinson");
});

export = router;
