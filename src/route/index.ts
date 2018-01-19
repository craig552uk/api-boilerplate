import { Router } from "express";

import * as HomeRouter from "./home/home.router";

const router = Router();

router.use(HomeRouter);

export = router;
