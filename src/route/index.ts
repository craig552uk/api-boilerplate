import { Router } from "Express";

import * as HomeRouter from "./home/home.router";

const router = Router();

router.use(HomeRouter);

export = router;
