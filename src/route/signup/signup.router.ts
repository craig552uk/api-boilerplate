// This is the base router, which provides a few generic utility endpoints
import * as EmailValidator from "email-validator";
import { Router } from "express";
import { BadRequest } from "http-errors";
import { LoggerService } from "../../lib/logger.service";
import { Customer } from "../../model/customer.model";
import { User } from "../../model/user.model";

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
            logger.debug({ customer }, "Created new Customer");

            // Create User with admin privilages
            const userData = {
                customerId: customer._id,
                isAdmin: true,
                login: req.body.login,
                password: "Passw0rd", // TODO #14 New User must set password
            };

            return new User(userData).save()
                .then((user) => {
                    logger.debug({ user }, "Created new User");

                    // TODO #12 Generate JWT for User

                    // Return JWT
                    res.json({ token: "foo", type: "jwt" });
                });
        })
        .catch(next);
});

export = router;
