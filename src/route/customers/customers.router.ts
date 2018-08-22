import * as EmailValidator from "email-validator";
import { NextFunction, Request, Response, Router } from "express";
import { BadRequest, NotFound, Unauthorized } from "http-errors";
import { requireJWTAuth } from "../../middleware/authorisation.middleware";
import { Customer } from "../../model/customer.model";
import { User } from "../../model/user.model";

const router = Router() as Router;

// Root only access for all routes
router.use(requireJWTAuth, (req, res, next) => {
    if (!req.jwt.root) { throw new Unauthorized("Root access required"); }
    next();
});

router.get("/", (req, res, next) => {
    // TODO #21 Add support for searching Customers
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    Customer.paginate({}, { page, limit })
        .then((customerPages) => res.jsonp(customerPages))
        .catch(next);
});

router.post("/", (req, res, next) => {
    if (!req.body.name) { throw new BadRequest("You must provide a name"); }
    if (!req.body.email) { throw new BadRequest("You must provide a email"); }
    if (!EmailValidator.validate(req.body.email)) { throw new BadRequest("Your email is not a valid address"); }

    const data = {
        email: req.body.email,
        name: req.body.name,
    };

    new Customer(data).save()
        .then((customer) => res.jsonp({ docs: customer }))
        .catch((err) => {
            if (err.message.match(/E11000/)) { // Duplicate key error
                next(new BadRequest("Email address already taken"));
            } else {
                next(err);
            }
        });
});

router.get("/:id", (req, res, next) => {
    const conditions = { _id: req.params.id };
    Customer.findOne(conditions)
        .then((customer) => {
            if (!customer) { throw new NotFound("No Customer exists with that ID"); }
            res.jsonp({ docs: customer });
        })
        .catch(next);
});

router.patch("/:id", (req, res, next) => {
    if (!req.body.name) { throw new BadRequest("You must provide a name"); }
    if (!req.body.email) { throw new BadRequest("You must provide a email"); }
    if (!EmailValidator.validate(req.body.email)) { throw new BadRequest("Your email is not a valid address"); }

    const data: any = {
        email: req.body.email,
        name: req.body.name,
    };

    const conditions = { _id: req.params.id };

    Customer.findOneAndUpdate(conditions, data, { new: true })
        .then((customer) => {
            if (!customer) { throw new NotFound("No Customer exists with that ID"); }
            res.jsonp({ docs: customer });
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
    const conditions = { _id: req.params.id };
    // TODO #24 Delete all Users when deleting Customer
    Customer.findOneAndRemove(conditions)
        .then((customer) => {
            if (!customer) { throw new NotFound("No Customer exists with that ID"); }
            res.jsonp({ docs: customer });
        })
        .catch(next);
});

router.get("/:id/users", (req, res, next) => {
    // TODO #21 Add support for searching Users
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const conditions = { customerId: req.params.id };

    User.paginate(conditions, { page, limit })
        .then((userPages) => res.jsonp(userPages))
        .catch(next);
});

export = router;
