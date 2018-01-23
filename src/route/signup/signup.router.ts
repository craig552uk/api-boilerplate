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
    if (!req.body.password1) { throw new BadRequest("You must provide a password"); }
    if (!req.body.password2) { throw new BadRequest("You must provide your password twice"); }
    if (!req.body.organisationName) { throw new BadRequest("You must provide an organisation name"); }
    if (!EmailValidator.validate(req.body.login)) { throw new BadRequest("Your login must be an email address"); }
    if (req.body.password1 !== req.body.password2) { throw new BadRequest("Your passwords do not match"); }

    // Create Customer with default configuration
    const customerData = {
        email: req.body.login,
        name: req.body.organisationName,
    };

    new Customer(customerData).save()
        .then((customer) => {
            logger.debug({ customer }, "Created new Customer");

            // Create User with admin privilages
            const userData = {
                admin: true,
                customerId: customer._id,
                login: req.body.login,
                name: req.body.name,
                password: req.body.password1,
            };

            return new User(userData).save()
                .then((user) => {
                    logger.debug({ user }, "Created new User");

                    // TODO #15 Send new user emails

                    // Generate and return new JWT for User
                    res.json({ token: user.getJWT(), type: "jwt" });
                });
        })
        .catch((err) => {
            if (err.message.match(/^E11000/)) { // Mongo 'duplicate key error'
                throw new BadRequest("That email is already taken");
            }
            if (err.message.match(/password/i)) { // Invalid password
                throw new BadRequest(err.message);
            }
            throw err;
        })
        .catch(next);
});

export = router;
