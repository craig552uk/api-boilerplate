// Silence logger
process.env.LOG_LEVEL = "fatal";

import "mocha";
import "reflect-metadata";
import * as supertest from "supertest";
import { ApplicationService } from "./lib/application.service";

// Application instance wrapped in SuperTest utilities
export const testApplication = supertest(ApplicationService.getInstance()) as supertest.SuperTest<supertest.Test>;
