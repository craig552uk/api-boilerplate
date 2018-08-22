import * as EmailValidator from "email-validator";
import { NextFunction, Request, Response, Router } from "express";
import { BadRequest, NotFound, Unauthorized } from "http-errors";
import { requireJWTAuth } from "../../middleware/authorisation.middleware";
import { IUser, User } from "../../model/user.model";

const router = Router() as Router;

// Admin only access for all routes
router.use(requireJWTAuth, (req, res, next) => {
    if (!req.jwt.admin) { throw new Unauthorized("Administrator access required"); }
    next();
});

router.get("/", (req, res, next) => {
    // TODO #21 Add support for searching Users
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const conditions = { customerId: req.jwt.cid };

    User.paginate(conditions, { page, limit })
        .then((userPages) => res.jsonp(userPages))
        .catch(next);
});

router.post("/", (req, res, next) => {

    // Validated submitted data
    if (!req.body.name) { throw new BadRequest("You must provide a name"); }
    if (!req.body.login) { throw new BadRequest("You must provide a login"); }
    if (!req.body.password) { throw new BadRequest("You must provide a password"); }
    if (!EmailValidator.validate(req.body.login)) { throw new BadRequest("Your login must be an email address"); }

    const data = {
        admin: !!req.body.admin,
        customerId: req.jwt.cid,
        login: req.body.login,
        name: req.body.name,
        password: req.body.password,
    };

    new User(data).save()
        .then((user) => res.jsonp({ docs: user }))
        .catch((err) => {
            if (err.message.match(/E11000/)) { // Duplicate key error
                next(new BadRequest("Email address already taken"));
            } else {
                next(err);
            }
        });
});

router.get("/:id", (req, res, next) => {
    const conditions = { _id: req.params.id, customerId: req.jwt.cid };
    User.findOne(conditions)
        .then((user) => {
            if (!user) { throw new NotFound("No User exists with that ID"); }
            res.jsonp({ docs: user });
        })
        .catch(next);
});

router.patch("/:id", (req, res, next) => {
    if (!req.body.name) { throw new BadRequest("You must provide a name"); }
    if (!req.body.login) { throw new BadRequest("You must provide a login"); }
    if (!EmailValidator.validate(req.body.login)) { throw new BadRequest("Your login must be an email address"); }

    const data: any = {
        admin: !!req.body.admin,
        login: req.body.login,
        name: req.body.name,
    };

    // Assign password, iff provided, to prevent empty overwrites
    if (req.body.password) { data.password = req.body.password; }

    const conditions = { _id: req.params.id, customerId: req.jwt.cid };

    User.findOneAndUpdate(conditions, data, { new: true })
        .then((user) => {
            if (!user) { throw new NotFound("No User exists with that ID"); }
            res.jsonp({ docs: user });
        })
        .catch((err) => {
            if (err.message.match(/E11000/)) { // Duplicate key error
                next(new BadRequest("Email address already taken"));
            } else {
                next(err);
            }
        });
});

router.delete("/:id", (req, res, next) => {
    const conditions = { _id: req.params.id, customerId: req.jwt.cid };
    User.findOneAndRemove(conditions)
        .then((user) => {
            if (!user) { throw new NotFound("No User exists with that ID"); }
            res.jsonp({ docs: user });
        })
        .catch(next);
});

/**
 * Root Users can impersonate any User
 */
router.get("/:id/impersonate", (req, res, next) => {
    if (!req.jwt.root) { throw new Unauthorized("Root access required"); }

    User.findOne({ _id: req.params.id })
        .then((user) => {
            if (!user) { throw new NotFound("No User exists with that ID"); }

            // Generate JWT including Root token payload
            const token = user.getJWT({ impersonatedBy: req.jwt });
            res.json({ token, type: "jwt" });
        })
        .catch(next);
});

export = router;
