import { Router } from "express";

import * as HomeRouter from "./home/home.router";
import * as LoginRouter from "./login/login.router";
import * as SignupRouter from "./signup/signup.router";

const router = Router();

router.use(HomeRouter);
router.use(LoginRouter);
router.use(SignupRouter);

export = router;
