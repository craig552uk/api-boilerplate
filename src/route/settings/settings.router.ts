import { Router } from "express";
import { BadRequest, Unauthorized } from "http-errors";
import { requireJWTAuth } from "../../middleware/authorisation.middleware";
import { Customer } from "../../model/customer.model";
import { IUser, User } from "../../model/user.model";

const router = Router() as Router;

// All endpoints require JWT
router.use(requireJWTAuth);

/**
 * Update current User password
 */
router.patch("/password", (req, res, next) => {
    if (!req.body.currentPassword) { throw new BadRequest("You must provide your current password"); }
    if (!req.body.newPassword1) { throw new BadRequest("You must provide a new password"); }
    if (!req.body.newPassword2) { throw new BadRequest("You must provide a new password twice"); }
    if (req.body.newPassword1 !== req.body.newPassword2) { throw new BadRequest("New passwords do not match"); }

    User.findById(req.jwt.id)
        .then((user) => {
            if (!user) { throw new Unauthorized("No User exists with that ID"); }
            if (!user.checkPassword(req.body.currentPassword)) { throw new BadRequest("Incorrect password provided"); }

            // Set new password and save
            user.password = req.body.newPassword1;
            return user.save();
        })
        .then((user) => res.jsonp({ docs: user }))
        .catch(next);
});

/**
 * Get current User settings
 */
router.get("/profile", (req, res, next) => {
    User.findById(req.jwt.id)
        .then((user) => {
            if (!user) { throw new Unauthorized("No User exists with that ID"); }
            res.jsonp({ docs: user });
        })
        .catch(next);
});

/**
 * Update current User settings
 */
router.patch("/profile", (req, res, next) => {
    if (!req.body.name) { throw new BadRequest("You must provide a name"); }

    const data = {
        name: req.body.name,
    };

    User.findOneAndUpdate({ _id: req.jwt.id }, data, { new: true })
        .then((user) => {
            if (!user) { throw new Unauthorized("No User exists with that ID"); }
            res.jsonp({ docs: user });
        })
        .catch(next);
});

/**
 * Get Customer settings
 * Admin only
 */
router.get("/account", (req, res, next) => {
    if (!req.jwt.admin) { throw new Unauthorized("Administrator access required"); }

    Customer.findById(req.jwt.cid)
        .then((customer) => {
            if (!customer) { throw new Unauthorized("No Customer exists with that ID"); }
            res.jsonp({ docs: customer });
        })
        .catch(next);
});

/**
 * Update Customer settings
 * Admin only
 */
router.patch("/account", (req, res, next) => {
    if (!req.jwt.admin) { throw new Unauthorized("Administrator access required"); }
    if (!req.body.name) { throw new BadRequest("You must provide a name"); }

    const data = {
        name: req.body.name,
    };

    Customer.findOneAndUpdate({ _id: req.jwt.cid }, data, { new: true })
        .then((customer) => {
            if (!customer) { throw new Unauthorized("No Customer exists with that ID"); }
            res.jsonp({ docs: customer });
        })
        .catch(next);
});

export = router;
