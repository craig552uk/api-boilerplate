import { Router } from "express";
import { BadRequest, Unauthorized } from "http-errors";
import { requireJWTAuth } from "../../middleware/authorisation.middleware";
import { Customer } from "../../model/customer.model";
import { User } from "../../model/user.model";

const router = Router() as Router;

// All endpoints require JWT
router.use(requireJWTAuth);

/**
 * Update current User password
 */
router.patch("/settings/password", (req, res) => {
    res.send("OK");
});

/**
 * Get current User settings
 */
router.get("/settings/profile", (req, res) => {
    res.send("OK");
});

/**
 * Update current User settings
 */
router.patch("/settings/profile", (req, res) => {
    res.send("OK");
});

/**
 * Get Customer settings
 * Admin only
 */
router.get("/settings/account", (req, res) => {
    if (!req.jwt.admin) { throw new Unauthorized("Administrator access required"); }
    res.send("OK");
});

/**
 * Update Customer settings
 * Admin only
 */
router.patch("/settings/account", (req, res) => {
    if (!req.jwt.admin) { throw new Unauthorized("Administrator access required"); }
    res.send("OK");
});

export = router;
