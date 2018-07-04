import * as EmailValidator from "email-validator";
import { NextFunction, Request, Response, Router } from "express";
import { BadRequest, NotFound, Unauthorized } from "http-errors";
import { requireJWTAuth } from "../../middleware/authorisation.middleware";
import { Customer } from "../../model/customer.model";

const router = Router() as Router;

// Root only access for all routes
router.use(requireJWTAuth, (req, res, next) => {
    if (!req.jwt.root) { throw new Unauthorized("Root access required"); }
    next();
});

router.get("/", (req, res, next) => {
    // TODO #21 Add support for searching Customers
    // TODO #22 Add pagination support
    Customer.find({})
        .then((customers) => res.jsonp({ data: customers }))
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
        .then((customer) => res.jsonp({ data: customer }))
        .catch(next);
});

router.get("/:id", (req, res, next) => {
    const conditions = { _id: req.params.id };
    Customer.findOne(conditions)
        .then((customer) => {
            if (!customer) { throw new NotFound("No Customer exists with that ID"); }
            res.json({ data: customer });
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
            res.json({ data: customer });
        })
        .catch(next);
});

router.delete("/:id", (req, res, next) => {
    const conditions = { _id: req.params.id };
    // TODO #24 Delete all Users when deleting Customer
    Customer.findOneAndRemove(conditions)
        .then((customer) => {
            if (!customer) { throw new NotFound("No Customer exists with that ID"); }
            res.json({ data: customer });
        })
        .catch(next);
});

router.get("/:id/users", (req, res, next) => {
    // TODO #23 Root User can get all Users for any Customer
});

export = router;
