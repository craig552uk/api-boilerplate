import { Router } from "express";
import { BadRequest, NotFound, Unauthorized } from "http-errors";
import { requireJWTAuth } from "../../middleware/authorisation.middleware";
import { Notification } from "../../model/notification.model";

const router = Router() as Router;

// JWT required for all routes
router.use(requireJWTAuth);

/**
 *  Get all notifications for this User
 */
router.get("/", (req, res, next) => {
    const conditions = { customerId: req.jwt.cid, userId: req.jwt.id };
    Notification.find(conditions).sort({ createdAt: -1 })
        .then((notifications) => res.jsonp({ docs: notifications }))
        .catch(next);
});

/**
 *  Add a notification for this user
 */
router.post("/", (req, res, next) => {
    // Validated submitted data
    if (!req.body.message) { throw new BadRequest("You must provide a message"); }

    // Default class to INFO or validate
    const classes = ["INFO", "WARNING", "ERROR"];
    req.body.class = req.body.class || classes[0];
    if (req.body.class && (classes.indexOf(req.body.class) < 0)) {
        throw new BadRequest(`Class must be one of ${classes.join(", ")}`);
    }

    const data = {
        class: req.body.class,
        customerId: req.jwt.cid,
        message: req.body.message,
        userId: req.jwt.id,
    };

    // TODO #27 User should receive Notifications in real-time

    new Notification(data).save()
        .then((notifications) => res.jsonp({ docs: notifications }))
        .catch(next);
});

/**
 * Delete a notification
 */
router.delete("/:id", (req, res, next) => {
    const conditions = { customerId: req.jwt.cid, userId: req.jwt.id, _id: req.params.id };
    Notification.findOneAndRemove(conditions)
        .then((notification) => {
            if (!notification) { throw new NotFound("No Notification exists with that ID"); }
            res.jsonp({ docs: notification });
        })
        .catch(next);
});

export = router;
