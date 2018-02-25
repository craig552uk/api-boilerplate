// This is the base router, which provides a few generic utility endpoints
import { Router } from "express";
import { BadRequest, Unauthorized } from "http-errors";
import { parseBasicAuth, requireJWTAuth } from "../../middleware/authorisation.middleware";
import { User } from "../../model/user.model";

const router = Router() as Router;

/**
 * Authenticate with Basic Auth username and password
 * Returns JWT if valid
 * Unauthorized otherwise
 */
router.all("/login", parseBasicAuth, (req, res, next) => {
    User.findOne({ login: req.username })
        .then((user) => {
            if (user && !user.enabled) {
                throw new Unauthorized("Your Account has been disabled");
            }

            if (user && user.checkPassword(req.password)) {
                res.json({ token: user.getJWT(), type: "jwt" });
            } else {
                throw new Unauthorized("Incorrect username or password");
            }
        })
        .catch(next);
});

/**
 * Returns current authenticated User object
 */
router.all("/whoami", requireJWTAuth, (req, res, next) => {
    User.findById(req.jwt.id)
        .then((user) => {
            if (!user) { throw new BadRequest("No User exists with that ID"); }
            res.json({ data: user });
        })
        .catch(next);
});

export = router;
