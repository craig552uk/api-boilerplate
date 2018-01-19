// This is the base router, which provides a few generic utility endpoints
import * as EmailValidator from "email-validator";
import { Router } from "express";
import { BadRequest } from "http-errors";
import { LoggerService } from "../../lib/logger.service";
import { Customer } from "../../model/customer.model";

const logger = LoggerService.getInstance();

const router = Router() as Router;

/**
 * Submit new user registration details
 * Validates submitted data
 * Creates new Customer and Admin User
 * Returns JWT for new User
 */
router.post("/signup", (req, res, next) => {

    // Validated submitted data
    if (!req.body.name) { throw new BadRequest("You must provide a name"); }
    if (!req.body.login) { throw new BadRequest("You must provide a login"); }
    if (!req.body.organisationName) { throw new BadRequest("You must provide an organisation name"); }
    if (!EmailValidator.validate(req.body.login)) { throw new BadRequest("Your login must be an email address"); }

    // Create Customer with default configuration
    new Customer({ name: "foo" }).save()
        .then((customer) => {
            logger.info({ customer }, "Created new Customer");

            // TODO #11 Create User with admin privilages
            // TODO #12 Generate JWT for User

            // Return JWT
            res.json({ token: "foo", type: "jwt" });
        })
        .catch(next);
});

export = router;
