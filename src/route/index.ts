import { Router } from "express";

import * as CustomersRouter from "./customers/customers.router";
import * as HomeRouter from "./home/home.router";
import * as LoginRouter from "./login/login.router";
import * as NotificationsRouter from "./notifications/notifications.router";
import * as SettingsRouter from "./settings/settings.router";
import * as SignupRouter from "./signup/signup.router";
import * as UsersRouter from "./users/users.router";

const router = Router();

router.use("/", HomeRouter);
router.use("/", LoginRouter);
router.use("/", SignupRouter);
router.use("/customers/", CustomersRouter);
router.use("/notifications/", NotificationsRouter);
router.use("/settings/", SettingsRouter);
router.use("/users/", UsersRouter);

export = router;
